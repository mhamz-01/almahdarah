"use client";

import { useEffect, useState, type ReactNode } from "react";
import { HeroScene } from "./hero-scene";

/**
 * Opening sequence: the Al-Mahdrah name forms in the middle of the screen, glides to the right,
 * and only then does the message appear on the left. The copy is server-rendered and handed in as
 * children; its entrance animations stay paused (see `[data-hero="wait"]` in globals.css) until
 * the scene reports that the name has started to move.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);

  // tell the nav it can appear: it stays hidden while the name is still forming
  useEffect(() => {
    if (!shown) return;
    document.documentElement.setAttribute("data-hero-ready", "true");
    window.dispatchEvent(new Event("hero:ready"));
  }, [shown]);

  useEffect(
    () => () => document.documentElement.removeAttribute("data-hero-ready"),
    [],
  );

  return (
    <section
      id="top"
      data-hero={shown ? "play" : "wait"}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
    >
      <HeroScene onReveal={() => setShown(true)} />
      {children}
    </section>
  );
}
