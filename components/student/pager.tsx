"use client";

interface PagerProps {
  page: number;
  pages: number;
  from: number;
  to: number;
  total: number;
  onPage: (page: number) => void;
  className?: string;
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

/** Previous / next pager with a "Showing 11–20 of 43" summary. Renders nothing when everything fits on one page. */
export function Pager({ page, pages, from, to, total, onPage, className = "" }: PagerProps) {
  if (pages <= 1) return null;
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border-strong";
  return (
    <nav aria-label="Pagination" className={`flex items-center justify-between gap-3 ${className}`}>
      <span className="text-[12.5px] text-muted">
        Showing <span className="font-semibold text-ink">{from}–{to}</span> of {total}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page === 0} aria-label="Previous page" className={btn}>
          <Arrow dir="left" />
        </button>
        <span className="min-w-[56px] text-center font-mono text-[12px] text-muted" aria-live="polite">
          {page + 1} / {pages}
        </span>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pages - 1} aria-label="Next page" className={btn}>
          <Arrow dir="right" />
        </button>
      </div>
    </nav>
  );
}
