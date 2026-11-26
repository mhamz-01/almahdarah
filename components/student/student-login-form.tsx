"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoLoader } from "@/components/ui/logo-loader";

const OPEN_PORTAL_FALLBACK_MS = 15000;

const inputClasses =
  "h-12 w-full rounded-[14px] border border-border-strong bg-surface px-4 text-[15px] text-ink shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_16%,transparent)] focus:outline-none";

export function StudentLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Signed in and loading the portal. Stays on until this page unmounts, so the
  // form never looks idle while the dashboard is still being fetched.
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpeningPortal) return;
    // Fallback if client navigation stalls: do a full page load instead.
    const timer = setTimeout(() => window.location.assign("/student"), OPEN_PORTAL_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [isOpeningPortal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, remember }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong — please try again.");
        setIsSubmitting(false);
        return;
      }
      setIsOpeningPortal(true);
      router.replace("/student");
      router.refresh();
    } catch {
      setError("Something went wrong — please try again.");
      setIsSubmitting(false);
    }
  }

  const busy = isSubmitting || isOpeningPortal;

  return (
    <form onSubmit={handleSubmit}>
      {isOpeningPortal && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-5 bg-bg px-6 text-center">
          <div className="ds-lattice pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,#000_0%,transparent_62%)]" />
          <LogoLoader className="relative" label="" />
          <div className="relative" role="status" aria-live="polite">
            <p className="text-[17px] font-bold text-ink">Signing you in…</p>
            <p className="mt-1 text-[13.5px] text-muted">Opening your student portal. This only takes a moment.</p>
          </div>
        </div>
      )}
      <label className="mb-4 block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Username</span>
        <input
          value={username}
          // Usernames are always lowercase; phones like to capitalise the first letter.
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="e.g. ahmad.k24"
          className={inputClasses}
        />
      </label>

      <label className="mb-3 block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Password</span>
        <span className="relative block">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="••••••••"
            className={`${inputClasses} pr-16`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-primary transition-colors hover:bg-primary-soft"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      <div className="mb-5 flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-text">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-[15px] w-[15px] accent-primary"
          />
          Keep me signed in
        </label>
        <Link href="/student/forgot-password" className="text-[13px] font-semibold text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={!username || !password || busy}
        aria-busy={busy}
        className={`group flex h-[50px] w-full items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold text-white transition-[filter,box-shadow,background-color] ${
          username && password && !busy
            ? "cursor-pointer bg-primary shadow-[0_10px_24px_-10px_var(--primary)] hover:brightness-[1.08]"
            : busy
              ? "cursor-wait bg-primary"
              : "cursor-not-allowed bg-primary/55"
        }`}
      >
        {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
        {isOpeningPortal ? "Opening portal…" : isSubmitting ? "Checking your details…" : "Sign in"}
        {!busy && <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>}
      </button>
      {error && (
        <p role="alert" className="mt-3.5 rounded-[12px] border border-red-600/25 bg-red-600/[0.06] px-3.5 py-2.5 text-center text-[13.5px] font-medium text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
