"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Section-level particle illustrations — the hero's visual language, used to *say something* in
 * every section. Loose fragments drift, then draw themselves into a drawing that belongs to the
 * section: a book for the texts, a chain for the sanad, a road for the manhaj, steps for the levels,
 * a broadcast ring for live classes, a path for the weekly schedule, the Al-Mahdrah name at the end.
 *
 * `formation` may change at runtime (a pinned scene stepping through its points, or a persona being
 * picked): the particles then re-form from one drawing into the next. The WebGL context only exists
 * while the section is near the viewport, so the page never holds more than one or two.
 */

export type Formation =
  | "none"
  | "book"
  | "chain"
  | "road"
  | "steps"
  | "live"
  | "phones"
  | "clock"
  | "letter"
  | "people"
  | "mentor"
  | "quote"
  | "route"
  | "logo";

type Pt = [number, number];

interface Props {
  formation?: Formation;
  /** "view": assemble once when scrolled into view. "scroll": follow `progress` (0..1). */
  drive?: "view" | "scroll";
  progress?: number;
  /** where the drawing sits: x/y in -1..1 of the box (y up), size as a fraction of the box height */
  place?: { x?: number; y?: number; size?: number; top?: number };
  /** `route` formation: a polyline in 0..1 box coordinates (y down) the particles travel along */
  route?: Pt[];
  /** particles on a laptop screen (phones get ~60%) */
  count?: number;
  opacity?: number;
  /** for navy sections: light particles, additive blending */
  onDark?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ shaders */

const VERT = /* glsl */ `
  uniform float uT;
  uniform float uMorph;
  uniform float uTime;
  uniform float uPixel;
  uniform vec2  uMouse;
  attribute vec3  aScatter;
  attribute vec3  aNext;
  attribute float aRand;
  attribute float aSize;
  varying float vRand;
  varying float vLock;
  void main() {
    float t = clamp(uT * 1.5 - aRand * 0.5, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - t, 3.0);
    float m = clamp(uMorph * 1.5 - aRand * 0.5, 0.0, 1.0);
    m = m * m * (3.0 - 2.0 * m);
    vec3 drift = vec3(
      sin(uTime * 0.22 + aRand * 40.0),
      cos(uTime * 0.18 + aRand * 31.0),
      sin(uTime * 0.15 + aRand * 17.0)
    ) * mix(0.16, 0.02, e);
    vec3 target = mix(position, aNext, m);
    // a little lift mid-morph so pieces travel in an arc rather than a straight line
    target.y += sin(m * 3.14159) * 0.14 * (aRand - 0.5);
    target.y += sin(uTime * 0.7 + aRand * 20.0) * 0.01;
    vec3 p = mix(aScatter + drift, target, e);
    vec2 d = p.xy - uMouse;
    float f = smoothstep(0.7, 0.0, length(d));
    p.xy += normalize(d + 0.0001) * f * mix(0.3, 0.1, e);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (5.0 / -mv.z);
    vRand = aRand;
    vLock = e;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uPrimary;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vRand;
  varying float vLock;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    vec3 c = vRand < 0.26 ? uAccent : uPrimary;
    gl_FragColor = vec4(c, a * mix(0.5, 1.0, vLock) * uOpacity);
  }
`;

const rgb = (css: string, fallback: string): [number, number, number] => {
  const m = (css || fallback).trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return rgb(fallback, fallback);
  const n = parseInt(m[1], 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/* ---------------------------------------------------- sampled artwork (logo, glyphs) */

interface Ink {
  pts: Float32Array; // pairs, height normalised to 1, y up, centred
  ratio: number; // width / height
}
const inkCache = new Map<string, Promise<Ink>>();

function sampleInk(
  key: string,
  draw: (
    cx: CanvasRenderingContext2D,
    W: number,
    H: number,
  ) => Promise<void> | void,
  W: number,
  H: number,
) {
  let p = inkCache.get(key);
  if (!p) {
    p = (async () => {
      const cv = document.createElement("canvas");
      cv.width = W;
      cv.height = H;
      const cx = cv.getContext("2d", { willReadFrequently: true })!;
      cx.fillStyle = "#fff";
      cx.fillRect(0, 0, W, H);
      cx.fillStyle = "#000";
      await draw(cx, W, H);
      const px = cx.getImageData(0, 0, W, H).data;
      const ink: number[] = [];
      let x0 = W,
        x1 = 0,
        y0 = H,
        y1 = 0;
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++)
          if (px[(y * W + x) * 4] < 140) {
            ink.push(x, y);
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
      const h = y1 - y0 || 1;
      const pts = new Float32Array(ink.length);
      for (let i = 0; i < ink.length; i += 2) {
        pts[i] = (ink[i] - (x0 + x1) / 2) / h;
        pts[i + 1] = -(ink[i + 1] - (y0 + y1) / 2) / h;
      }
      return { pts, ratio: (x1 - x0) / h };
    })();
    inkCache.set(key, p);
  }
  return p;
}

const loadInk = (kind: Formation): Promise<Ink> | null => {
  if (kind === "logo")
    return sampleInk(
      "logo",
      async (cx, W, H) => {
        const img = new Image();
        img.src = "/assets/almahdrah-logo.png";
        await img.decode();
        cx.drawImage(
          img,
          0,
          0,
          W,
          Math.round((W * img.naturalHeight) / img.naturalWidth) || H,
        );
      },
      300,
      400,
    );
  if (kind === "letter")
    return sampleInk(
      "letter",
      (cx, W, H) => {
        cx.font =
          '700 300px "Reem Kufi", "Noto Naskh Arabic", "Segoe UI", serif';
        cx.textAlign = "center";
        cx.textBaseline = "middle";
        cx.fillText("ب", W / 2, H / 2);
      },
      360,
      360,
    );
  if (kind === "quote")
    return sampleInk(
      "quote",
      (cx, W, H) => {
        cx.font = '700 420px Georgia, "Times New Roman", serif';
        cx.textAlign = "center";
        cx.textBaseline = "middle";
        cx.fillText("“", W / 2, H / 2 + 120);
      },
      360,
      360,
    );
  return null;
};

/* ------------------------------------------------------------- stroke drawings */

interface Stroke {
  w: number;
  f: (t: number) => Pt;
}
const seg = (a: Pt, b: Pt): Stroke => ({
  w: Math.hypot(b[0] - a[0], b[1] - a[1]),
  f: (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
});
const arc = (
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
): Stroke => ({
  w: Math.abs(a1 - a0) * r,
  f: (t) => [
    cx + Math.cos(a0 + (a1 - a0) * t) * r,
    cy + Math.sin(a0 + (a1 - a0) * t) * r,
  ],
});
const circ = (cx: number, cy: number, r: number) =>
  arc(cx, cy, r, 0, Math.PI * 2);
const poly = (pts: Pt[], closed = false): Stroke[] =>
  (closed ? pts : pts.slice(0, -1)).map((p, i) =>
    seg(p, pts[(i + 1) % pts.length]),
  );
const rect = (cx: number, cy: number, w: number, h: number) =>
  poly(
    [
      [cx - w / 2, cy - h / 2],
      [cx + w / 2, cy - h / 2],
      [cx + w / 2, cy + h / 2],
      [cx - w / 2, cy + h / 2],
    ],
    true,
  );
/** a simple person: head + shoulders + body, `s` = height scale, base = feet y */
const person = (cx: number, base: number, s: number): Stroke[] => [
  circ(cx, base + 0.62 * s, 0.1 * s),
  arc(cx, base + 0.3 * s, 0.2 * s, 0, Math.PI),
  seg([cx - 0.2 * s, base + 0.3 * s], [cx - 0.2 * s, base]),
  seg([cx + 0.2 * s, base + 0.3 * s], [cx + 0.2 * s, base]),
  seg([cx - 0.2 * s, base], [cx + 0.2 * s, base]),
];

/** unit drawings: y up, ~1 tall, centred; `w` = full width in the same units */
function drawing(kind: Formation): { strokes: Stroke[]; w: number } | null {
  const S: Stroke[] = [];
  switch (kind) {
    case "book": {
      for (const sg of [-1, 1]) {
        S.push(
          ...poly(
            [
              [sg * 0.5, 0.26],
              [0, 0.32],
              [0, -0.32],
              [sg * 0.5, -0.26],
            ],
            true,
          ),
        );
        for (let k = 0; k < 6; k++) {
          const y0 = 0.2 - k * 0.075;
          const len = k === 5 ? 0.45 : 0.82 + ((k * 37) % 10) / 80;
          const x1 = 0.06 + 0.38 * len;
          S.push(seg([sg * 0.06, y0 - 0.12 * 0.06], [sg * x1, y0 - 0.12 * x1]));
        }
      }
      S.push(
        ...poly([
          [-0.55, -0.3],
          [0, -0.39],
          [0.55, -0.3],
        ]),
      );
      return { strokes: S, w: 1.1 };
    }
    case "chain": {
      const nodes: Pt[] = Array.from({ length: 6 }, (_, j) => [
        -1 + j * 0.4,
        Math.sin(j * 1.15) * 0.16,
      ]);
      nodes.forEach((n, j) => {
        S.push(circ(n[0], n[1], j === 5 ? 0.1 : 0.07));
        if (j === 5) S.push(circ(n[0], n[1], 0.035));
        if (j < 5) {
          const m = nodes[j + 1];
          const L = Math.hypot(m[0] - n[0], m[1] - n[1]);
          const r0 = 0.07 / L,
            r1 = 1 - (j === 4 ? 0.1 : 0.07) / L;
          S.push(
            seg(
              [n[0] + (m[0] - n[0]) * r0, n[1] + (m[1] - n[1]) * r0],
              [n[0] + (m[0] - n[0]) * r1, n[1] + (m[1] - n[1]) * r1],
            ),
          );
        }
      });
      return { strokes: S, w: 2.3 };
    }
    case "road": {
      S.push(
        seg([-0.5, -0.5], [-0.045, 0.12]),
        seg([0.5, -0.5], [0.045, 0.12]),
        seg([-0.55, 0.12], [-0.12, 0.12]),
        seg([0.12, 0.12], [0.55, 0.12]),
      );
      [
        [-0.46, -0.36],
        [-0.3, -0.2],
        [-0.16, -0.08],
        [-0.06, 0.02],
      ].forEach(([a, b]) => S.push(seg([0, a], [0, b])));
      // sunrise at the end of the road, with rays
      S.push(arc(0, 0.12, 0.15, 0, Math.PI));
      for (let k = 1; k < 6; k++) {
        const a = (k * Math.PI) / 6;
        S.push(
          seg(
            [Math.cos(a) * 0.22, 0.12 + Math.sin(a) * 0.22],
            [Math.cos(a) * 0.32, 0.12 + Math.sin(a) * 0.32],
          ),
        );
      }
      return { strokes: S, w: 1.1 };
    }
    case "steps": {
      S.push(
        ...poly([
          [-0.5, -0.45],
          [-0.5, -0.3],
          [-0.3, -0.3],
          [-0.3, -0.15],
          [-0.1, -0.15],
          [-0.1, 0],
          [0.1, 0],
          [0.1, 0.15],
          [0.3, 0.15],
          [0.3, 0.3],
        ]),
      );
      S.push(
        seg([-0.55, -0.45], [0.55, -0.45]),
        seg([0.3, 0.3], [0.3, 0.52]),
        ...poly(
          [
            [0.3, 0.52],
            [0.5, 0.46],
            [0.3, 0.4],
          ],
          true,
        ),
      );
      return { strokes: S, w: 1.1 };
    }
    case "live": {
      S.push(
        circ(0, 0, 0.26),
        ...poly(
          [
            [-0.07, -0.12],
            [-0.07, 0.12],
            [0.13, 0],
          ],
          true,
        ),
      );
      for (const r of [0.4, 0.54]) {
        S.push(
          arc(0, 0, r, -0.6, 0.6),
          arc(0, 0, r, Math.PI - 0.6, Math.PI + 0.6),
        );
      }
      return { strokes: S, w: 1.2 };
    }
    case "phones": {
      [
        [-0.42, 0.04],
        [0, -0.05],
        [0.42, 0.06],
      ].forEach(([x, y]) => {
        S.push(
          ...rect(x, y, 0.3, 0.58),
          seg([x - 0.05, y + 0.25], [x + 0.05, y + 0.25]),
        );
        S.push(
          ...poly(
            [
              [x - 0.04, y - 0.06],
              [x - 0.04, y + 0.06],
              [x + 0.06, y],
            ],
            true,
          ),
        );
      });
      return { strokes: S, w: 1.2 };
    }
    case "clock": {
      S.push(circ(0, 0, 0.42), circ(0, 0, 0.02));
      for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI) / 6;
        const r0 = k % 3 === 0 ? 0.33 : 0.37;
        S.push(
          seg(
            [Math.cos(a) * r0, Math.sin(a) * r0],
            [Math.cos(a) * 0.42, Math.sin(a) * 0.42],
          ),
        );
      }
      S.push(seg([0, 0], [0, 0.28]), seg([0, 0], [0.19, -0.08]));
      return { strokes: S, w: 0.9 };
    }
    case "people": {
      S.push(
        ...person(-0.2, -0.36, 1),
        ...person(0.24, -0.36, 0.6),
        circ(0.02, 0.5, 0.0001),
      );
      // a heart above them
      const heart: Stroke = {
        w: 0.9,
        f: (t) => {
          const a = t * Math.PI * 2;
          return [
            0.02 + 0.016 * 16 * Math.sin(a) ** 3 * 0.55,
            0.52 +
              0.0135 *
                (13 * Math.cos(a) -
                  5 * Math.cos(2 * a) -
                  2 * Math.cos(3 * a) -
                  Math.cos(4 * a)) *
                0.55,
          ];
        },
      };
      S.push(heart);
      return { strokes: S, w: 1 };
    }
    case "mentor": {
      S.push(...person(-0.34, -0.36, 1), ...person(0.34, -0.36, 1));
      S.push({
        w: 0.9,
        f: (t) => [-0.34 + 0.68 * t, 0.36 + Math.sin(t * Math.PI) * 0.16],
      });
      S.push(
        ...poly(
          [
            [-0.09, -0.1],
            [0, -0.04],
            [0.09, -0.1],
            [0.09, -0.2],
            [0, -0.14],
            [-0.09, -0.2],
          ],
          true,
        ),
      );
      return { strokes: S, w: 1.3 };
    }
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ targets */

interface Ctx {
  n: number;
  visW: number;
  visH: number;
  place: { x: number; y: number; size: number; top?: number };
  route?: Pt[];
  ink: Ink | null;
  /** box height in px, for `place.top` */
  h: number;
}

function buildTargets(kind: Formation, c: Ctx): Float32Array | null {
  if (kind === "none") return null;
  const out = new Float32Array(c.n * 3);
  const put = (i: number, x: number, y: number) => {
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = rnd(-0.04, 0.04);
  };

  if (kind === "route") {
    const r = c.route;
    if (!r || r.length < 2) return null;
    const lens: number[] = [];
    let total = 0;
    for (let i = 0; i < r.length - 1; i++) {
      total += Math.hypot(
        (r[i + 1][0] - r[i][0]) * c.visW,
        (r[i + 1][1] - r[i][1]) * c.visH,
      );
      lens.push(total);
    }
    for (let i = 0; i < c.n; i++) {
      const d = Math.random() * total;
      let j = lens.findIndex((l) => l >= d);
      if (j < 0) j = lens.length - 1;
      const prev = j ? lens[j - 1] : 0;
      const t = (d - prev) / (lens[j] - prev || 1);
      const x = r[j][0] + (r[j + 1][0] - r[j][0]) * t;
      const y = r[j][1] + (r[j + 1][1] - r[j][1]) * t;
      put(
        i,
        (x - 0.5) * c.visW,
        (0.5 - y) * c.visH + rnd(-0.012, 0.012) * c.visH,
      );
    }
    return out;
  }

  let strokes: Stroke[] | null = null;
  let w = 1;
  let ink: Ink | null = null;
  if (kind === "logo" || kind === "letter" || kind === "quote") {
    ink = c.ink;
    if (!ink) return null;
    w = ink.ratio;
  } else {
    const d = drawing(kind);
    if (!d) return null;
    strokes = d.strokes;
    w = d.w;
  }
  const H = Math.min(
    c.place.size * Math.min(c.visH, c.visW * 0.75),
    (0.94 * c.visW) / w,
  );
  const cx = (c.place.x * c.visW) / 2;
  const cy =
    c.place.top !== undefined
      ? c.visH / 2 - c.place.top * (c.visH / c.h)
      : (c.place.y * c.visH) / 2;

  if (ink) {
    const total = ink.pts.length / 2;
    for (let i = 0; i < c.n; i++) {
      const j = Math.floor(Math.random() * total) * 2;
      put(
        i,
        cx + (ink.pts[j] + rnd(-0.004, 0.004)) * H,
        cy + (ink.pts[j + 1] + rnd(-0.004, 0.004)) * H,
      );
    }
    return out;
  }

  const cum: number[] = [];
  let tot = 0;
  for (const s of strokes!) cum.push((tot += s.w));
  for (let i = 0; i < c.n; i++) {
    const d = Math.random() * tot;
    let j = cum.findIndex((v) => v >= d);
    if (j < 0) j = cum.length - 1;
    const [px, py] = strokes![j].f(Math.random());
    put(
      i,
      cx + (px + rnd(-0.005, 0.005)) * H,
      cy + (py + rnd(-0.005, 0.005)) * H,
    );
  }
  return out;
}

/* ---------------------------------------------------------------- component */

export function ParticleField({
  formation = "none",
  drive = "view",
  progress = 0,
  place,
  route,
  count,
  opacity,
  onDark = false,
  className = "",
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const progressRef = useRef(progress);
  const formationRef = useRef(formation);
  const apiRef = useRef<{ setFormation: (k: Formation) => void } | null>(null);
  const played = useRef(false);
  const px = place?.x ?? 0;
  const py = place?.y ?? 0;
  const ps = place?.size ?? 0.8;
  const pt = place?.top;

  useEffect(() => {
    progressRef.current = progress;
    formationRef.current = formation;
    apiRef.current?.setFormation(formation);
  });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => setActive(en.isIntersecting),
      { rootMargin: "160px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !active) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
        });
      } catch {
        return;
      }
      let cur: Formation = formationRef.current;
      let ink = loadInk(cur) ? await loadInk(cur)!.catch(() => null) : null;
      if (disposed) {
        renderer.dispose();
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      el.prepend(renderer.domElement);
      renderer.domElement.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;display:block";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
      camera.position.z = 5;
      const small = el.clientWidth < 700;
      const N = Math.round(
        (count ?? (cur === "none" ? 200 : 1100)) * (small ? 0.65 : 1),
      );

      const uniforms = {
        uT: {
          value:
            reduce || (cur !== "none" && drive === "view" && played.current)
              ? 1
              : 0,
        },
        uMorph: { value: 0 },
        uTime: { value: 0 },
        uPixel: { value: dpr },
        uMouse: { value: new THREE.Vector2(99, 99) },
        uPrimary: { value: new THREE.Vector3() },
        uAccent: { value: new THREE.Vector3() },
        uOpacity: { value: opacity ?? (cur === "none" ? 0.5 : 0.8) },
      };
      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
      });
      const geo = new THREE.BufferGeometry();
      scene.add(new THREE.Points(geo, mat));

      const rand = new Float32Array(N);
      const size = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        rand[i] = Math.random();
        size[i] = 1.5 + Math.random() * 2.3;
      }
      geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
      geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));

      const applyTheme = () => {
        const dark =
          document.documentElement.getAttribute("data-theme") === "dark";
        if (onDark) {
          uniforms.uPrimary.value.set(...rgb("#3ba6c6", "#3ba6c6"));
          uniforms.uAccent.value.set(...rgb("#c9a24a", "#c9a24a"));
        } else {
          const cs = getComputedStyle(el);
          uniforms.uPrimary.value.set(
            ...rgb(cs.getPropertyValue("--primary"), "#1182a3"),
          );
          uniforms.uAccent.value.set(
            ...rgb(cs.getPropertyValue("--accent"), "#c9a24a"),
          );
        }
        mat.blending =
          onDark || dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        mat.needsUpdate = true;
      };
      applyTheme();
      const mo = new MutationObserver(applyTheme);
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "class"],
      });

      let visW = 1;
      let visH = 1;
      const ctx = (): Ctx => ({
        n: N,
        visW,
        visH,
        place: { x: px, y: py, size: ps, top: pt },
        route,
        ink,
        h: el.clientHeight || 1,
      });
      let scatter = new Float32Array(N * 3);
      const attr = (name: string, arr: Float32Array) => {
        const a = geo.getAttribute(name) as
          import("three").BufferAttribute | undefined;
        if (a && a.array.length === arr.length) {
          (a.array as Float32Array).set(arr);
          a.needsUpdate = true;
        } else
          geo.setAttribute(name, new THREE.BufferAttribute(arr.slice(), 3));
      };
      const rebuild = () => {
        scatter = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          scatter[i * 3] = rnd(-0.58, 0.58) * visW;
          scatter[i * 3 + 1] = rnd(-0.58, 0.58) * visH;
          scatter[i * 3 + 2] = rnd(-1.4, 0.8);
        }
        const tgt = buildTargets(cur, ctx()) ?? scatter;
        attr("aScatter", scatter);
        attr("position", tgt);
        attr("aNext", tgt);
        geo.computeBoundingSphere();
        if (geo.boundingSphere) geo.boundingSphere.radius = 1e4;
      };

      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        visW = visH * camera.aspect;
        rebuild();
        if (reduce) renderer.render(scene, camera);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      // re-form into another drawing
      let morphing = false;
      let morphT = 0;
      let pending: Formation | null = null;
      const startMorph = async (kind: Formation) => {
        if (kind === cur || kind === "none") return;
        if (morphing) {
          pending = kind;
          return;
        }
        const loader = loadInk(kind);
        const next = loader ? await loader.catch(() => null) : null;
        if (disposed) return;
        ink = next;
        const tgt = buildTargets(kind, ctx());
        if (!tgt) return;
        attr("aNext", tgt);
        cur = kind;
        if (reduce) {
          attr("position", tgt);
          renderer.render(scene, camera);
          return;
        }
        morphing = true;
        morphT = 0;
      };
      apiRef.current = { setFormation: (k) => void startMorph(k) };

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        if (
          e.clientY < r.top ||
          e.clientY > r.bottom ||
          e.clientX < r.left ||
          e.clientX > r.right
        ) {
          uniforms.uMouse.value.set(99, 99);
          return;
        }
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
        uniforms.uMouse.value.set((nx * visW) / 2, (ny * visH) / 2);
      };

      const clock = new THREE.Clock();
      let raf = 0;
      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (document.hidden) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        uniforms.uTime.value += dt;
        if (cur !== "none") {
          if (drive === "scroll") {
            uniforms.uT.value +=
              (progressRef.current - uniforms.uT.value) * 0.08;
          } else if (uniforms.uT.value < 1) {
            uniforms.uT.value = Math.min(1, uniforms.uT.value + dt / 2.8);
            if (uniforms.uT.value >= 1) played.current = true;
          }
        }
        if (morphing) {
          morphT += dt / 1.3;
          uniforms.uMorph.value = Math.min(1, morphT);
          if (morphT >= 1) {
            const nx = geo.getAttribute(
              "aNext",
            ) as import("three").BufferAttribute;
            attr("position", nx.array as Float32Array);
            uniforms.uMorph.value = 0;
            morphing = false;
            if (pending) {
              const k = pending;
              pending = null;
              void startMorph(k);
            }
          }
        }
        renderer.render(scene, camera);
      };

      if (reduce) {
        uniforms.uT.value = cur === "none" ? 0 : 1;
        renderer.render(scene, camera);
      } else {
        window.addEventListener("pointermove", onMove, { passive: true });
        clock.start();
        frame();
      }
      // the formation may have changed while the scene was loading
      void startMorph(formationRef.current);

      cleanup = () => {
        apiRef.current = null;
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        ro.disconnect();
        mo.disconnect();
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
      if (disposed) cleanup();
    })().catch(() => {});

    return () => {
      disposed = true;
      cleanup?.();
    };
    // `formation` is deliberately absent: changes are handled by morphing, not by rebuilding.
  }, [active, drive, count, opacity, onDark, px, py, ps, pt, route]);

  return (
    <div
      ref={wrap}
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
    />
  );
}
