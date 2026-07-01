import type { CSSProperties } from "react";
import type { AccentToken } from "@/lib/types";
import { accentGradientVars } from "@/lib/accent";

interface CoverPlaceholderProps {
  accent: AccentToken;
  className?: string;
}

export function CoverPlaceholder({ accent, className = "" }: CoverPlaceholderProps) {
  const [from, to] = accentGradientVars[accent];
  const style = { "--pg-from": from, "--pg-to": to } as CSSProperties;

  return (
    <div
      className={`placeholder-cover flex items-end p-3.5 ${className}`}
      style={style}
      aria-hidden="true"
    >
      <span className="font-mono text-[10.5px] text-white/80">[ article cover ]</span>
    </div>
  );
}
