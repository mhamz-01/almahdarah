"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { QuoteForm } from "@/components/admin/quotes/quote-form";
import { colorFor } from "@/lib/quotes";
import type { QuoteRow } from "@/lib/types";

interface QuotesAdminPanelProps {
  quotes: QuoteRow[];
  loadError: string | null;
}

type Mode = { view: "list" } | { view: "create" } | { view: "edit"; quote: QuoteRow };
type PublishedFilter = "all" | "published" | "draft";

const PAGE_SIZE = 5;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function QuotesAdminPanel({ quotes: initialQuotes, loadError }: QuotesAdminPanelProps) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [mode, setMode] = useState<Mode>({ view: "list" });
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<string | "all">("all");
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>("all");
  const [page, setPage] = useState(1);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<QuoteRow | null>(null);

  const nextId = quotes.reduce((max, q) => Math.max(max, q.id), 0) + 1;
  const topics = useMemo(
    () => Array.from(new Set(quotes.map((q) => q.topic_key))).sort((a, b) => a.localeCompare(b)),
    [quotes],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return quotes
      .filter((q) => {
        if (topicFilter !== "all" && q.topic_key !== topicFilter) return false;
        if (publishedFilter === "published" && !q.published) return false;
        if (publishedFilter === "draft" && q.published) return false;
        if (!query) return true;
        return (
          q.author.toLowerCase().includes(query) ||
          q.body.toLowerCase().includes(query) ||
          (q.title ?? "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [quotes, search, topicFilter, publishedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  function selectSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function selectTopicFilter(value: string | "all") {
    setTopicFilter(value);
    setPage(1);
  }

  function selectPublishedFilter(value: PublishedFilter) {
    setPublishedFilter(value);
    setPage(1);
  }

  const publishedCount = quotes.filter((q) => q.published).length;

  function withPending<T>(id: number, fn: () => Promise<T>) {
    setPendingIds((prev) => new Set(prev).add(id));
    return fn().finally(() => {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  }

  async function togglePublished(quote: QuoteRow) {
    await withPending(quote.id, async () => {
      try {
        const res = await fetch(`/api/admin/quotes/${quote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published: !quote.published }),
        });
        if (!res.ok) throw new Error("Request failed");
        setQuotes((prev) =>
          prev.map((q) => (q.id === quote.id ? { ...q, published: !quote.published } : q)),
        );
      } catch {
        // leave state unchanged on failure
      }
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    await withPending(target.id, async () => {
      try {
        const res = await fetch(`/api/admin/quotes/${target.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Request failed");
        setQuotes((prev) => prev.filter((q) => q.id !== target.id));
      } catch {
        // leave state unchanged on failure
      }
    });
  }

  function handleSaved(quote: QuoteRow) {
    setQuotes((prev) => {
      const exists = prev.some((q) => q.id === quote.id);
      return exists ? prev.map((q) => (q.id === quote.id ? quote : q)) : [...prev, quote];
    });
    setPage(1);
    setMode({ view: "list" });
  }

  if (mode.view === "create") {
    return (
      <QuoteForm
        nextId={nextId}
        existingTopics={topics}
        onCancel={() => setMode({ view: "list" })}
        onSaved={handleSaved}
      />
    );
  }

  if (mode.view === "edit") {
    return (
      <QuoteForm
        initial={mode.quote}
        nextId={nextId}
        existingTopics={topics}
        onCancel={() => setMode({ view: "list" })}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[24px] tracking-[-0.01em] text-ink uppercase">
            Wall of Quotes
          </h1>
          <p className="mt-1 text-[14px] text-muted">
            {quotes.length} total · {publishedCount} published
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMode({ view: "create" })}
          className="flex h-11 items-center rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition-colors hover:brightness-[1.07]"
        >
          + Add quote
        </button>
      </div>

      {loadError && (
        <p className="mt-4 rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
          Couldn&apos;t load quotes: {loadError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => selectSearch(e.target.value)}
          type="text"
          placeholder="Search by author or text…"
          className="h-11 w-full max-w-[320px] rounded-xl border-[1.5px] border-border-strong bg-surface px-4 text-[14px] text-ink outline-none focus:border-primary"
        />
        <div className="flex flex-wrap gap-2">
          {(["all", "published", "draft"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => selectPublishedFilter(value)}
              className={`flex h-11 items-center rounded-xl border-[1.5px] px-3.5 text-[13px] font-semibold capitalize transition-colors ${
                publishedFilter === value
                  ? "border-primary bg-primary text-white"
                  : "border-border-strong bg-surface text-muted hover:border-primary hover:text-ink"
              }`}
            >
              {value === "all" ? "All statuses" : value}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar mt-3 flex flex-wrap gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => selectTopicFilter("all")}
          className={`flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[12.5px] font-bold transition-colors ${
            topicFilter === "all"
              ? "border-ink bg-ink text-bg"
              : "border-border-strong bg-surface text-muted hover:border-primary"
          }`}
        >
          All topics
        </button>
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => selectTopicFilter(t)}
            className="flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[12.5px] font-bold transition-colors"
            style={
              topicFilter === t
                ? { borderColor: colorFor(t), background: colorFor(t), color: "#fff" }
                : { borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--muted)" }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length > 0 && (
        <p className="mt-4 text-[12.5px] text-muted">
          Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
          {filtered.length} · newest first
        </p>
      )}

      <div className="mt-3 flex flex-col gap-3.5">
        {paged.map((quote) => (
          <div key={quote.id} className="rounded-[18px] border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-muted">
                    No. {String(quote.id).padStart(2, "0")}
                  </span>
                  <span
                    className="inline-flex max-w-[220px] items-center truncate rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em]"
                    style={{ color: colorFor(quote.topic_key), background: "var(--surface-2)" }}
                    title={quote.topic_key}
                  >
                    {quote.topic_key}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-navy/12 px-2.5 py-0.5 text-[11px] font-bold text-navy">
                    {quote.kind === "passage" ? "Passage" : "Quote"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      quote.published ? "bg-green/15 text-green" : "bg-gold/25 text-[#8a6b12]"
                    }`}
                  >
                    {quote.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-1.5 [overflow-wrap:anywhere] text-[13px] text-muted">
                  {quote.author} · added {formatDate(quote.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode({ view: "edit", quote })}
                  className="flex h-9 items-center rounded-full border-[1.5px] border-border-strong bg-surface px-3.5 text-[12.5px] font-bold text-text transition-colors hover:border-primary hover:text-ink"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => togglePublished(quote)}
                  disabled={pendingIds.has(quote.id)}
                  className={`flex h-9 items-center rounded-full border-[1.5px] px-3.5 text-[12.5px] font-bold transition-colors disabled:opacity-50 ${
                    quote.published
                      ? "border-border-strong bg-surface text-muted hover:border-primary hover:text-ink"
                      : "border-primary bg-primary text-white hover:brightness-[1.07]"
                  }`}
                >
                  {pendingIds.has(quote.id) ? "Saving…" : quote.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(quote)}
                  disabled={pendingIds.has(quote.id)}
                  className="flex h-9 items-center rounded-full border-[1.5px] border-red-600/30 bg-red-600/10 px-3.5 text-[12.5px] font-bold text-red-600 transition-colors hover:border-red-600/50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 [overflow-wrap:anywhere] text-[14.5px] text-text">
              {quote.title && <span className="font-bold text-ink">{quote.title} — </span>}
              {quote.body}
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-[18px] border border-border bg-surface px-4 py-10 text-center text-muted">
            No quotes match yet.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Quotes pagination"
          className="mt-5 flex flex-wrap items-center justify-center gap-1.5"
        >
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-sm font-bold text-text transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border-strong"
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === currentPage ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 font-mono text-[12.5px] font-bold transition-colors ${
                n === currentPage
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-sm font-bold text-text transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border-strong"
          >
            →
          </button>
        </nav>
      )}

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          {deleteTarget && (
            <div>
              <DialogTitle>Delete this quote?</DialogTitle>
              <DialogDescription>
                No. {String(deleteTarget.id).padStart(2, "0")} by {deleteTarget.author} will be removed from
                the Wall of Quotes for everyone. This can&apos;t be undone.
              </DialogDescription>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex h-10 items-center rounded-full border-[1.5px] border-border-strong bg-surface px-4 text-[13px] font-bold text-text transition-colors hover:border-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex h-10 items-center rounded-full bg-red-600 px-4 text-[13px] font-bold text-white transition-colors hover:brightness-[1.07]"
                >
                  Delete quote
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
