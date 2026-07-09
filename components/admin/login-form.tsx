"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClasses =
  "h-12 rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

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
    <form onSubmit={handleSubmit} className="flex w-full max-w-[380px] flex-col gap-4">
      <label className="flex flex-col gap-[7px]">
        <span className="text-[13px] font-bold text-ink">Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          autoComplete="username"
          className={inputClasses}
        />
      </label>
      <label className="flex flex-col gap-[7px]">
        <span className="text-[13px] font-bold text-ink">Password</span>
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
        className={`mt-1.5 flex h-[52px] items-center justify-center gap-[9px] rounded-full text-[15px] font-bold transition-colors duration-200 ${
          username && password && !isSubmitting
            ? "cursor-pointer bg-primary text-white hover:brightness-[1.07]"
            : "cursor-not-allowed bg-surface-2 text-muted"
        }`}
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
      {error && <p className="text-center text-sm font-semibold text-red-600">{error}</p>}
    </form>
  );
}
