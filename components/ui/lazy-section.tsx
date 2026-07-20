"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
  minHeight?: number;
  id?: string;
  className?: string;
}

/**
 * Defers mounting server-rendered section content until it scrolls near the
 * viewport, showing a skeleton placeholder until then. Keeps content fully
 * SSR'd for SEO while staggering client-side mount/paint cost.
 */
export function LazySection({
  children,
  fallback,
  rootMargin = "200px 0px",
  minHeight,
  id,
  className,
}: LazySectionProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div
      ref={ref}
      id={id}
      className={id ? `scroll-mt-[88px] ${className ?? ""}`.trim() : className}
      style={minHeight && !visible ? { minHeight } : undefined}
    >
      {visible ? children : fallback}
    </div>
  );
}
