"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { CloseIcon, LogOutIcon, MenuIcon, MoonIcon, SunIcon } from "@/components/student/portal-icons";

interface NavLink {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.JSX.Element;
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.25" y="3.25" width="7.5" height="7.5" rx="1.75" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.25" y="3.25" width="7.5" height="4.5" rx="1.75" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.25" y="9.75" width="7.5" height="11" rx="1.75" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.25" y="13.25" width="7.5" height="7.5" rx="1.75" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function QuotesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M9.5 6.5H5.75a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5H8c0 2.2-1.3 3.6-3 4.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.25 6.5h-3.75a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h2.25c0 2.2-1.3 3.6-3 4.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScheduleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TasksIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4.25" y="4.25" width="15.5" height="15.5" rx="2.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.25l2.5 2.5L16.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StudentsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 19c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M15 8.25a2.75 2.75 0 1 1 1.85 4.78M20 19c0-2.53-1.77-4.65-4.14-5.19"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NotesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5.25 4.75A1.5 1.5 0 0 1 6.75 3.25h8.5l3.5 3.5v12a1.5 1.5 0 0 1-1.5 1.5H6.75a1.5 1.5 0 0 1-1.5-1.5v-14Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.75 10.5h6.5M8.75 13.75h6.5M8.75 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const links: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/quotes", label: "Quotes", icon: QuotesIcon },
];

const academyLinks: NavLink[] = [
  { href: "/admin/schedule", label: "Class schedule", icon: ScheduleIcon },
  { href: "/admin/tasks", label: "Tasks", icon: TasksIcon },
  { href: "/admin/students", label: "Students", icon: StudentsIcon },
  { href: "/admin/courses", label: "Lecture notes", icon: NotesIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const itemBase = "group relative flex h-10 w-full items-center gap-3 rounded-[10px] px-3 text-[14px] transition-colors";

function NavSection({ title, items, pathname }: { title: string; items: NavLink[]; pathname: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="mb-1.5 px-3 font-mono text-[10.5px] tracking-[0.1em] text-muted uppercase">{title}</span>
      {items.map((link) => {
        const active = isActive(pathname, link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`${itemBase} ${active ? "bg-primary-soft font-semibold text-primary" : "font-medium text-text hover:bg-surface-2 hover:text-ink"}`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="min-w-0 flex-1 truncate">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function Brand({ trailing }: { trailing?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
        <Image src="/assets/almahdrah-logo.png" alt="Al-Mahdrah" width={32} height={32} className="h-8 w-8 shrink-0 object-contain [filter:var(--logo-filter)]" />
        <span className="flex min-w-0 flex-col leading-[1.1]">
          <span className="truncate text-[15px] font-semibold tracking-[-0.02em] text-ink">Al-Mahdrah</span>
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-primary uppercase">Admin portal</span>
        </span>
      </Link>
      {trailing}
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const isDark = mounted && resolvedTheme === "dark";
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Close the drawer on navigation (adjusted during render, so it closes on the same paint).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <>
      {/* Phone: top bar */}
      <header className="sticky top-0 z-[60] flex items-center justify-between border-b border-border bg-paper/85 px-4 py-3 backdrop-blur-md sm:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border text-ink transition-colors hover:bg-surface-2"
        >
          <MenuIcon />
        </button>
      </header>

      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 sm:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        aria-label="Admin portal"
        className={`thin-scroll fixed inset-y-0 left-0 z-[95] flex w-[264px] shrink-0 flex-col overflow-y-auto border-r border-border bg-surface px-3 py-4 shadow-[var(--shadow-lg)] transition-transform duration-300 ease-in-out sm:sticky sm:top-0 sm:h-screen sm:w-[248px] sm:translate-x-0 sm:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Brand
          trailing={
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink sm:hidden"
            >
              <CloseIcon />
            </button>
          }
        />

        <nav className="mt-6 flex flex-col gap-5">
          <NavSection title="Manage" items={links} pathname={pathname} />
          <NavSection title="Academy" items={academyLinks} pathname={pathname} />
        </nav>

        {/* Footer: theme + sign out */}
        <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-3">
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Dark mode"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`${itemBase} font-medium text-text hover:bg-surface-2 hover:text-ink`}
          >
            {isDark ? <MoonIcon className="h-[18px] w-[18px] shrink-0" /> : <SunIcon className="h-[18px] w-[18px] shrink-0" />}
            <span className="flex-1 text-left">Dark mode</span>
            <span aria-hidden className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${isDark ? "bg-primary" : "bg-border-strong"}`}>
              <span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${isDark ? "translate-x-4" : "translate-x-0"}`} />
            </span>
          </button>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className={`${itemBase} font-medium text-text hover:bg-red-600/[0.07] hover:text-red-600 disabled:opacity-60`}
          >
            <LogOutIcon className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 text-left">{signingOut ? "Signing out…" : "Sign out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
