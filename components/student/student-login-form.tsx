"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoLoader } from "@/components/ui/logo-loader";

const OPEN_PORTAL_FALLBACK_MS = 15000;

const inputClasses =
  "h-[50px] w-full rounded-[3px] border border-border-strong bg-surface px-4 text-[15px] text-ink transition-colors focus:border-primary focus:outline-none";

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
          <div className="bg-pattern pointer-events-none absolute inset-0 opacity-40" />
          <LogoLoader className="relative" label="" />
          <div className="relative" role="status" aria-live="polite">
            <p className="text-[17px] font-bold text-ink">Signing you in…</p>
            <p className="mt-1 text-[13.5px] text-muted">Opening your student portal. This only takes a moment.</p>
          </div>
        </div>
      )}
      <label className="mb-[18px] block">
        <span className="mb-2 block text-[12px] font-bold tracking-[0.1em] text-muted uppercase">Username</span>
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
        <span className="mb-2 block text-[12px] font-bold tracking-[0.1em] text-muted uppercase">Password</span>
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
            className="absolute top-1/2 right-3 -translate-y-1/2 text-[12px] font-bold text-primary"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      <div className="mb-[26px] flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-text">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-[15px] w-[15px] accent-primary"
          />
          Keep me signed in
        </label>
        <Link href="/student/forgot-password" className="text-[13px] font-bold text-primary">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={!username || !password || busy}
        aria-busy={busy}
        className={`flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full text-[15px] font-bold text-white shadow-[var(--shadow-sm)] transition-colors ${
          username && password && !busy ? "cursor-pointer bg-primary hover:brightness-[1.08]" : "cursor-not-allowed bg-primary/60"
        }`}
      >
        {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
        {isOpeningPortal ? "Opening portal…" : isSubmitting ? "Checking your details…" : "Sign in to portal"}
      </button>
      {error && <p className="mt-3 text-center text-[13.5px] font-semibold text-red-600">{error}</p>}
    </form>
  );
}
