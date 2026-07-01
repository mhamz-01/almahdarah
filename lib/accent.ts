import type { AccentToken } from "@/lib/types";

export const accentBg: Record<AccentToken, string> = {
  primary: "bg-primary",
  "primary-2": "bg-primary-2",
  navy: "bg-navy",
  gold: "bg-gold",
  green: "bg-green",
};

export const accentText: Record<AccentToken, string> = {
  primary: "text-primary",
  "primary-2": "text-primary-2",
  navy: "text-navy",
  gold: "text-[#8a6b12]",
  green: "text-green",
};

export const accentBorder: Record<AccentToken, string> = {
  primary: "border-primary",
  "primary-2": "border-primary-2",
  navy: "border-navy",
  gold: "border-gold",
  green: "border-green",
};

export const accentSoftBg: Record<AccentToken, string> = {
  primary: "bg-primary/15",
  "primary-2": "bg-primary-2/15",
  navy: "bg-navy/14",
  gold: "bg-gold/25",
  green: "bg-green/15",
};

export const accentBorderSoft: Record<AccentToken, string> = {
  primary: "border-primary/40",
  "primary-2": "border-primary-2/40",
  navy: "border-navy/40",
  gold: "border-gold/40",
  green: "border-green/40",
};

export const accentGradientVars: Record<AccentToken, [string, string]> = {
  primary: ["var(--primary)", "var(--primary-2)"],
  "primary-2": ["var(--primary-2)", "var(--primary)"],
  navy: ["var(--navy)", "var(--primary)"],
  gold: ["var(--gold)", "var(--primary)"],
  green: ["var(--green)", "var(--primary-2)"],
};
