"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch("/api/student/notifications/read", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className="h-10 rounded-full border border-border-strong bg-transparent px-[18px] text-[13px] font-bold text-text transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Marking…" : "Mark all read"}
    </button>
  );
}
