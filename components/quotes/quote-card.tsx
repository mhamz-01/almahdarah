import type { CSSProperties } from "react";
import { colorFor, isRecentlyPublished } from "@/lib/quotes";
import type { QuoteEntry } from "@/lib/types";

function swayVars(id: number): CSSProperties {
  return {
    "--sway-duration": `${(3.4 + (id % 3) * 0.4).toFixed(2)}s`,
    "--sway-delay": `${((id % 5) * 0.22).toFixed(2)}s`,
  } as CSSProperties;
}

interface QuoteCardProps {
  quote: QuoteEntry;
  onOpen: () => void;
  setRef?: (el: HTMLDivElement | null) => void;
  sway?: boolean;
}

export function QuoteCard({ quote, onOpen, setRef, sway = true }: QuoteCardProps) {
  const color = colorFor(quote.topicKey);
  const topicLabel = quote.topicKey;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left"
    >
      <div
        ref={setRef}
        style={sway ? swayVars(quote.id) : undefined}
        className={`relative flex h-[330px] flex-col border border-border bg-bg p-7 transition-colors duration-200 hover:border-border-strong hover:bg-surface ${
          sway ? "animate-sway" : ""
        }`}
      >
        {isRecentlyPublished(quote.publishedAt) && (
          <span className="absolute -top-2.5 right-5 z-[2] rounded-full bg-primary px-2.5 py-[3px] text-[10px] font-bold tracking-[0.1em] text-white uppercase shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
            New
          </span>
        )}
        <div className="mb-[18px] flex flex-none items-baseline justify-between gap-3">
          <span className="font-mono text-[11px] tracking-[0.05em] text-muted">
            No. {String(quote.id).padStart(2, "0")}
          </span>
          <span
            className="max-w-[65%] truncate text-right text-[10.5px] font-bold tracking-[0.14em] uppercase"
            style={{ color }}
          >
            {topicLabel}
          </span>
        </div>

        {quote.type === "passage" ? (
          <>
            <h3 className="mb-2.5 line-clamp-2 flex-none [overflow-wrap:anywhere] font-display text-[14.5px] leading-[1.3] tracking-[0.01em] text-ink uppercase">
              {quote.title}
            </h3>
            <p className="line-clamp-[5] min-h-0 flex-1 [overflow-wrap:anywhere] font-serif text-[16px] leading-[1.7] text-text">
              {quote.text}
            </p>
            <span
              className="mt-3 flex-none text-[11.5px] font-bold tracking-[0.08em] uppercase"
              style={{ color }}
            >
              + Continue reading
            </span>
          </>
        ) : (
          <p className="line-clamp-[7] min-h-0 flex-1 [overflow-wrap:anywhere] font-serif text-[16px] leading-[1.7] text-ink italic">
            &ldquo;{quote.text}&rdquo;
          </p>
        )}

        <div className="mt-4 flex flex-none items-baseline border-t border-border pt-4">
          <span className="line-clamp-1 [overflow-wrap:anywhere] text-[12.5px] font-bold text-ink">
            {quote.author}
          </span>
        </div>
      </div>
    </button>
  );
}
