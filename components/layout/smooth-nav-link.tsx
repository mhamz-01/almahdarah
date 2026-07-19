"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

interface SmoothNavLinkProps {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onNavigate?: () => void;
}

export function SmoothNavLink({
  href,
  className,
  style,
  children,
  onNavigate,
}: SmoothNavLinkProps) {
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();

    const hashIndex = href.indexOf("#");
    if (hashIndex === -1 || pathname !== "/") return;

    const hash = href.slice(hashIndex);
    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", hash);
  }

  return (
    <a href={href} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
}
