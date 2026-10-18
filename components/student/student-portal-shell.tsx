"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";


interface StudentPortalShellProps {
  student: { name: string; username: string; avatarColor: string };
  unreadCount: number;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/student", num: "01", label: "Home" },
  { href: "/student/tasks", num: "02", label: "Tasks" },
  { href: "/student/courses", num: "03", label: "Courses" },
  { href: "/student/attendance", num: "04", label: "Attendance" },
  { href: "/student/notifications", num: "05", label: "Notifications", withBadge: true },
  { href: "/student/punch", num: "06", label: "Punch today's class" },
  { href: "/student/reminders", num: "07", label: "Email reminders" },
];

function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
        open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

function initialsFor(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function isActive(pathname: string, href: string) {
  if (href === "/student") return pathname === "/student";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentPortalShell({ student, unreadCount, children }: StudentPortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Close the mobile drawer on navigation — adjusted during render (React's
  // recommended pattern for resetting state when a prop changes) rather
  // than an effect, so it takes effect on the same paint as the route change.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const mq = window.matchMedia("(max-width:900px)");
    const onChange = () => setIsNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/student/logout", { method: "POST" });
    } finally {
      router.replace("/student/login");
      router.refresh();
    }
  }

  const sidebarOpen = isNarrow ? true : !collapsed;

  return (
    <div className="grid min-h-screen" style={{
        gridTemplateColumns: isNarrow ? "1fr" : collapsed ? "72px 1fr" : "320px 1fr",
        transition: "grid-template-columns 300ms ease-in-out",
      }}>
      {isNarrow && (
        <div
          onClick={() => setMobileOpen(false)}
          className={`fixed inset-0 z-[65] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      )}

      <aside
        className={`thin-scroll flex h-screen flex-col gap-5 overflow-y-auto overflow-x-hidden border-r border-border bg-surface py-5 whitespace-nowrap transition-[transform,padding] duration-300 ease-in-out ${
          isNarrow
            ? `fixed inset-y-0 left-0 z-[70] w-[320px] shadow-[var(--shadow-lg)] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
            : "sticky top-0"
        } ${isNarrow || !collapsed ? "px-4" : "px-3"}`}
      >
        <div className={`flex items-center ${sidebarOpen ? "justify-between gap-[11px]" : "justify-center"}`}>
          <div className={`flex items-center gap-[11px] overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out ${sidebarOpen ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"}`}>
              <Image
                src="/assets/almahdrah-logo.png"
                alt="Al-Mahdrah"
                width={36}
                height={36}
                className="h-9 w-auto [filter:var(--logo-filter)]"
              />
              <span className="flex flex-col leading-[1.05]">
                <span className="font-display text-[14px] text-ink">AL-MAHDRAH</span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">Student portal</span>
              </span>
          </div>
          <button
            type="button"
            onClick={() => (isNarrow ? setMobileOpen(false) : setCollapsed((c) => !c))}
            aria-label="Toggle sidebar"
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[3px] border border-border bg-bg text-text hover:border-border-strong hover:text-ink"
          >
            {isNarrow ? "✕" : collapsed ? "»" : "«"}
          </button>
        </div>

        <Collapse open={sidebarOpen}>
          <div className="flex items-center gap-3 rounded-[3px] border border-border bg-bg p-3">
            <span
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full font-display text-[15px] text-white"
              style={{ background: student.avatarColor }}
            >
              {initialsFor(student.name)}
            </span>
            <span className="flex min-w-0 flex-col leading-[1.35]">
              <span className="truncate text-[14px] font-bold text-ink">{student.name}</span>
              <span className="font-mono text-[11px] text-muted">
                {student.username}
              </span>
            </span>
          </div>
        </Collapse>

        <nav className="flex flex-col gap-1">
          <Collapse open={sidebarOpen}>
            <span className="mb-2 block text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Menu</span>
          </Collapse>
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const badge = item.withBadge && unreadCount > 0 ? unreadCount : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`relative flex w-full items-center rounded-[3px] border py-[13px] text-[14px] transition-colors hover:border-border-strong ${
                  sidebarOpen ? "gap-3 px-[14px]" : "justify-center px-0"
                } ${active ? "border-border-strong bg-bg font-bold text-ink" : "border-transparent font-medium text-text"}`}
              >
                <span className="font-mono text-[11px] opacity-65">{item.num}</span>
                <span className={`overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out ${sidebarOpen ? "max-w-[180px] flex-1 opacity-100" : "max-w-0 opacity-0"}`}>{item.label}</span>
                {badge !== null && (
                  <span className={`flex shrink-0 items-center justify-center rounded-full bg-red-600 font-mono text-white ${sidebarOpen ? "h-5 min-w-5 px-1.5 text-[10.5px]" : "absolute top-1 right-1 h-4 min-w-4 px-1 text-[9px]"}`}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          title="Sign out"
          className="mt-auto h-11 rounded-full border border-border-strong bg-transparent text-[13.5px] font-bold text-text transition-colors hover:border-ink hover:text-ink disabled:opacity-60"
        >
          {sidebarOpen ? (signingOut ? "Signing out…" : "Sign out") : "⏻"}
        </button>
      </aside>

      <main className="px-[22px] pt-[28px] pb-[70px] sm:px-[52px] sm:pt-[52px]">
        {isNarrow && (
          <div className="mb-[26px] flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-[42px] items-center gap-2.5 rounded-[3px] border border-border-strong bg-surface px-4 text-[13.5px] font-bold text-ink"
            >
              ☰ Menu
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
