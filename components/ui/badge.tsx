import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "outline";

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "bg-surface-2 text-text",
  success: "bg-green/15 text-green",
  warning: "bg-gold/25 text-[#8a6b12]",
  outline: "border border-border-strong text-muted",
};

function Badge({ className, variant = "neutral", ...props }: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      data-slot="badge"
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap", VARIANTS[variant], className)}
      {...props}
    />
  );
}

export { Badge };
