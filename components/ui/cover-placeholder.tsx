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

  return <div className={`placeholder-cover ${className}`} style={style} aria-hidden="true" />;
}
