"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface WeekMiniItem {
  key: number;
  subject: string;
  mark: string;
  colorClass: string;
}

interface StudentPortalShellProps {
  student: { name: string; username: string; level: string; avatarColor: string };
  streak: number;
  streakNote: string;
  weekMini: WeekMiniItem[];
  unreadCount: number;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/student", num: "01", label: "Home" },
  { href: "/student/tasks", num: "02", label: "Tasks" },
  { href: "/student/attendance", num: "03", label: "Attendance" },
  { href: "/student/notifications", num: "04", label: "Notifications", withBadge: true },
  { href: "/student/punch", num: "05", label: "Punch today's class" },
];

function initialsFor(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function isActive(pathname: string, href: string) {
  if (href === "/student") return pathname === "/student";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentPortalShell({ student, streak, streakNote, weekMini, unreadCount, children }: StudentPortalShellProps) {
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
  const streakDots = Array.from({ length: 8 }, (_, i) => i >= 8 - Math.min(streak, 8));

  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: isNarrow ? "1fr" : collapsed ? "86px 1fr" : "308px 1fr" }}>
      {isNarrow && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-[2px]"
        />
      )}

      <aside
        className={`${isNarrow && !mobileOpen ? "hidden" : "flex"} h-screen flex-col gap-[26px] overflow-y-auto overflow-x-hidden border-r border-border bg-surface py-[26px] ${
          isNarrow
            ? `fixed inset-y-0 left-0 z-[70] w-[280px] shadow-[var(--shadow-lg)] transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
            : "sticky top-0"
        } ${isNarrow || !collapsed ? "px-[22px]" : "px-4"}`}
      >
        <div className={`flex items-center gap-[11px] ${sidebarOpen ? "justify-between" : "justify-center"}`}>
          {sidebarOpen && (
            <div className="flex items-center gap-[11px]">
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
          )}
          <button
            type="button"
            onClick={() => (isNarrow ? setMobileOpen(false) : setCollapsed((c) => !c))}
            aria-label="Toggle sidebar"
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[3px] border border-border bg-bg text-text hover:border-border-strong hover:text-ink"
          >
            {isNarrow ? "✕" : collapsed ? "»" : "«"}
          </button>
        </div>

        {sidebarOpen && (
          <div className="flex items-center gap-3 rounded-[3px] border border-border bg-bg p-3.5">
            <span
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full font-display text-[15px] text-white"
              style={{ background: student.avatarColor }}
            >
              {initialsFor(student.name)}
            </span>
            <span className="flex min-w-0 flex-col leading-[1.35]">
              <span className="truncate text-[14px] font-bold text-ink">{student.name}</span>
              <span className="font-mono text-[11px] text-muted">
                {student.username} · {student.level}
              </span>
            </span>
          </div>
        )}

        <nav className="flex flex-col gap-1">
          {sidebarOpen && (
            <span className="mb-2 text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Menu</span>
          )}
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const badge = item.withBadge && unreadCount > 0 ? unreadCount : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex w-full items-center gap-3 rounded-[3px] border py-[13px] text-[14px] transition-colors hover:border-border-strong ${
                  sidebarOpen ? "px-[14px]" : "justify-center px-0"
                } ${active ? "border-border-strong bg-bg font-bold text-ink" : "border-transparent font-medium text-text"}`}
              >
                <span className="font-mono text-[11px] opacity-65">{item.num}</span>
                {sidebarOpen && <span className="flex-1">{item.label}</span>}
                {badge !== null && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1.5 font-mono text-[10.5px] text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <>
            <div className="rounded-[3px] border border-border-strong bg-mint p-4">
              <div className="text-[11px] font-bold tracking-[0.14em] text-primary-2 uppercase">Current streak</div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="font-display text-[32px] leading-none text-ink">{streak}</span>
                <span className="text-[12.5px] text-text">weeks unbroken</span>
              </div>
              <div className="mt-3 flex gap-1">
                {streakDots.map((filled, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${filled ? "bg-primary-2" : "bg-surface-2"}`}
                    title={filled ? "Unbroken week" : "No record"}
                  />
                ))}
              </div>
              <div className="mt-2.5 font-mono text-[10.5px] text-muted">{streakNote}</div>
            </div>

            <div className="rounded-[3px] border border-border bg-bg p-4">
              <div className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">This week</div>
              <div className="mt-3 flex flex-col gap-2.5">
                {weekMini.map((m) => (
                  <div key={m.key} className="flex items-center justify-between gap-2.5">
                    <span className="text-[13px] text-text">{m.subject}</span>
                    <span className={`text-[11.5px] font-bold ${m.colorClass}`}>{m.mark}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

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
