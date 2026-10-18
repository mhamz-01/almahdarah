"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

// shadcn/ui Sheet: a Radix Dialog that docks to a screen edge. Slide animations
// live in globals.css (keyed on data-side / data-state), since this project has
// no tailwindcss-animate plugin.

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn("sheet-overlay fixed inset-0 z-[100] bg-black/55 backdrop-blur-[2px]", className)}
      {...props}
    />
  );
}

type SheetSide = "top" | "right" | "bottom" | "left";

const SIDE_CLASSES: Record<SheetSide, string> = {
  right: "inset-y-0 right-0 h-dvh w-[88%] border-l sm:max-w-md",
  left: "inset-y-0 left-0 h-dvh w-[88%] border-r sm:max-w-md",
  top: "inset-x-0 top-0 h-auto max-h-[90dvh] border-b",
  bottom: "inset-x-0 bottom-0 h-auto max-h-[90dvh] rounded-t-[22px] border-t",
};

function SheetContent({
  className,
  children,
  side = "right",
  showClose = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: SheetSide; showClose?: boolean }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "sheet-content fixed z-[100] flex flex-col gap-0 border-border bg-surface text-ink shadow-[var(--shadow-lg)] outline-none",
          SIDE_CLASSES[side],
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <SheetPrimitive.Close
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 15 15" fill="none" aria-hidden>
              <path d="M11.5 3.5L3.5 11.5M3.5 3.5L11.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex shrink-0 flex-col gap-1.5 border-b border-border p-5 pr-14 sm:px-6", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex shrink-0 items-center gap-2.5 border-t border-border bg-surface px-5 pt-3.5 pb-[max(env(safe-area-inset-bottom),14px)] sm:px-6", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-[20px] leading-[1.25] font-bold break-words text-ink", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-[13px] text-muted", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
