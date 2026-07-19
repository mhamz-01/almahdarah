"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SmoothNavLink } from "@/components/layout/smooth-nav-link";
import type { NavLink } from "@/lib/types";

interface MobileNavProps {
  links: NavLink[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-[11px] border border-border bg-surface transition-colors duration-200 hover:border-primary"
      >
        <span
          className={`h-0.5 w-4 rounded-full bg-fg transition-transform duration-300 ease-out ${
            open ? "translate-y-[6.5px] rotate-45" : ""
          }`}
        />
        <span
          className={`h-0.5 w-4 rounded-full bg-fg transition-opacity duration-200 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`h-0.5 w-4 rounded-full bg-fg transition-transform duration-300 ease-out ${
            open ? "-translate-y-[6.5px] -rotate-45" : ""
          }`}
        />
      </button>

      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-4 top-[calc(100%+10px)] z-40 origin-top overflow-hidden rounded-[20px] border border-border bg-surface p-2 shadow-[var(--shadow-lg)] transition-all duration-300 ease-out ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1">
          {links.map((link, i) => (
            <SmoothNavLink
              key={link.href}
              href={link.href}
              onNavigate={() => setOpen(false)}
              style={{ transitionDelay: open ? `${i * 40 + 80}ms` : "0ms" }}
              className={`rounded-[12px] px-4 py-3 font-semibold text-fg transition-all duration-300 ease-out hover:bg-surface-2 hover:text-primary ${
                open ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"
              }`}
            >
              {link.label}
            </SmoothNavLink>
          ))}
        </nav>
        <div className="mt-1 border-t border-border p-2 pt-3">
          <Button href="/book-a-demo" size="lg" className="w-full justify-center" onClick={() => setOpen(false)}>
            Book a free demo
          </Button>
        </div>
      </div>
    </div>
  );
}
