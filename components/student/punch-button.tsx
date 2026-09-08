"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PunchButton({ punched: initialPunched }: { punched: boolean }) {
  const router = useRouter();
  const [punched, setPunched] = useState(initialPunched);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mark() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/attendance", { method: "POST" });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Couldn't mark you present");
      setPunched(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't mark you present");
    } finally {
      setLoading(false);
    }
  }

  async function undo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/attendance", { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Couldn't undo");
      setPunched(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't undo");
    } finally {
      setLoading(false);
    }
  }

  if (punched) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <span className="inline-flex h-11 items-center gap-2.5 rounded-full bg-green/16 px-5 text-[14px] font-bold text-green">
          ✓ Marked present
        </span>
        <button
          type="button"
          onClick={undo}
          disabled={loading}
          className="bg-none text-[12px] font-semibold text-muted underline disabled:opacity-60"
        >
          {loading ? "Undoing…" : "Undo"}
        </button>
        {error && <p className="text-[12px] font-semibold text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={mark}
        disabled={loading}
        className="h-[54px] rounded-full bg-primary px-[30px] text-[15px] font-bold text-white shadow-[var(--shadow-sm)] transition-colors hover:brightness-[1.08] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Marking…" : "Mark me present"}
      </button>
      {error && <p className="text-[12px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
