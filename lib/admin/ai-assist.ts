// Server-only. Two independent OpenAI (gpt-4o-mini) calls used by the admin
// Quotes form: translating a body into English, and — as a separate, opt-in
// step run against the (already-English) text — suggesting a topic and
// title. Only ever import this from route handlers under app/api/admin —
// it reads OPENAI_API_KEY and must never run client-side.

export type QuoteKind = "quote" | "passage";

async function callOpenAI(systemPrompt: string, userText: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("AI assist isn't configured — set OPENAI_API_KEY to enable it");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI assist request failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("AI assist returned an empty response");

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error("AI assist returned malformed output");
  }
}

const TRANSLATE_PROMPT = `You are a precise Arabic-to-English translator for Al-Mahdrah, an Islamic academy's "Wall of Quotes" page.

You will receive the body text of a quote or passage, which may be written in Arabic, English, or a mix of both. Translate it into fluent, natural English that is 100% faithful to the original meaning — do not add, omit, soften, embellish, or paraphrase loosely. Preserve the exact sense, tone, and register of the source. If the text is already in English, return it completely unchanged (do not "improve" or rephrase it).

Respond with ONLY strict JSON matching this exact shape, no markdown, no commentary:
{"translatedText": string}`;

export async function translateQuoteText(text: string): Promise<string> {
  const parsed = await callOpenAI(TRANSLATE_PROMPT, text);
  if (typeof parsed.translatedText !== "string" || !parsed.translatedText.trim()) {
    throw new Error("AI assist returned no translated text");
  }
  return parsed.translatedText.trim();
}

function buildClassifyPrompt(kind: QuoteKind) {
  return `You are a topic-tagger for Al-Mahdrah, an Islamic academy's "Wall of Quotes" page.

You will receive the body text of a ${kind}, already in English. The admin has already fixed its type as "${kind}" — do not reclassify it. Do the following:

1. Topic: suggest one concise topic label (1-3 words, Title Case) capturing the core Islamic theme, e.g. "Sincerity", "Patience", "Knowledge", "Taqwā", "Brotherhood", "Dunyā & Ākhirah". Reuse a well-known Islamic term where it fits naturally but dont mandate to use the topic names i gave in text rather analyse the passage and then suggest a topic better reflecting the paassage.
2. Title: ${
    kind === "passage"
      ? "suggest a short, evocative title for this passage (under 8 words, Title Case, no quotation marks)."
      : "this is a short quote, not a passage — always set title to null. Never invent one."
  }

Respond with ONLY strict JSON matching this exact shape, no markdown, no commentary:
{"topic": string, "title": string | null}`;
}

export async function classifyQuoteTopic(
  text: string,
  kind: QuoteKind,
): Promise<{ topic: string; title: string | null }> {
  const parsed = await callOpenAI(buildClassifyPrompt(kind), text);
  if (typeof parsed.topic !== "string" || !parsed.topic.trim()) {
    throw new Error("AI assist returned no topic suggestion");
  }
  return {
    topic: parsed.topic.trim(),
    title: kind === "passage" && typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : null,
  };
}
