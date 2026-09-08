"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/admin/logout-button";

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

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="flex items-center justify-between border-b border-border bg-surface px-5 py-3.5 sm:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/assets/almahdrah-logo.png"
            alt="Al-Mahdrah"
            width={28}
            height={28}
            className="h-7 w-auto [filter:var(--logo-filter)]"
          />
          <span className="font-display text-[12.5px] tracking-[0.01em] text-ink">AL-MAHDRAH ADMIN</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong text-ink"
        >
          <MenuIcon className="h-[18px] w-[18px]" />
        </button>
      </header>

      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[90] bg-black/40 sm:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[95] flex w-[252px] shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 ease-out sm:sticky sm:top-0 sm:h-screen sm:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-[18px]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image
              src="/assets/almahdrah-logo.png"
              alt="Al-Mahdrah"
              width={30}
              height={30}
              className="h-[30px] w-auto shrink-0 [filter:var(--logo-filter)]"
            />
            <span className="font-display text-[12.5px] leading-[1.3] tracking-[0.01em] text-ink">
              AL-MAHDRAH
              <br />
              ADMIN
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:text-ink sm:hidden"
          >
            <CloseIcon className="h-[18px] w-[18px]" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3.5">
          <span className="px-3 pt-1 pb-2 text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
            Manage
          </span>
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-bold transition-colors ${
                  active ? "bg-primary text-white" : "text-muted hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {link.label}
              </Link>
            );
          })}

          <span className="px-3 pt-4 pb-2 text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
            Academy
          </span>
          {academyLinks.map((link) => {
            const active = isActive(pathname, link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-bold transition-colors ${
                  active ? "bg-primary text-white" : "text-muted hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3.5">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
