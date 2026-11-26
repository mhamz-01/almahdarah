"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * "Mark me present" for today. The button switches straight away (optimistic) and the
 * request runs in the background; if the server refuses, it switches back and says why.
 * Clicks are queued, so a quick "mark" then "undo" reach the server in order.
 */
export function PunchButton({ punched: initialPunched, onDark = false }: { punched: boolean; onDark?: boolean }) {
  const router = useRouter();
  const [punched, setPunched] = useState(initialPunched);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const queue = useRef<Promise<void>>(Promise.resolve());
  const latest = useRef(0);

  function send(next: boolean) {
    const id = ++latest.current;
    const previous = punched;
    setPunched(next);
    setError(null);

    queue.current = queue.current.then(async () => {
      try {
        const res = await fetch("/api/student/attendance", { method: next ? "POST" : "DELETE" });
        const json = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean; error?: string };
        if (!res.ok || !json.ok) throw new Error(json.error ?? (next ? "Couldn't mark you present" : "Couldn't undo"));
        // Only the last click refreshes the rest of the page (streak, week tiles).
        if (id === latest.current) startTransition(() => router.refresh());
      } catch (e) {
        if (id !== latest.current) return;
        setPunched(previous);
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      }
    });
  }

  const errorText = error && <p role="alert" className={`text-[12px] font-semibold ${onDark ? "text-red-300" : "text-red-600"}`}>{error}</p>;

  if (punched) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <span
          className={`inline-flex h-11 items-center gap-2.5 rounded-full px-5 text-[14px] font-bold ${
            onDark ? "bg-green text-white" : "bg-green/16 text-green"
          }`}
        >
          ✓ Marked present
        </span>
        <button
          type="button"
          onClick={() => send(false)}
          className={`bg-none text-[12px] font-semibold underline ${onDark ? "text-white/70" : "text-muted"}`}
        >
          Undo
        </button>
        {errorText}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={() => send(true)}
        className={`h-[54px] rounded-full px-[30px] text-[15px] font-bold shadow-[var(--shadow-sm)] transition-colors hover:brightness-[1.08] ${
          onDark ? "bg-gold text-navy" : "bg-primary text-white"
        }`}
      >
        Mark me present
      </button>
      {errorText}
    </div>
  );
}
