// Server-only. Pipeline step 3: turn a lecture transcript into structured
// study notes (Markdown) with OpenAI. Reads OPENAI_API_KEY; only import from
// route handlers under app/api/admin.

import { NOTES_MODEL } from "@/lib/lesson-notes/config";

const SYSTEM_PROMPT = `You turn a recorded Islamic studies lecture into study notes for students of Al-Mahdrah academy.
The transcript was machine-generated from a lecture delivered mostly in Urdu with Arabic quotations; it may contain recognition mistakes.

Write the notes in clear English Markdown. Rules:
- Only include what the teacher actually said. Never add outside material, opinions or rulings that are not in the lecture.
- Never quote Qur'an or hadith text from memory or from the transcript. Refer to them by citation (e.g. "Al-Fatihah 1:2", "Sahih al-Bukhari") only when the teacher names it, and paraphrase the teacher's explanation.
- Keep Islamic terms in common transliteration with a short English gloss the first time (e.g. "tadabbur (reflection)").
- If a passage is unclear in the transcript, skip it rather than guess.
- Do not use tables or HTML. Do not add a title — the page already shows the lesson name.

Structure (use these headings exactly; omit a section if the lecture has nothing for it):
## Overview
2–4 sentences.
## Key points
Numbered ### subheadings in the order taught, with bullets under each.
## Terms & definitions
- **term** — meaning
## Verses & narrations mentioned
- citation — what the teacher drew from it
## Takeaways
## Review questions
3–5 questions.`;

export async function composeLessonNotes(input: {
  courseTitle: string;
  lessonTitle: string;
  transcript: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Notes generation isn't configured — set OPENAI_API_KEY to enable it");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: NOTES_MODEL,
      reasoning_effort: "low",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Course: ${input.courseTitle}\nLesson: ${input.lessonTitle}\n\nTranscript:\n${input.transcript}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(55_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Notes request failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const notes = data.choices?.[0]?.message?.content?.trim();
  if (!notes) throw new Error("Notes generation returned an empty response");
  return notes;
}
