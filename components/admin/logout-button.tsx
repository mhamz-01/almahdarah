"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="flex h-10 w-full items-center justify-center rounded-xl border border-border px-4 text-[13px] font-semibold text-muted transition-colors hover:border-border-strong hover:text-ink disabled:opacity-60"
    >
      {isLoading ? "Signing out…" : "Sign out"}
    </button>
  );
}
