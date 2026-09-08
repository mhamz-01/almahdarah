"use client";

import { useState } from "react";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { colorFor, isRecentlyPublished } from "@/lib/quotes";
import type { QuoteEntry } from "@/lib/types";

interface QuoteModalContentProps {
  quote: QuoteEntry;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function QuoteModalContent({ quote, onClose, onPrev, onNext }: QuoteModalContentProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text =
      quote.type === "passage"
        ? `${quote.title}\n\n${quote.text}\n— ${quote.author}`
        : `"${quote.text}"\n— ${quote.author}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — nothing to fall back to.
    }
  }

  return (
    <>
      <div className="mb-[26px] flex items-baseline justify-between gap-3">
        <DialogTitle className="min-w-0 font-sans text-[11.5px] font-normal tracking-[0.05em] text-muted normal-case">
          No. {String(quote.id).padStart(2, "0")} —{" "}
          <span
            className="font-bold tracking-[0.1em] uppercase [overflow-wrap:anywhere]"
            style={{ color: colorFor(quote.topicKey) }}
          >
            {quote.topicKey}
          </span>
          {isRecentlyPublished(quote.publishedAt) && (
            <span className="ml-2.5 rounded-full bg-primary px-2 py-[2px] text-[10px] font-bold tracking-[0.1em] text-white uppercase align-middle">
              New
            </span>
          )}
        </DialogTitle>
        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={handleCopy}
            className="text-[12.5px] font-bold tracking-[0.08em] text-muted uppercase transition-colors hover:text-ink"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[12.5px] font-bold tracking-[0.08em] text-muted uppercase transition-colors hover:text-ink"
          >
            Close ✕
          </button>
        </div>
      </div>
      <DialogDescription className="sr-only">{quote.author}</DialogDescription>

      {quote.type === "passage" ? (
        <>
          <h3 className="mb-[18px] font-display text-[clamp(19px,2.4vw,26px)] leading-[1.2] text-ink uppercase [overflow-wrap:anywhere]">
            {quote.title}
          </h3>
          <p className="font-serif text-[clamp(16px,1.9vw,19px)] leading-[1.85] text-text [overflow-wrap:anywhere]">
            {quote.text}
          </p>
        </>
      ) : (
        <p className="font-serif text-[clamp(21px,2.6vw,27px)] leading-[1.55] text-ink italic [overflow-wrap:anywhere]">
          &ldquo;{quote.text}&rdquo;
        </p>
      )}

      <div className="mt-[30px] flex flex-wrap items-baseline justify-between gap-4 border-t border-border pt-5">
        <div className="min-w-0 [overflow-wrap:anywhere]">
          <span className="text-sm font-bold text-ink">{quote.author}</span>
        </div>
        {(onPrev || onNext) && (
          <div className="flex gap-[22px]">
            {onPrev && (
              <button
                type="button"
                onClick={onPrev}
                className="text-[13px] font-bold text-text transition-colors hover:text-primary"
              >
                ← Previous
              </button>
            )}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="text-[13px] font-bold text-text transition-colors hover:text-primary"
              >
                Next →
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
