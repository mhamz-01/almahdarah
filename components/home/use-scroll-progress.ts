"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Progress (0..1) through a tall "pinned" section: 0 when its top reaches the viewport top,
 * 1 when its bottom reaches the viewport bottom. Rounded to 0.5% so scrolling doesn't re-render
 * on every pixel.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const next = total <= 0 ? 0 : Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
      setProgress(Math.round(next * 200) / 200);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, progress };
}
