import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full resize-y rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] py-3 text-[14px] leading-[1.6] text-ink transition-colors placeholder:text-muted focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
