"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero visual — "from fragments to one ordered name, and back out into the open".
 * Loose particles (the clips, reels and playlists) are drawn together into the Al-Mahdrah
 * calligraphy at the centre, hold for a moment, then burst apart and keep drifting across the whole
 * hero behind the message. Move the pointer and the pieces lean away. Three.js is loaded lazily so
 * it never blocks first paint.
 */

const VERT = /* glsl */ `
  uniform float uT;
  uniform float uTime;
  uniform float uPixel;
  uniform vec2  uMouse;
  uniform float uE;
  uniform vec2  uHalf;
  attribute vec3  aScatter;
  attribute vec3  aField;
  attribute float aRand;
  attribute float aSize;
  varying float vRand;
  varying float vLock;
  varying float vEx;
  varying float vDim;
  void main() {
    float t = clamp(uT * 1.45 - aRand * 0.45, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - t, 3.0);
    vec3 drift = vec3(
      sin(uTime * 0.30 + aRand * 40.0),
      cos(uTime * 0.25 + aRand * 31.0),
      sin(uTime * 0.20 + aRand * 17.0)
    ) * 0.14;
    vec3 target = position * (1.0 + 0.012 * sin(uTime * 0.8 + length(position) * 3.0));
    vec3 logoP = mix(aScatter + drift, target, e);

    // the burst: every piece flies out from the name to its own place in a wide, slowly moving field
    float ex = clamp(uE, 0.0, 1.0);
    float ee = 1.0 - pow(1.0 - ex, 3.0);
    vec3 flow = vec3(
      sin(uTime * 0.18 + aRand * 50.0) * 0.55 + sin(uTime * 0.07 + aRand * 9.0) * 0.30,
      cos(uTime * 0.15 + aRand * 37.0) * 0.45 + cos(uTime * 0.09 + aRand * 13.0) * 0.30,
      sin(uTime * 0.12 + aRand * 23.0) * 0.30
    );
    vec3 field = vec3(aField.x * uHalf.x, aField.y * uHalf.y, aField.z * 1.2) + flow;
    vec3 dir = normalize(vec3(position.xy, 0.4) + 0.0001);
    float burst = sin(ex * 3.14159) * (0.8 + aRand * 1.6);
    vec3 p = mix(logoP, field, ee) + dir * burst;

    // the pieces lean away from the pointer, less so while they hold the name
    vec2 d = p.xy - uMouse;
    float f = smoothstep(0.85, 0.0, length(d));
    p.xy += normalize(d + 0.0001) * f * mix(mix(0.34, 0.12, e), 0.3, ee);

    // keep the middle of the field calmer so the message stays readable
    vec2 nrm = p.xy / uHalf;
    float centre = smoothstep(0.1, 0.8, length(vec2(nrm.x * 0.7, nrm.y)));
    vDim = mix(1.0, mix(0.22, 1.0, centre) * 0.65, ee);
    vEx = ee;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (5.0 / -mv.z) * mix(0.8, 1.0, e) * mix(1.0, 0.8, ee);
    vRand = aRand;
    vLock = e;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uPrimary;
  uniform vec3 uAccent;
  uniform float uDark;
  varying float vRand;
  varying float vLock;
  varying float vEx;
  varying float vDim;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    vec3 c = vRand < 0.28 ? uAccent : uPrimary;
    float alpha = a * mix(0.4, 0.95, vLock) * mix(0.9, 0.75, uDark) * vDim;
    gl_FragColor = vec4(c, alpha);
  }
`;

const rgb = (css: string, fallback: string): [number, number, number] => {
  const v = (css || fallback).trim();
  const m = v.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return rgb(fallback, "#1182a3");
  const n = parseInt(m[1], 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export function HeroScene({ onReveal }: { onReveal: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const revealRef = useRef(onReveal);
  useEffect(() => {
    revealRef.current = onReveal;
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    (async () => {
      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch {
        setFailed(true);
        revealRef.current();
        return;
      }
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        });
      } catch {
        setFailed(true); // no WebGL: the static logo stays as the visual
        revealRef.current();
        return;
      }
      const small = el.clientWidth < 520;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      el.prepend(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;display:block";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
      camera.position.set(0, 0, 4.5);
      const group = new THREE.Group();
      scene.add(group);

      // ---- target geometry: the Al-Mahdrah calligraphy itself, sampled from the logo file
      const LOGO_H = 2.9; // world units
      const COUNT = small ? 3200 : 5500;
      const targets: number[] = [];
      const img = new Image();
      img.src = "/assets/almahdrah-logo.png";
      try {
        await img.decode();
      } catch {
        setFailed(true);
        revealRef.current();
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      if (disposed) {
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      const SW = 360;
      const SH = Math.round((SW * img.naturalHeight) / img.naturalWidth);
      const cv = document.createElement("canvas");
      cv.width = SW;
      cv.height = SH;
      const cx = cv.getContext("2d", { willReadFrequently: true })!;
      cx.fillStyle = "#fff";
      cx.fillRect(0, 0, SW, SH);
      cx.drawImage(img, 0, 0, SW, SH);
      const px = cx.getImageData(0, 0, SW, SH).data;
      const ink: number[] = [];
      let x0 = SW,
        x1 = 0,
        y0 = SH,
        y1 = 0;
      for (let y = 0; y < SH; y++)
        for (let x = 0; x < SW; x++) {
          const i = (y * SW + x) * 4;
          if (px[i] < 140) {
            ink.push(x, y);
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      const k = LOGO_H / (y1 - y0 || 1);
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      const total = ink.length / 2;
      for (let i = 0; i < COUNT; i++) {
        const j = Math.floor(Math.random() * total) * 2;
        targets.push(
          (ink[j] + Math.random() - mx) * k,
          -(ink[j + 1] + Math.random() - my) * k,
          (Math.random() - 0.5) * 0.12,
        );
      }
      const n = targets.length / 3;

      const scatter = new Float32Array(n * 3);
      const field = new Float32Array(n * 3);
      const rand = new Float32Array(n);
      const size = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        // loose cloud, wider than the star so it feels like clutter around it
        const r = 2.2 + Math.random() * 2.6;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        scatter[i * 3] = Math.sin(ph) * Math.cos(th) * r;
        scatter[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * r * 0.8;
        scatter[i * 3 + 2] = Math.cos(ph) * r * 0.6;
        // where the piece ends up after the burst: anywhere across the hero (-1..1 of its half-size)
        field[i * 3] = (Math.random() * 2 - 1) * 1.12;
        field[i * 3 + 1] = (Math.random() * 2 - 1) * 1.12;
        field[i * 3 + 2] = Math.random() * 2 - 1;
        rand[i] = Math.random();
        size[i] = 1.8 + Math.random() * 2.6;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(targets), 3),
      );
      geo.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
      geo.setAttribute("aField", new THREE.BufferAttribute(field, 3));
      geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
      geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));

      const uniforms = {
        uT: { value: reduce ? 1 : 0 },
        uE: { value: reduce ? 1 : 0 },
        uHalf: { value: new THREE.Vector2(3, 2) },
        uTime: { value: 0 },
        uPixel: { value: dpr },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uPrimary: { value: new THREE.Vector3() },
        uAccent: { value: new THREE.Vector3() },
        uDark: { value: 0 },
      };
      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
      });
      const points = new THREE.Points(geo, mat);
      group.add(points);

      // theme-aware colours, re-read when the theme toggles
      const applyTheme = () => {
        const cs = getComputedStyle(el);
        const primary = rgb(cs.getPropertyValue("--primary"), "#1182a3");
        const accent = rgb(cs.getPropertyValue("--accent"), "#c9a24a");
        const dark =
          document.documentElement.getAttribute("data-theme") === "dark";
        uniforms.uPrimary.value.set(...primary);
        uniforms.uAccent.value.set(...accent);
        uniforms.uDark.value = dark ? 1 : 0;
        mat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        mat.needsUpdate = true;
      };
      applyTheme();
      const mo = new MutationObserver(applyTheme);
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "class"],
      });

      // the name forms large in the middle of the hero, then bursts into the field
      const logoRatio = (x1 - x0) / (y1 - y0 || 1); // width / height of the logo
      const from = { s: 1 };
      const place = (w: number, h: number) => {
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const wpp = (2 * halfH) / h; // world units per pixel
        const startH = Math.min(h * 0.6, (w * 0.8) / logoRatio, 520);
        from.s = (startH * wpp) / LOGO_H;
        // half-size of the visible area, in the group's own units (the field is spread over it)
        uniforms.uHalf.value.set((halfH * camera.aspect) / from.s, halfH / from.s);
        group.position.set(0, 0, 0);
        group.scale.setScalar(from.s);
      };
      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // keep the whole star in frame whatever the shape of the box
        camera.position.z = 4.5;
        camera.updateProjectionMatrix();
        place(w, h);
        if (reduce) renderer.render(scene, camera); // static mode has no frame loop, and setSize clears the canvas
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      // pointer → world coordinates on the z=0 plane, plus a gentle tilt
      const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
      const mouseWorld = new THREE.Vector2(99, 99);
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
        const halfH =
          Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        mouseWorld.set(nx * halfH * camera.aspect, ny * halfH);
        tilt.ty = nx * 0.18;
        tilt.tx = -ny * 0.12;
      };
      const onLeave = () => {
        mouseWorld.set(99, 99);
        tilt.tx = tilt.ty = 0;
      };
      if (!reduce) {
        window.addEventListener("pointermove", onMove, { passive: true });
        el.addEventListener("pointerleave", onLeave);
      }

      let visible = true;
      const io = new IntersectionObserver(
        ([en]) => (visible = en.isIntersecting),
        { threshold: 0 },
      );
      io.observe(el);

      const clock = new THREE.Clock();
      let raf = 0;
      let settle = 0;
      let revealed = false;
      group.scale.setScalar(from.s);
      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        uniforms.uTime.value += dt;
        if (uniforms.uT.value < 1)
          uniforms.uT.value = Math.min(1, uniforms.uT.value + dt / 2.6);
        const lock = uniforms.uT.value;
        if (lock >= 1) settle += dt;
        // hold the finished name for a beat, then burst
        const burst = Math.min(1, Math.max(0, (settle - 0.9) / 1.9));
        uniforms.uE.value = burst;
        if (!revealed && burst > 0.12) {
          revealed = true;
          revealRef.current();
        }
        uniforms.uMouse.value.set(
          (mouseWorld.x - group.position.x) / group.scale.x,
          (mouseWorld.y - group.position.y) / group.scale.x,
        );
        tilt.x += (tilt.tx - tilt.x) * 0.06;
        tilt.y += (tilt.ty - tilt.y) * 0.06;
        const sway = uniforms.uTime.value;
        group.rotation.x = tilt.x + Math.sin(sway * 0.22) * 0.05;
        group.rotation.y = tilt.y + Math.sin(sway * 0.17) * 0.1;
        group.rotation.z =
          lock >= 1 ? Math.sin(sway * 0.1) * 0.04 * (1 - burst * 0.5) : (1 - lock) * 0.3;
        renderer.render(scene, camera);
      };

      if (reduce) {
        uniforms.uT.value = 1;
        renderer.render(scene, camera);
        revealRef.current();
        const onResize = () => renderer.render(scene, camera);
        window.addEventListener("resize", onResize);
        cleanup = () => window.removeEventListener("resize", onResize);
      } else {
        clock.start();
        frame();
      }

      const prev = cleanup;
      cleanup = () => {
        prev?.();
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        io.disconnect();
        ro.disconnect();
        mo.disconnect();
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
      if (disposed) cleanup();
    })().catch((err) => {
      console.error("[hero-scene]", err);
      setFailed(true);
      revealRef.current();
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={wrap}
      className="pointer-events-none absolute inset-0 select-none"
      role="img"
      aria-label="Al-Mahdrah, in Arabic calligraphy, formed from scattered fragments drawing together."
    >
      {/* no-WebGL fallback: the logo itself */}
      {failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/assets/almahdrah-logo.png"
          alt=""
          className="absolute top-1/2 left-1/2 h-[46%] max-h-[420px] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.07] [filter:var(--logo-filter)]"
        />
      )}
    </div>
  );
}
