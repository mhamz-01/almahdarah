"use client";

import { useTheme } from "next-themes";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hasMounted = useHasMounted();
  const isDark = hasMounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle colour theme"
      className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-[13px] font-semibold text-text transition-colors hover:border-border-strong"
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full border-2 border-gold"
        style={{ background: isDark ? "var(--gold)" : "transparent" }}
      />
      {hasMounted ? (isDark ? "Light" : "Dark") : "Theme"}
    </button>
  );
}
