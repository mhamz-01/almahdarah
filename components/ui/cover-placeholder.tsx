import type { CSSProperties } from "react";
import type { AccentToken } from "@/lib/types";
import { accentGradientVars } from "@/lib/accent";

interface CoverPlaceholderProps {
  accent: AccentToken;
  className?: string;
  label?: string;
  align?: "end" | "center";
}

export function CoverPlaceholder({
  accent,
  className = "",
  label = "[ article cover ]",
  align = "end",
}: CoverPlaceholderProps) {
  const [from, to] = accentGradientVars[accent];
  const style = { "--pg-from": from, "--pg-to": to } as CSSProperties;
  const alignClasses = align === "end" ? "items-end" : "items-center justify-center";

  return (
    <div
      className={`placeholder-cover flex p-3.5 ${alignClasses} ${className}`}
      style={style}
      aria-hidden="true"
    >
      <span className="font-mono text-[10.5px] text-white/80">{label}</span>
    </div>
  );
}
