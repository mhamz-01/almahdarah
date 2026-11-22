"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";

const links = [
  { label: "Method", href: "/#method" },
  { label: "Journey", href: "/#free" },
  { label: "Programmes", href: "/#programmes" },
  { label: "Teachers", href: "/#teachers" },
  { label: "Reviews", href: "/reviews" },
  { label: "Quotes", href: "/quotes" },
];

/**
 * A floating, rounded "island" nav: it sits a little below the top edge, tightens once you scroll,
 * and on phones the same pill grows downward to hold the menu.
 */
export function HomeHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState<{ left: number; width: number } | null>(
    null,
  );
  const pathname = usePathname();
  // on the home page the nav waits until the opening animation has played
  const [heroDone, setReady] = useState(false);
  const ready = pathname !== "/" || heroDone;
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const dark = mounted && resolvedTheme === "dark";
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    const show = () => setReady(true);
    if (document.documentElement.hasAttribute("data-hero-ready")) {
      const id = window.setTimeout(show, 0);
      return () => window.clearTimeout(id);
    }
    window.addEventListener("hero:ready", show);
    const fallback = window.setTimeout(show, 9000); // never leave the page without a nav
    return () => {
      window.removeEventListener("hero:ready", show);
      window.clearTimeout(fallback);
      setReady(false); // back on the home page the opening plays again
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the menu when the route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hover = (el: HTMLElement) =>
    setBubble({ left: el.offsetLeft, width: el.offsetWidth });

  const isActive = (href: string) => !href.includes("#") && pathname === href;

  return (
    <>
      {/* tap-away backdrop for the open phone menu */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-[rgba(8,20,34,.35)] backdrop-blur-[3px] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] sm:px-5 sm:pt-4 ${
          ready ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
        }`}
        aria-hidden={!ready}
      >
        <div
          className={`${ready ? "pointer-events-auto" : "pointer-events-none"} mx-auto overflow-hidden rounded-[28px] border backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
            scrolled || open
              ? "max-w-[1000px] border-border-strong bg-[color-mix(in_srgb,var(--paper)_82%,transparent)] shadow-[0_18px_40px_-18px_rgba(14,42,71,.45),inset_0_1px_0_rgba(255,255,255,.35)]"
              : "max-w-[1280px] border-border bg-[color-mix(in_srgb,var(--paper)_58%,transparent)] shadow-[0_10px_30px_-20px_rgba(14,42,71,.35),inset_0_1px_0_rgba(255,255,255,.3)]"
          }`}
        >
          {/* the bar */}
          <div className="flex h-14 items-center justify-between gap-3 pr-2 pl-4 sm:pr-2.5 sm:pl-5">
            <Link
              href="/"
              className="flex items-center gap-2.5 whitespace-nowrap text-ink"
              onClick={() => setOpen(false)}
            >
              <Image
                src="/assets/almahdrah-logo.png"
                alt=""
                width={28}
                height={28}
                priority
                className="h-7 w-auto [filter:var(--logo-filter)]"
              />
              <span className="text-[15.5px] font-bold tracking-[-0.02em]">
                Al-Mahdrah
              </span>
            </Link>

            {/* desktop links, with a bubble that glides to the hovered one */}
            <nav
              ref={navRef}
              onMouseLeave={() => setBubble(null)}
              className="relative hidden items-center lg:flex"
              aria-label="Main"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 h-9 -translate-y-1/2 rounded-full bg-primary-soft transition-[left,width,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]"
                style={{
                  left: bubble?.left ?? 0,
                  width: bubble?.width ?? 0,
                  opacity: bubble ? 1 : 0,
                }}
              />
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onMouseEnter={(e) => hover(e.currentTarget)}
                  onFocus={(e) => hover(e.currentTarget)}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`relative rounded-full px-3.5 py-2 text-[13.5px] font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive(l.href)
                      ? "text-primary"
                      : "text-text hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <button
                type="button"
                onClick={() => setTheme(dark ? "light" : "dark")}
                aria-label="Toggle colour theme"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-primary-soft"
              >
                <span
                  className="h-[14px] w-[14px] rounded-full border-[1.5px] border-ink"
                  style={{ background: dark ? "var(--ink)" : "transparent" }}
                />
              </button>
              <Link
                href="/book-a-demo"
                className="hidden h-10 items-center rounded-full bg-primary px-5 text-[13.5px] font-semibold text-primary-ink transition-all duration-200 ease-out hover:-translate-y-px hover:shadow-[0_10px_22px_-10px_rgba(17,130,163,.75)] sm:inline-flex"
              >
                Book a free class
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full bg-ink/[0.06] transition-colors hover:bg-ink/10 lg:hidden"
              >
                <span
                  className={`h-0.5 w-4 rounded-full bg-ink transition-transform duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`}
                />
                <span
                  className={`h-0.5 w-4 rounded-full bg-ink transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
                />
                <span
                  className={`h-0.5 w-4 rounded-full bg-ink transition-transform duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* phone menu: the pill grows downward to hold it */}
          <div
            id="mobile-menu"
            aria-hidden={!open}
            className={`grid transition-[grid-template-rows,opacity] duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] lg:hidden ${
              open
                ? "grid-rows-[1fr] opacity-100"
                : "pointer-events-none grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="max-h-[calc(100svh-120px)] overflow-y-auto px-3 pb-3">
                <div className="mx-1 h-px bg-border" />
                <ul className="mt-1 flex flex-col">
                  {links.map((l, i) => (
                    <li
                      key={l.href}
                      className="transition-[opacity,transform] duration-500"
                      style={{
                        opacity: open ? 1 : 0,
                        transform: open ? "none" : "translateY(-8px)",
                        transitionDelay: open ? `${80 + i * 45}ms` : "0ms",
                      }}
                    >
                      <Link
                        href={l.href}
                        tabIndex={open ? 0 : -1}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-2xl px-3 py-3.5 text-[17px] font-medium tracking-[-0.01em] text-ink transition-colors active:bg-primary-soft"
                      >
                        {l.label}
                        <span aria-hidden className="text-muted">
                          â†’
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/book-a-demo"
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  className="mt-2 flex h-[52px] items-center justify-center gap-2 rounded-full bg-primary text-[15.5px] font-semibold text-primary-ink sm:hidden"
                >
                  Book a free class <span aria-hidden>â†’</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
