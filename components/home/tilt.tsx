"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";

/** Wrapper that tilts toward the cursor and shows a soft glare. Pure DOM writes — no re-render. */
export function Tilt({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transition = "transform .12s ease-out";
    el.style.transform = `perspective(1100px) rotateX(${((0.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - 0.5) * 9).toFixed(2)}deg)`;
    const g = el.querySelector<HTMLElement>("[data-glare]");
    if (g) {
      g.style.opacity = "1";
      g.style.background = `radial-gradient(circle at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgba(255,255,255,.26), transparent 45%)`;
    }
  }

  function onLeave(e: MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    el.style.transition = "transform .7s cubic-bezier(.2,.8,.2,1)";
    el.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg)";
    const g = el.querySelector<HTMLElement>("[data-glare]");
    if (g) g.style.opacity = "0";
  }

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={style}
    >
      {children}
      <div
        data-glare
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
      />
    </div>
  );
}
