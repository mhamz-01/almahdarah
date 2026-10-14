// Fault injection for the whole browser-driven pipeline against an in-memory
// fake of the server. The fake keeps saved clips like the database does, and
// injects failures at random. The claims under test:
//   1. a lecture needs exactly ceil(minutes / 20) Gemini requests when nothing fails,
//   2. no matter where failures hit, finished clips are never requested again,
//   3. a run that gives up leaves its finished clips saved, and Resume finishes
//      the job without redoing them,
//   4. failures never push requests past the per-minute limit.
import test from "node:test";
import assert from "node:assert/strict";
import { runNotesPipeline } from "@/components/admin/courses/notes-pipeline";
import { segmentCount } from "@/lib/lesson-notes/config";

const realFetch = globalThis.fetch;
test.afterEach(() => {
  globalThis.fetch = realFetch;
});

const reply = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// Deterministic PRNG so every run of the suite injects the same faults.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

type Fault = "503" | "429-minute" | "html-504" | "network" | null;

function fakeServer(totalSegments: number, nextFault: (segment: number) => Fault) {
  const saved = new Set<number>(); // the database's saved clips
  const log = { geminiRequests: [] as { segment: number; at: number; ok: boolean }[], composeCalls: 0 };
  const clock = { t: 0 };

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const body = JSON.parse(String(init?.body ?? "{}"));
    if (url.endsWith("/start")) {
      return reply(200, {
        ok: true,
        durationSeconds: totalSegments * 1200,
        segmentsTotal: totalSegments,
        doneSegments: [...saved],
      });
    }
    if (url.endsWith("/transcribe")) {
      const fault = nextFault(body.segment);
      log.geminiRequests.push({ segment: body.segment, at: clock.t, ok: fault === null });
      clock.t += 90_000; // a 20-minute clip takes minutes, not milliseconds
      if (fault === "network") throw new TypeError("fetch failed");
      if (fault === "html-504") return new Response("<html>504</html>", { status: 504 });
      if (fault === "503") return reply(503, { ok: false, error: "overloaded", retryable: true });
      if (fault === "429-minute") return reply(503, { ok: false, error: "rate", retryable: true, retryAfterSeconds: 33 });
      saved.add(body.segment);
      return reply(200, { ok: true, segment: body.segment });
    }
    if (url.endsWith("/compose")) {
      log.composeCalls++;
      assert.equal(saved.size, totalSegments, "compose must only run once every clip is saved");
      return reply(200, { ok: true, note: { lesson_id: 1, status: "ready" } });
    }
    throw new Error(`unexpected request ${url}`);
  }) as typeof fetch;

  return {
    saved,
    log,
    deps: {
      sleep: async (ms: number) => void (clock.t += ms),
      now: () => clock.t,
    },
  };
}

const lesson = (minutes: number) => ({ id: 1, youtube_video_id: "vid", duration_seconds: minutes * 60 });
const run = (minutes: number, deps: ReturnType<typeof fakeServer>["deps"], onWait?: (s: number) => void) =>
  runNotesPipeline(
    lesson(minutes),
    {
      restart: false,
      onProgress: (p) => {
        if (onWait && p.phase === "transcribing" && p.waitingSeconds) onWait(p.waitingSeconds);
      },
    },
    deps,
  );

test("request count with no failures: lecture minutes → Gemini requests", async () => {
  const table = [
    [10, 1],
    [20, 1],
    [21, 2],
    [48, 3], // lesson 46
    [60, 3],
    [90, 5],
    [120, 6],
  ] as const;
  for (const [minutes, expected] of table) {
    const server = fakeServer(segmentCount(minutes * 60), () => null);
    await run(minutes, server.deps);
    assert.equal(server.log.geminiRequests.length, expected, `${minutes} min`);
    assert.equal(server.log.composeCalls, 1);
  }
});

test("recovers from every kind of transient failure on every clip", async () => {
  for (const fault of ["503", "429-minute", "html-504", "network"] as const) {
    for (let failing = 0; failing < 3; failing++) {
      let injected = 0;
      const server = fakeServer(3, (seg) => (seg === failing && injected++ < 2 ? fault : null));
      await run(60, server.deps);
      assert.equal(server.saved.size, 3, `${fault} on clip ${failing}`);
      assert.equal(server.log.geminiRequests.length, 3 + 2, "only the failed attempts are extra");
    }
  }
});

test("200 random fault schedules: never lose or redo a finished clip", async () => {
  const faults: Fault[] = ["503", "429-minute", "html-504", "network"];
  let completed = 0;
  let gaveUp = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const rand = rng(seed);
    const server = fakeServer(3, () => (rand() < 0.35 ? faults[Math.floor(rand() * faults.length)] : null));
    try {
      await run(60, server.deps);
      completed++;
      assert.equal(server.saved.size, 3);
    } catch {
      gaveUp++;
    }
    // A clip that succeeded is never requested again.
    const successes = server.log.geminiRequests.filter((r) => r.ok).map((r) => r.segment);
    assert.equal(new Set(successes).size, successes.length, `seed ${seed}: a saved clip was re-requested`);
    // Attempts per clip are capped: 1 try + 3 retries.
    assert.ok(server.log.geminiRequests.length <= 3 * 4, `seed ${seed}: too many requests`);
    // Request starts are >= 15s apart (Gemini free tier: ~4 per minute).
    const times = server.log.geminiRequests.map((r) => r.at);
    for (let i = 1; i < times.length; i++) {
      assert.ok(times[i] - times[i - 1] >= 15_000, `seed ${seed}: requests too close`);
    }
  }
  console.log(`      200 schedules -> ${completed} finished in one go, ${gaveUp} gave up (progress kept)`);
  assert.ok(completed > 0 && gaveUp > 0, "the schedules should exercise both outcomes");
});

test("when a run gives up, finished clips stay saved and Resume only does the rest", async () => {
  // Clip 1 is down for the whole first run (all 4 attempts fail), then recovers.
  let clip1Down = true;
  const server = fakeServer(3, (seg) => (seg === 1 && clip1Down ? "503" : null));
  await assert.rejects(run(60, server.deps));
  assert.deepEqual([...server.saved], [0], "clip 0 is kept");
  const firstRun = server.log.geminiRequests.length; // 1 ok + 4 failed
  assert.equal(firstRun, 5);

  clip1Down = false;
  await run(60, server.deps); // Resume
  assert.equal(server.saved.size, 3);
  const resumed = server.log.geminiRequests.slice(firstRun);
  assert.deepEqual(
    resumed.map((r) => r.segment),
    [1, 2],
    "Resume never re-requests clip 0",
  );
});

test("a permanent (non-retryable) error stops immediately — no wasted requests", async () => {
  let transcribeCalls = 0;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/start")) return reply(200, { ok: true, durationSeconds: 3600, segmentsTotal: 3, doneSegments: [] });
    transcribeCalls++;
    return reply(502, { ok: false, error: "Gemini's daily request limit is used up." });
  }) as typeof fetch;
  await assert.rejects(
    runNotesPipeline(lesson(60), { restart: false, onProgress: () => {} }, { sleep: async () => {} }),
    /daily request limit/,
  );
  assert.equal(transcribeCalls, 1);
});

test("Gemini's retryDelay is honoured when longer than the default wait", async () => {
  let injected = 0;
  const server = fakeServer(1, () => (injected++ < 1 ? "429-minute" : null));
  const waits: number[] = [];
  await run(10, server.deps, (s) => waits.push(s));
  assert.equal(Math.max(...waits), 33, "waited the 33s Gemini asked for, not just the 15s default");
});
