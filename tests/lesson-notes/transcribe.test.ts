// Fault injection for the Gemini step: every way Google can fail must end as
// either a retryable error (nothing saved) or a complete transcript — never a
// truncated / looping transcript saved as if it were good.
import test from "node:test";
import assert from "node:assert/strict";
import { RetryableError, checkTranscript, transcribeSegment } from "@/lib/lesson-notes/transcribe";

process.env.GEMINI_API_KEY = "test-key";
const realFetch = globalThis.fetch;
test.afterEach(() => {
  globalThis.fetch = realFetch;
});

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
const ok = (text: string, finishReason = "STOP") =>
  json(200, { candidates: [{ content: { parts: [{ text }] }, finishReason }] });
const mockFetch = (fn: () => Response | Promise<Response>) => {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return fn();
  }) as typeof fetch;
  return () => calls;
};

// ~900 chars/min of non-repeating text, like real speech.
const speech = (minutes: number) => {
  let seed = 7;
  const words: string[] = [];
  let length = 0;
  while (length < minutes * 900) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const word = seed.toString(36);
    words.push(word);
    length += word.length + 1;
  }
  return words.join(" ");
};

const CLIP = [0, 1200] as const;

test("503 'high demand' is retryable", async () => {
  mockFetch(() => json(503, { error: { message: "The model is overloaded." } }));
  await assert.rejects(transcribeSegment("vid", ...CLIP), RetryableError);
});

test("500 / 502 / 504 are retryable", async () => {
  for (const status of [500, 502, 504]) {
    mockFetch(() => json(status, { error: { message: "x" } }));
    await assert.rejects(transcribeSegment("vid", ...CLIP), RetryableError, `status ${status}`);
  }
});

test("503 with an HTML body (not JSON) is still retryable", async () => {
  mockFetch(() => new Response("<html>Service Unavailable</html>", { status: 503 }));
  await assert.rejects(transcribeSegment("vid", ...CLIP), RetryableError);
});

test("per-minute 429 is retryable and carries Gemini's retryDelay", async () => {
  mockFetch(() =>
    json(429, {
      error: {
        message: "rate limited",
        details: [
          { violations: [{ quotaId: "GenerateRequestsPerMinutePerProjectPerModel-FreeTier" }] },
          { retryDelay: "33s" },
        ],
      },
    }),
  );
  await assert.rejects(transcribeSegment("vid", ...CLIP), (err: unknown) => {
    assert.ok(err instanceof RetryableError);
    assert.equal(err.retryAfterSeconds, 33);
    return true;
  });
});

test("daily-quota 429 is NOT retryable (retrying would only burn requests)", async () => {
  mockFetch(() =>
    json(429, {
      error: {
        message: "quota",
        details: [{ violations: [{ quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier" }] }],
      },
    }),
  );
  await assert.rejects(transcribeSegment("vid", ...CLIP), (err: unknown) => {
    assert.ok(err instanceof Error && !(err instanceof RetryableError));
    assert.match(err.message, /daily request limit/);
    return true;
  });
});

test("network failure / timeout is retryable", async () => {
  mockFetch(() => {
    throw new DOMException("timed out", "TimeoutError");
  });
  await assert.rejects(transcribeSegment("vid", ...CLIP), RetryableError);
});

test("200 with an empty body is retryable, not saved as an empty transcript", async () => {
  mockFetch(() => json(200, {}));
  await assert.rejects(transcribeSegment("vid", ...CLIP), RetryableError);
});

test("truncated answer (MAX_TOKENS) is retryable even though it has text", async () => {
  mockFetch(() => ok(speech(10), "MAX_TOKENS"));
  await assert.rejects(transcribeSegment("vid", ...CLIP), RetryableError);
});

test("blocked / RECITATION answers are retryable", async () => {
  for (const reason of ["RECITATION", "SAFETY", "OTHER"]) {
    mockFetch(() => ok("", reason));
    await assert.rejects(transcribeSegment("vid", ...CLIP), RetryableError, reason);
  }
});

test("a looping transcript (same phrase repeated) is retryable", async () => {
  mockFetch(() => ok("السلام علیکم ورحمۃ اللہ ".repeat(400)));
  await assert.rejects(transcribeSegment("vid", ...CLIP), RetryableError);
});

test("absurdly long output for the clip length is retryable", async () => {
  mockFetch(() => ok(speech(20 * 4)));
  await assert.rejects(transcribeSegment("vid", ...CLIP), RetryableError);
});

test("a good transcript is returned unchanged (trimmed)", async () => {
  const text = speech(20);
  mockFetch(() => ok(`  ${text}\n`));
  assert.equal(await transcribeSegment("vid", ...CLIP), text);
});

test("a silent clip that finishes normally is allowed (empty text)", async () => {
  mockFetch(() => ok(""));
  assert.equal(await transcribeSegment("vid", 1200, 1260), "");
});

test("exactly one HTTP request is made per call (no hidden retries)", async () => {
  const calls = mockFetch(() => json(503, { error: { message: "busy" } }));
  await assert.rejects(transcribeSegment("vid", ...CLIP));
  assert.equal(calls(), 1);
});

test("checkTranscript accepts normal text and rejects bad finish reasons", () => {
  assert.equal(checkTranscript(speech(20), "STOP", 1200), null);
  assert.ok(checkTranscript("hello", "MAX_TOKENS", 1200));
  assert.ok(checkTranscript("hello", undefined, 1200));
});
