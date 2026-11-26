"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { SIDEBAR_COOKIE } from "@/lib/student-sidebar";
import type { EmailRemindersProps } from "@/components/student/email-reminders";
import { SettingsModal, type SettingsSection, type StudentProfile } from "@/components/student/settings-modal";
import {
  AttendanceIcon,
  BellIcon,
  CloseIcon,
  CoursesIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  PanelLeftIcon,
  SettingsIcon,
  SunIcon,
  TasksIcon,
} from "@/components/student/portal-icons";

const EXPANDED_WIDTH = 248;
const COLLAPSED_WIDTH = 68;

interface StudentPortalShellProps {
  student: StudentProfile;
  emailPrefs: EmailRemindersProps;
  unreadCount: number;
  initialCollapsed: boolean;
  children: ReactNode;
}

const NAV_ITEMS: { href: string; label: string; icon: (p: { className?: string }) => ReactNode; withBadge?: boolean }[] = [
  { href: "/student", label: "Home", icon: HomeIcon },
  { href: "/student/tasks", label: "Tasks", icon: TasksIcon },
  { href: "/student/courses", label: "Courses", icon: CoursesIcon },
  { href: "/student/attendance", label: "Attendance", icon: AttendanceIcon },
  { href: "/student/notifications", label: "Notifications", icon: BellIcon, withBadge: true },
];

function initialsFor(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function isActive(pathname: string, href: string) {
  if (href === "/student") return pathname === "/student";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Label shown beside an icon when the sidebar is collapsed. */
function Tip({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return (
    <span className="pointer-events-none absolute top-1/2 left-full z-[80] ml-3 -translate-y-1/2 rounded-md bg-ink px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-paper opacity-0 shadow-[var(--shadow-md)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
      {children}
    </span>
  );
}

function useThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const isDark = mounted && resolvedTheme === "dark";
  return { isDark, mounted, toggle: () => setTheme(isDark ? "light" : "dark") };
}

export function StudentPortalShell({ student, emailPrefs, unreadCount, initialCollapsed, children }: StudentPortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useThemeSwitch();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("profile");
  const settingsParam = useSearchParams().get("settings");

  // Close the mobile drawer on navigation (adjusted during render, React's pattern for
  // resetting state when a prop changes, so it happens on the same paint as the route change).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  // Links such as /student/reminders (used in emails) land here with ?settings=email.
  const [prevSettingsParam, setPrevSettingsParam] = useState<string | null>(null);
  if (settingsParam !== prevSettingsParam) {
    setPrevSettingsParam(settingsParam);
    if (settingsParam === "email") {
      setSettingsSection("email");
      setSettingsOpen(true);
    }
  }

  useEffect(() => {
    const mq = window.matchMedia("(max-width:900px)");
    const onChange = () => setIsNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/student/logout", { method: "POST" });
    } finally {
      router.replace("/student/login");
      router.refresh();
    }
  }

  // On a phone the sidebar is a drawer and always shows labels.
  const compact = !isNarrow && collapsed;
  const width = compact ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const itemBase = "group relative flex h-10 w-full items-center rounded-[10px] text-[14px] transition-colors";
  const itemLayout = compact ? "justify-center px-0" : "gap-3 px-3";

  return (
    <div
      className="grid min-h-screen"
      style={{ gridTemplateColumns: isNarrow ? "1fr" : `${width}px 1fr`, transition: "grid-template-columns 250ms ease-in-out" }}
    >
      {isNarrow && (
        <div
          onClick={() => setMobileOpen(false)}
          className={`fixed inset-0 z-[65] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      )}

      <aside
        aria-label="Student portal"
        className={`flex h-screen flex-col border-r border-border bg-surface py-4 transition-[transform,padding] duration-300 ease-in-out ${
          isNarrow
            ? `thin-scroll fixed inset-y-0 left-0 z-[70] w-[272px] overflow-y-auto px-3 shadow-[var(--shadow-lg)] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
            : `sticky top-0 ${compact ? "overflow-visible px-2.5" : "thin-scroll overflow-y-auto overflow-x-hidden px-3"}`
        }`}
      >
        {/* Brand + collapse */}
        <div className={`flex items-center ${compact ? "flex-col gap-3" : "justify-between gap-2"} px-1`}>
          <Link href="/student" className="flex min-w-0 items-center gap-2.5">
            <Image src="/assets/almahdrah-logo.png" alt="Al-Mahdrah" width={32} height={32} className="h-8 w-8 shrink-0 object-contain [filter:var(--logo-filter)]" />
            {!compact && (
              <span className="flex min-w-0 flex-col leading-[1.1]">
                <span className="truncate text-[15px] font-semibold tracking-[-0.02em] text-ink">Al-Mahdrah</span>
                <span className="font-mono text-[10.5px] tracking-[0.1em] text-primary uppercase">Student portal</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => (isNarrow ? setMobileOpen(false) : toggleCollapsed())}
            aria-label={isNarrow ? "Close menu" : compact ? "Expand sidebar" : "Collapse sidebar"}
            title={isNarrow ? "Close menu" : compact ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {isNarrow ? <CloseIcon /> : <PanelLeftIcon />}
          </button>
        </div>

        {/* Profile */}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className={`group relative mt-4 flex items-center rounded-[12px] border border-border bg-bg text-left transition-colors hover:border-border-strong ${
            compact ? "justify-center p-1.5" : "gap-2.5 p-2.5"
          }`}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
            style={{ background: student.avatarColor }}
          >
            {initialsFor(student.name)}
          </span>
          {!compact && (
            <>
              <span className="flex min-w-0 flex-1 flex-col leading-[1.3]">
                <span className="truncate text-[13.5px] font-semibold text-ink">{student.name}</span>
                <span className="truncate font-mono text-[11px] text-muted">{student.username}</span>
              </span>
              <SettingsIcon className="h-4 w-4 shrink-0 text-muted group-hover:text-ink" />
            </>
          )}
          <span className="sr-only">Open settings</span>
          <Tip show={compact}>{student.name} · Settings</Tip>
        </button>

        {/* Navigation */}
        <nav className="mt-5 flex flex-col gap-0.5">
          {!compact && <span className="mb-1.5 px-3 font-mono text-[10.5px] tracking-[0.1em] text-muted uppercase">Menu</span>}
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const badge = item.withBadge && unreadCount > 0 ? unreadCount : null;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={compact ? item.label : undefined}
                className={`${itemBase} ${itemLayout} ${
                  active ? "bg-primary-soft font-semibold text-primary" : "font-medium text-text hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!compact && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                {badge !== null && (
                  <span
                    className={`flex shrink-0 items-center justify-center rounded-full bg-red-600 font-mono text-white ${
                      compact ? "absolute top-1 right-1.5 h-4 min-w-4 px-1 text-[9px]" : "h-5 min-w-5 px-1.5 text-[10.5px]"
                    }`}
                  >
                    {badge}
                  </span>
                )}
                <Tip show={compact}>{item.label}</Tip>
              </Link>
            );
          })}
        </nav>

        {/* Footer: theme + sign out */}
        <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-3">
          {/* A switch: the label always says "Dark mode", the knob shows whether it is on. */}
          <button
            type="button"
            role="switch"
            aria-checked={theme.isDark}
            aria-label="Dark mode"
            onClick={theme.toggle}
            className={`${itemBase} ${itemLayout} font-medium text-text hover:bg-surface-2 hover:text-ink`}
          >
            {theme.isDark ? <MoonIcon className="h-[18px] w-[18px] shrink-0" /> : <SunIcon className="h-[18px] w-[18px] shrink-0" />}
            {!compact && (
              <>
                <span className="flex-1 text-left">Dark mode</span>
                <span
                  aria-hidden
                  className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${theme.isDark ? "bg-primary" : "bg-border-strong"}`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${theme.isDark ? "translate-x-4" : "translate-x-0"}`}
                  />
                </span>
              </>
            )}
            <Tip show={compact}>{theme.isDark ? "Dark mode: on" : "Dark mode: off"}</Tip>
          </button>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            aria-label={compact ? "Sign out" : undefined}
            className={`${itemBase} ${itemLayout} font-medium text-text hover:bg-red-600/10 hover:text-red-600 disabled:opacity-60`}
          >
            <LogOutIcon className="h-[18px] w-[18px] shrink-0" />
            {!compact && <span className="flex-1 text-left">{signingOut ? "Signing out…" : "Sign out"}</span>}
            <Tip show={compact}>Sign out</Tip>
          </button>
        </div>
      </aside>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        section={settingsSection}
        onSectionChange={setSettingsSection}
        profile={student}
        emailPrefs={emailPrefs}
      />

      <main className="min-w-0 px-[22px] pt-[22px] pb-[70px] sm:px-[44px] sm:pt-[44px]">
        {isNarrow && (
          <div className="mb-[22px] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 text-[13.5px] font-semibold text-ink"
            >
              <MenuIcon className="h-4 w-4" />
              Menu
            </button>
            <button
              type="button"
              onClick={theme.toggle}
              aria-label={theme.isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-surface text-ink"
            >
              {theme.isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
