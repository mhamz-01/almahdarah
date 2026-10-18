"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { readApiJson } from "@/lib/read-api-json";
import { isValidEmail } from "@/lib/email/prefs";

export interface EmailRemindersProps {
  initialEmail: string;
  initialDigest: boolean;
  initialReminder: boolean;
  initialDays: number[];
}

const DAYS = [
  { value: 1, short: "Mon", long: "Monday" },
  { value: 2, short: "Tue", long: "Tuesday" },
  { value: 3, short: "Wed", long: "Wednesday" },
  { value: 4, short: "Thu", long: "Thursday" },
  { value: 5, short: "Fri", long: "Friday" },
  { value: 6, short: "Sat", long: "Saturday" },
  { value: 7, short: "Sun", long: "Sunday" },
];

type Notice = { kind: "ok" | "error"; text: string } | null;

async function patch(body: Record<string, unknown>) {
  const res = await fetch("/api/student/email-prefs", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await readApiJson<{ ok: boolean; error?: string }>(res);
  if (!res.ok || !json.ok) throw new Error(json.error ?? "Couldn't save");
}

function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (next: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-border-strong"
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function Card({ title, description, control, children }: { title: string; description: string; control?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="rounded-[22px] border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          <p className="mt-1 text-[13.5px] leading-[1.55] text-text">{description}</p>
        </div>
        {control}
      </div>
      {children}
    </section>
  );
}

export function EmailReminders({ initialEmail, initialDigest, initialReminder, initialDays }: EmailRemindersProps) {
  const [savedEmail, setSavedEmail] = useState(initialEmail);
  const [email, setEmail] = useState(initialEmail);
  const [digest, setDigest] = useState(initialDigest);
  const [reminder, setReminder] = useState(initialReminder);
  const [days, setDays] = useState(initialDays);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const emailDirty = email.trim().toLowerCase() !== savedEmail;
  const hasEmail = savedEmail !== "";

  async function run(key: string, work: () => Promise<void>, success?: string) {
    setBusy(key);
    setNotice(null);
    try {
      await work();
      if (success) setNotice({ kind: "ok", text: success });
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : "Something went wrong" });
    } finally {
      setBusy(null);
    }
  }

  // Toggles save the moment they change, and roll back if the server refuses.
  function toggle(key: "digest" | "reminder", next: boolean) {
    const set = key === "digest" ? setDigest : setReminder;
    set(next);
    void run(key, async () => {
      try {
        await patch(key === "digest" ? { weekly_digest: next } : { plan_reminder: next });
      } catch (e) {
        set(!next);
        throw e;
      }
    });
  }

  function toggleDay(value: number) {
    const previous = days;
    const next = days.includes(value) ? days.filter((d) => d !== value) : [...days, value].sort((a, b) => a - b);
    setDays(next);
    void run("days", async () => {
      try {
        await patch({ reminder_days: next });
      } catch (e) {
        setDays(previous);
        throw e;
      }
    });
  }

  function saveEmail() {
    const value = email.trim().toLowerCase();
    if (!isValidEmail(value)) {
      setNotice({ kind: "error", text: "Enter a valid email address" });
      return;
    }
    void run(
      "email",
      async () => {
        await patch({ email: value });
        setSavedEmail(value);
        setEmail(value);
      },
      "Email saved",
    );
  }

  function sendTest(kind: "digest" | "reminder") {
    void run(`test-${kind}`, async () => {
      const res = await fetch("/api/student/email-prefs/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const json = await readApiJson<{ ok: boolean; sentTo?: string; error?: string }>(res);
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Couldn't send the test email");
      setNotice({ kind: "ok", text: `Sample sent to ${json.sentTo}. Check your inbox (and spam).` });
    });
  }

  const inputClasses =
    "h-11 w-full rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] text-[14.5px] text-ink transition-colors placeholder:text-muted focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div aria-live="polite" className="min-h-0">
        {notice && (
          <p
            role={notice.kind === "error" ? "alert" : "status"}
            className={`rounded-[14px] border px-4 py-3 text-[13.5px] ${
              notice.kind === "error" ? "border-red-600/30 bg-red-600/10 text-red-600" : "border-green/30 bg-green/10 text-green"
            }`}
          >
            {notice.text}
          </p>
        )}
      </div>

      <Card title="Your email address" description={hasEmail ? "Reminders are sent here." : "Add your email address to receive reminders."}>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            saveEmail();
          }}
        >
          <label className="sr-only" htmlFor="student-email">
            Email address
          </label>
          <input
            id="student-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClasses}
          />
          <Button type="submit" disabled={!emailDirty || busy === "email" || !email.trim()} className="h-11 shrink-0 shadow-none disabled:opacity-40">
            {busy === "email" ? "Saving…" : "Save"}
          </Button>
        </form>
      </Card>

      <Card
        title="Weekly progress email"
        description="Every Monday at 8:00 AM: the classes you attended and missed, your streak, and your tasks (done, in progress and still to do)."
        control={<Switch checked={digest} onChange={(v) => toggle("digest", v)} label="Weekly progress email" disabled={busy === "digest"} />}
      >
        <div className="mt-4">
          <Button variant="outline" onClick={() => sendTest("digest")} disabled={!hasEmail || busy === "test-digest"} className="h-10 text-[13px] disabled:opacity-40">
            {busy === "test-digest" ? "Sending…" : "Send me a sample"}
          </Button>
        </div>
      </Card>

      <Card
        title="My plan reminder"
        description="An email at 7:00 AM on the days you choose, listing what you planned for that day in your weekly plan, plus anything not finished yet. It is skipped when you have nothing planned."
        control={<Switch checked={reminder} onChange={(v) => toggle("reminder", v)} label="My plan reminder" disabled={busy === "reminder"} />}
      >
        <fieldset className={`mt-4 transition-opacity ${reminder ? "" : "opacity-50"}`} disabled={!reminder}>
          <legend className="mb-2 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Send on</legend>
          <div className="grid grid-cols-7 gap-1.5 sm:max-w-[460px]">
            {DAYS.map((d) => {
              const on = days.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  aria-pressed={on}
                  aria-label={d.long}
                  onClick={() => toggleDay(d.value)}
                  className={`h-11 rounded-[12px] border text-[12.5px] font-bold transition-colors ${
                    on ? "border-primary bg-primary text-white" : "border-border-strong bg-surface text-muted hover:text-ink"
                  }`}
                >
                  {d.short}
                </button>
              );
            })}
          </div>
          {reminder && days.length === 0 && <p className="mt-2 text-[12.5px] text-[#8a6b12]">Choose at least one day, or no reminder will be sent.</p>}
        </fieldset>
        <div className="mt-4">
          <Button variant="outline" onClick={() => sendTest("reminder")} disabled={!hasEmail || busy === "test-reminder"} className="h-10 text-[13px] disabled:opacity-40">
            {busy === "test-reminder" ? "Sending…" : "Send me a sample"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
