"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteCard } from "@/components/quotes/quote-card";
import { QuoteModalContent } from "@/components/quotes/quote-modal-content";
import { QUOTE_LIMITS } from "@/lib/admin/quote-limits";
import type { QuoteEntry, QuoteRow } from "@/lib/types";

const inputClasses =
  "h-11 rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

function CharCount({ value, limit }: { value: string; limit: number }) {
  const remaining = limit - value.length;
  return (
    <span className={`text-right text-[11px] ${remaining <= 10 ? "text-red-600" : "text-muted"}`}>
      {value.length}/{limit}
    </span>
  );
}

function Spinner({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 ${className}`} aria-hidden="true">
      <span className="absolute inset-0 rounded-full border-2 border-current opacity-25" />
      <span className="animate-loader-spin absolute inset-0 rounded-full border-2 border-transparent border-t-current" />
    </span>
  );
}

function AiProgressBar({ active, label }: { active: boolean; label: string }) {
  if (!active) return null;
  return (
    <div className="mt-2 flex items-center gap-2.5" role="status" aria-live="polite">
      <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-primary/15">
        <span className="animate-progress-indeterminate absolute inset-y-0 rounded-full bg-primary" />
      </div>
      <span className="shrink-0 text-[11px] font-semibold text-muted">{label}</span>
    </div>
  );
}

interface QuoteFormProps {
  initial?: QuoteRow;
  nextId: number;
  existingTopics?: string[];
  onCancel: () => void;
  onSaved: (quote: QuoteRow) => void;
}

export function QuoteForm({ initial, nextId, existingTopics = [], onCancel, onSaved }: QuoteFormProps) {
  const [topicKey, setTopicKey] = useState(initial?.topic_key ?? "");
  const [kind, setKind] = useState<QuoteRow["kind"]>(initial?.kind ?? "quote");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Translation and topic/title suggestion are two independent, user-triggered
  // AI steps — the second is opt-in and always runs against whatever is
  // currently in the body field, so it should be run *after* translating.
  const [suggestTopicTitle, setSuggestTopicTitle] = useState(true);

  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [translateSnapshot, setTranslateSnapshot] = useState<string | null>(null);

  const [classifying, setClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState<string | null>(null);
  const [classifySnapshot, setClassifySnapshot] = useState<{ topicKey: string; title: string } | null>(
    null,
  );

  async function handleTranslate() {
    if (!body.trim() || translating) return;
    setTranslating(true);
    setTranslateError(null);
    try {
      const res = await fetch("/api/admin/quotes/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body }),
      });
      const json = (await res.json()) as { ok: boolean; translatedText?: string; error?: string };
      if (!res.ok || !json.ok || !json.translatedText) throw new Error(json.error ?? "Translation failed");

      setTranslateSnapshot(body);
      setBody(json.translatedText);
    } catch (e) {
      setTranslateError(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setTranslating(false);
    }
  }

  function undoTranslate() {
    if (translateSnapshot === null) return;
    setBody(translateSnapshot);
    setTranslateSnapshot(null);
  }

  async function handleClassify() {
    if (!body.trim() || classifying) return;
    setClassifying(true);
    setClassifyError(null);
    try {
      const res = await fetch("/api/admin/quotes/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body, kind }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        result?: { topic: string; title: string | null };
        error?: string;
      };
      if (!res.ok || !json.ok || !json.result) throw new Error(json.error ?? "Topic suggestion failed");

      setClassifySnapshot({ topicKey, title });
      setTopicKey(json.result.topic);
      if (kind === "passage" && json.result.title) setTitle(json.result.title);
    } catch (e) {
      setClassifyError(e instanceof Error ? e.message : "Topic suggestion failed");
    } finally {
      setClassifying(false);
    }
  }

  function undoClassify() {
    if (!classifySnapshot) return;
    setTopicKey(classifySnapshot.topicKey);
    setTitle(classifySnapshot.title);
    setClassifySnapshot(null);
  }

  const isValid = Boolean(
    topicKey.trim() && body.trim() && author.trim() && (kind !== "passage" || title.trim()),
  );

  const draftEntry: QuoteEntry = {
    id: initial?.id ?? nextId,
    topicKey: topicKey.trim() || "Topic",
    type: kind,
    title: kind === "passage" ? title.trim() || "Passage title" : undefined,
    text: body.trim() || "Your quote text will appear here as you type…",
    author: author.trim() || "Author name",
    // Preview the "New" tag whenever this save would (re)publish the quote.
    publishedAt: published && (!initial || !initial.published) ? new Date().toISOString() : initial?.published_at ?? null,
  };

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        topic_key: topicKey.trim(),
        kind,
        title: kind === "passage" ? title.trim() : null,
        body: body.trim(),
        author: author.trim(),
        published,
      };
      const res = await fetch(initial ? `/api/admin/quotes/${initial.id}` : "/api/admin/quotes", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok: boolean; quote?: QuoteRow; error?: string };
      if (!res.ok || !json.ok || !json.quote) throw new Error(json.error ?? "Request failed");
      onSaved(json.quote);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onCancel}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-bold text-muted transition-colors hover:text-ink"
      >
        <span className="text-base leading-none">←</span> Back to quotes
      </button>

      <h1 className="font-display text-[22px] tracking-[-0.01em] text-ink uppercase">
        {initial ? `Edit quote No. ${String(initial.id).padStart(2, "0")}` : "Add a new quote"}
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-[18px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-[7px]">
              <span className="text-[13px] font-bold text-ink">Topic</span>
              <input
                value={topicKey}
                onChange={(e) => setTopicKey(e.target.value)}
                type="text"
                list="quote-topic-suggestions"
                maxLength={QUOTE_LIMITS.topic}
                placeholder="e.g. Ikhlāṣ, Knowledge, Patience…"
                className={inputClasses}
              />
              <datalist id="quote-topic-suggestions">
                {existingTopics.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <CharCount value={topicKey} limit={QUOTE_LIMITS.topic} />
            </label>

            <label className="flex flex-col gap-[7px]">
              <span className="text-[13px] font-bold text-ink">Type</span>
              <Select
                value={kind}
                onValueChange={(value) => {
                  const nextKind = value as QuoteRow["kind"];
                  setKind(nextKind);
                  // A quote can never carry a title — drop any leftover
                  // passage title the moment the type switches away from it.
                  if (nextKind === "quote") setTitle("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quote">Short quote</SelectItem>
                  <SelectItem value="passage">Passage (with title)</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>

          {kind === "passage" && (
            <label className="flex flex-col gap-[7px]">
              <span className="text-[13px] font-bold text-ink">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                maxLength={QUOTE_LIMITS.title}
                placeholder="A Definition Worth Memorising"
                className={inputClasses}
              />
              <CharCount value={title} limit={QUOTE_LIMITS.title} />
            </label>
          )}

          <label className="flex flex-col gap-[7px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-ink">
                {kind === "passage" ? "Passage text" : "Quote text"}
              </span>
              <button
                type="button"
                onClick={handleTranslate}
                disabled={!body.trim() || translating}
                className="flex h-7 items-center gap-1.5 rounded-full border-[1.5px] border-primary/40 bg-primary/10 px-3 text-[11.5px] font-bold text-primary transition-colors hover:border-primary hover:bg-primary/15 disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-transparent disabled:text-muted"
              >
                {translating ? <Spinner className="h-3 w-3 text-primary" /> : "🌐"}
                {translating ? "Translating…" : "Translate to English"}
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              maxLength={QUOTE_LIMITS.body}
              disabled={translating}
              placeholder="Write the quote or passage as it should appear — Arabic is fine, use Translate to English to convert it."
              className="resize-y rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] py-[13px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <AiProgressBar active={translating} label="Translating with GPT-4o mini…" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 text-[11.5px]">
                {translateError && <p className="font-semibold text-red-600">{translateError}</p>}
                {!translateError && translateSnapshot !== null && (
                  <p className="font-semibold text-primary">
                    Translated into English.{" "}
                    <button type="button" onClick={undoTranslate} className="underline hover:no-underline">
                      Undo
                    </button>
                  </p>
                )}
              </div>
              <CharCount value={body} limit={QUOTE_LIMITS.body} />
            </div>
          </label>

          <div className="rounded-xl border-[1.5px] border-dashed border-border-strong p-3.5">
            <label className="flex items-center gap-2.5 text-[12.5px] font-bold text-ink">
              <input
                type="checkbox"
                checked={suggestTopicTitle}
                onChange={(e) => setSuggestTopicTitle(e.target.checked)}
                className="h-3.5 w-3.5 accent-primary"
              />
              Suggest topic{kind === "passage" ? " & title" : ""} with AI
            </label>
            {suggestTopicTitle && (
              <>
                <p className="mt-1.5 text-[11.5px] text-muted">
                  Generated from the text above — translate it first if it&apos;s not in English yet.
                </p>
                <button
                  type="button"
                  onClick={handleClassify}
                  disabled={!body.trim() || classifying}
                  className="mt-2.5 flex h-7 items-center gap-1.5 rounded-full border-[1.5px] border-primary/40 bg-primary/10 px-3 text-[11.5px] font-bold text-primary transition-colors hover:border-primary hover:bg-primary/15 disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-transparent disabled:text-muted"
                >
                  {classifying ? <Spinner className="h-3 w-3 text-primary" /> : "✨"}
                  {classifying ? "Generating…" : `Generate topic${kind === "passage" ? " & title" : ""}`}
                </button>
                <AiProgressBar active={classifying} label="Analysing with GPT-4o mini…" />
                <div className="mt-1.5 text-[11.5px]">
                  {classifyError && <p className="font-semibold text-red-600">{classifyError}</p>}
                  {!classifyError && classifySnapshot && (
                    <p className="font-semibold text-primary">
                      Applied topic{kind === "passage" ? " & title" : ""} suggestion.{" "}
                      <button type="button" onClick={undoClassify} className="underline hover:no-underline">
                        Undo
                      </button>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Author</span>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              type="text"
              maxLength={QUOTE_LIMITS.author}
              placeholder="Ibn al-Qayyim al-Jawziyyah"
              className={inputClasses}
            />
            <CharCount value={author} limit={QUOTE_LIMITS.author} />
          </label>

          <label className="flex items-center gap-2.5 text-[13.5px] text-text">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Published — visible on the public Wall of Quotes
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={`mt-1.5 flex h-12 items-center justify-center gap-[9px] rounded-full text-[14.5px] font-bold transition-colors duration-200 ${
              isValid && !submitting
                ? "cursor-pointer bg-primary text-white hover:brightness-[1.07]"
                : "cursor-not-allowed bg-surface-2 text-muted"
            }`}
          >
            {submitting ? "Saving…" : initial ? "Save changes" : "Publish quote"}
          </button>
          {error && <p className="text-[13.5px] font-semibold text-red-600">{error}</p>}
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <span className="text-[11.5px] font-bold tracking-[0.08em] text-muted uppercase">Live preview</span>
          <div className="mt-3 flex justify-center rounded-[18px] border border-border bg-surface-2 p-6">
            <div className="w-full max-w-[300px]">
              <QuoteCard quote={draftEntry} onOpen={() => setPreviewOpen(true)} sway={false} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="mt-3 flex h-10 w-full items-center justify-center rounded-full border-[1.5px] border-border-strong bg-surface text-[13px] font-bold text-text transition-colors hover:border-primary"
          >
            Preview full modal
          </button>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[640px] p-8 sm:p-[52px]" showClose={false}>
          <QuoteModalContent quote={draftEntry} onClose={() => setPreviewOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
