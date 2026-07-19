"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoLoader } from "@/components/ui/logo-loader";

const MIN_VISIBLE_MS = 550;
const SAFETY_TIMEOUT_MS = 8000;

export function RouteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const shownAtRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hide once this route has mounted, respecting a minimum visible time so
  // fast navigations still read as a deliberate transition, not a flicker.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const elapsed = Date.now() - shownAtRef.current;
    const wait = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    timerRef.current = setTimeout(() => setVisible(false), wait);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  // Show again the moment a real internal navigation is triggered, before
  // the new route has actually loaded.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Same-page hash links (incl. smooth-scroll nav) don't navigate — skip them.
      if (url.pathname === window.location.pathname && url.hash) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      shownAtRef.current = Date.now();
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), SAFETY_TIMEOUT_MS);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-bg transition-opacity duration-500 ease-out ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="bg-pattern pointer-events-none absolute inset-0 opacity-40" />
      <LogoLoader className="relative" />
    </div>
  );
}
