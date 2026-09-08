"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClasses =
  "h-[50px] w-full rounded-[3px] border border-border-strong bg-surface px-4 text-[15px] text-ink transition-colors focus:border-primary focus:outline-none";

export function StudentLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        return;
      }
      router.replace("/student");
      router.refresh();
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="mb-[18px] block">
        <span className="mb-2 block text-[12px] font-bold tracking-[0.1em] text-muted uppercase">Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          autoComplete="username"
          placeholder="e.g. ahmad.k24"
          className={inputClasses}
        />
      </label>

      <label className="mb-3 block">
        <span className="mb-2 block text-[12px] font-bold tracking-[0.1em] text-muted uppercase">Password</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClasses}
        />
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
      </div>

      <button
        type="submit"
        disabled={!username || !password || isSubmitting}
        className={`h-[52px] w-full rounded-full text-[15px] font-bold text-white shadow-[var(--shadow-sm)] transition-colors ${
          username && password && !isSubmitting ? "cursor-pointer bg-primary hover:brightness-[1.08]" : "cursor-not-allowed bg-primary/60"
        }`}
      >
        {isSubmitting ? "Signing in…" : "Sign in to portal"}
      </button>
      {error && <p className="mt-3 text-center text-[13.5px] font-semibold text-red-600">{error}</p>}
    </form>
  );
}
