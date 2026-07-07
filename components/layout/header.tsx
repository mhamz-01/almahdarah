import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { navLinks } from "@/lib/data/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-7 py-[13px]">
        <a href="#top" className="flex items-center gap-3">
          <Image
            src="/assets/almahdrah-logo.png"
            alt="Al-Mahdrah"
            width={42}
            height={42}
            priority
            className="h-[42px] w-auto [filter:var(--logo-filter)]"
          />
          <span className="hidden flex-col leading-[1.02] sm:flex">
            <span className="font-display text-[17px] tracking-[0.01em] text-ink">
              AL-MAHDRAH
            </span>
            <span className="text-[10px] tracking-[0.22em] text-muted uppercase">
              Islamic Academy
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-[30px] lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-text transition-colors hover:text-green"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-[11px]">
          <ThemeToggle />
          <div className="hidden lg:block">
            <Button href="/book-a-demo" size="sm">
              Book a free demo
            </Button>
          </div>
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}
