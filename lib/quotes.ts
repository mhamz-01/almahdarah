import type { AccentToken, QuoteEntry, QuoteRow } from "@/lib/types";

export const TOPIC_COLOR: Record<AccentToken, string> = {
  primary: "var(--primary)",
  "primary-2": "var(--primary-2)",
  navy: "var(--navy)",
  gold: "#8a6b12",
  green: "var(--green)",
};

const ACCENT_CYCLE: AccentToken[] = ["primary", "green", "navy", "gold", "primary-2"];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Topics are free text now, so accent colours are assigned deterministically
// from the topic string itself instead of a fixed key -> accent lookup.
export function accentFor(topic: string): AccentToken {
  return ACCENT_CYCLE[hashString(topic) % ACCENT_CYCLE.length];
}

export function colorFor(topic: string) {
  return TOPIC_COLOR[accentFor(topic)];
}

export function toQuoteEntry(row: QuoteRow): QuoteEntry {
  return {
    id: row.id,
    topicKey: row.topic_key,
    type: row.kind,
    title: row.title ?? undefined,
    text: row.body,
    author: row.author,
    publishedAt: row.published_at,
  };
}

const NEW_TAG_WINDOW_MS = 24 * 60 * 60 * 1000;

export function isRecentlyPublished(publishedAt: string | null) {
  if (!publishedAt) return false;
  return Date.now() - new Date(publishedAt).getTime() < NEW_TAG_WINDOW_MS;
}
