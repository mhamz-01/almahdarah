"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { NavLink } from "@/lib/types";

interface MobileNavProps {
  links: NavLink[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-[11px] border border-border bg-surface"
      >
        <span className="h-0.5 w-4 rounded-full bg-fg" />
        <span className="h-0.5 w-4 rounded-full bg-fg" />
        <span className="h-0.5 w-4 rounded-full bg-fg" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full flex flex-col gap-1 border-t border-border bg-surface px-5 pt-2 pb-[18px] shadow-[var(--shadow-md)]">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-[10px] px-2 py-3 font-semibold text-fg"
            >
              {link.label}
            </a>
          ))}
          <Button href="#demo" size="lg" className="mt-1.5 w-full justify-center" onClick={() => setOpen(false)}>
            Book a free demo
          </Button>
        </div>
      )}
    </div>
  );
}
