import type { CSSProperties } from "react";
import type { AccentToken } from "@/lib/types";
import { accentGradientVars } from "@/lib/accent";

interface AvatarPlaceholderProps {
  accent: AccentToken;
  size?: number;
  className?: string;
}

export function AvatarPlaceholder({
  accent,
  size = 48,
  className = "",
}: AvatarPlaceholderProps) {
  const [from, to] = accentGradientVars[accent];
  const style = { "--pg-from": from, "--pg-to": to } as CSSProperties;

  return (
    <div
      className={`placeholder-avatar flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ ...style, width: size, height: size }}
      aria-hidden="true"
    >
      <span className="font-mono text-[8px] text-white/85">[ photo ]</span>
    </div>
  );
}
