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
      className="flex h-9 items-center rounded-full border border-border px-4 text-[13px] font-semibold text-muted transition-colors hover:border-border-strong hover:text-ink"
    >
      {isLoading ? "Signing out…" : "Sign out"}
    </button>
  );
}
