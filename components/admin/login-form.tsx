"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClasses =
  "h-12 w-full rounded-[14px] border border-border-strong bg-surface px-4 text-[15px] text-ink shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_16%,transparent)] focus:outline-none";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong — please try again.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink">Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          autoComplete="username"
          className={inputClasses}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink">Password</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          className={inputClasses}
        />
      </label>

      <button
        type="submit"
        disabled={!username || !password || isSubmitting}
        aria-busy={isSubmitting}
        className={`group mt-2 flex h-[50px] items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold text-white transition-[filter,box-shadow,background-color] ${
          username && password && !isSubmitting
            ? "cursor-pointer bg-primary shadow-[0_10px_24px_-10px_var(--primary)] hover:brightness-[1.08]"
            : isSubmitting
              ? "cursor-wait bg-primary"
              : "cursor-not-allowed bg-primary/55"
        }`}
      >
        {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
        {isSubmitting ? "Signing in…" : "Sign in"}
        {!isSubmitting && <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>}
      </button>
      {error && (
        <p role="alert" className="rounded-[12px] border border-red-600/25 bg-red-600/[0.06] px-3.5 py-2.5 text-center text-[13.5px] font-medium text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
