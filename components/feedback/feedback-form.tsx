"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FEEDBACK_AREAS,
  FEEDBACK_RATINGS,
  type FeedbackPayload,
} from "@/lib/feedback";

const MAX_MESSAGE = 4000;

const kicker = "flex items-center gap-2.5 font-mono text-xs tracking-[0.1em] text-primary";
const chipBase =
  "inline-flex min-h-11 select-none items-center justify-center rounded-full border px-[18px] text-sm font-medium transition-all duration-[180ms] ease-out";
const chipOn = "border-primary bg-primary text-primary-ink";
const chipOff = "border-border-strong bg-surface text-ink hover:border-primary";

const emptyForm: FeedbackPayload = { rating: 0, areas: [], message: "" };

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="text-sm font-semibold text-ink">
      {children}
      {hint && <span className="ml-1.5 font-normal text-muted">{hint}</span>}
    </span>
  );
}

export function FeedbackForm() {
  const [form, setForm] = useState<FeedbackPayload>(emptyForm);
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid = Boolean(form.message.trim());

  function toggleArea(value: string) {
    setForm((f) => ({
      ...f,
      areas: f.areas.includes(value) ? f.areas.filter((a) => a !== value) : [...f.areas, value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    setSubmitError(false);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: honeypot }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-paper text-text">
      <div
        className="ds-lattice pointer-events-none absolute inset-x-0 top-0 h-[420px] [mask-image:linear-gradient(#000,transparent)]"
        aria-hidden
      />

      <header className="relative border-b border-border">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-5 py-3.5 sm:px-7">
          <Link href="/" className="flex items-center gap-2.5 text-ink">
            <Image
              src="/assets/almahdrah-logo.png"
              alt=""
              width={30}
              height={30}
              className="h-[30px] w-auto [filter:var(--logo-filter)]"
            />
            <span className="text-base font-bold tracking-[-0.02em]">Al-Mahdrah</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-text transition-colors hover:text-ink">
            ← Home
          </Link>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-[680px] flex-1 px-5 pt-10 pb-28 sm:px-7 sm:pt-16 sm:pb-16">
        {submitted ? (
          <div className="rounded-[22px] border border-border bg-surface p-7 shadow-[0_40px_80px_-50px_rgba(14,42,71,.4)] sm:p-10">
            <span dir="rtl" className="block font-kufi text-[clamp(30px,6vw,44px)] leading-[1.2] text-accent">
              جزاكم الله خيرا
            </span>
            <span className={`${kicker} mt-5`}>FEEDBACK RECEIVED</span>
            <h1 className="mt-3 text-[clamp(28px,5vw,40px)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink">
              Thank you for helping us improve.
            </h1>
            <p className="mt-3.5 max-w-[48ch] text-[15px] leading-[1.6]">
              Every suggestion is read by the Al-Mahdrah team and shapes what we build next.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-ink transition-all duration-[180ms] ease-out hover:-translate-y-px hover:shadow-[0_10px_22px_-10px_rgba(17,130,163,.7)]"
              >
                Return home
              </Link>
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setSubmitted(false);
                }}
                className="min-h-11 px-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Send more feedback
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <span className={kicker}>STUDENT PORTAL · 1 MINUTE</span>
            <h1 className="mt-4 max-w-[16ch] text-[clamp(34px,6vw,52px)] leading-[1.02] font-semibold tracking-[-0.045em] text-ink">
              Help us shape your <em className="font-serif font-medium text-primary">portal.</em>
            </h1>
            <p className="mt-4 max-w-[50ch] text-base leading-[1.6]">
              Tell us what works, what doesn&apos;t, and what would help your studies. Your feedback is anonymous.
            </p>

            <div className="mt-10 flex flex-col gap-8">
              <fieldset>
                <legend className="mb-3">
                  <Label hint="(optional)">How is your portal experience?</Label>
                </legend>
                <div className="grid grid-cols-5 gap-2">
                  {FEEDBACK_RATINGS.map((r) => {
                    const on = form.rating === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        aria-pressed={on}
                        aria-label={r.label}
                        onClick={() => setForm((f) => ({ ...f, rating: on ? 0 : r.value }))}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition-all duration-[180ms] ease-out ${
                          on
                            ? "border-primary bg-primary-soft"
                            : "border-border-strong bg-surface hover:-translate-y-px hover:border-primary"
                        }`}
                      >
                        <span className={`text-[26px] leading-none transition-transform ${on ? "scale-110" : ""}`}>
                          {r.emoji}
                        </span>
                        <span className={`text-[11px] font-medium ${on ? "text-primary" : "text-muted"}`}>
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3">
                  <Label hint="(pick any)">Which part of the portal?</Label>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_AREAS.map((a) => {
                    const on = form.areas.includes(a.value);
                    return (
                      <button
                        key={a.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleArea(a.value)}
                        className={`${chipBase} ${on ? chipOn : chipOff}`}
                      >
                        {on && <span className="mr-1.5">✓</span>}
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="flex flex-col gap-2">
                <Label>Your suggestion</Label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value.slice(0, MAX_MESSAGE) }))}
                  rows={6}
                  required
                  placeholder="What's not working, what's confusing, or what feature would help your studies?"
                  className="w-full resize-y rounded-2xl border border-border-strong bg-surface px-4 py-3.5 text-base text-ink transition-all duration-[180ms] placeholder:text-muted focus:border-primary focus:shadow-[0_0_0_4px_var(--primary-soft)] focus:outline-none sm:text-[15px]"
                />
                <span className="self-end font-mono text-[11px] tracking-[0.06em] text-muted">
                  {form.message.length}/{MAX_MESSAGE}
                </span>
              </label>

              {/* Honeypot: hidden from humans */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />

              {submitError && (
                <p role="alert" className="text-center text-sm font-semibold text-red-600">
                  Something went wrong sending your feedback. Please try again.
                </p>
              )}

              {/* Sticky on mobile so the action is always in thumb reach */}
              <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-[16px] sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={`mx-auto flex h-[52px] w-full max-w-[680px] items-center justify-center rounded-full text-[15px] font-semibold transition-all duration-[180ms] ease-out ${
                    isValid && !isSubmitting
                      ? "cursor-pointer bg-primary text-primary-ink hover:-translate-y-px hover:shadow-[0_10px_22px_-10px_rgba(17,130,163,.7)]"
                      : "cursor-not-allowed bg-mist text-muted"
                  }`}
                >
                  {isSubmitting ? "Sending…" : "Send feedback"}
                </button>
              </div>

              <p className="text-center font-mono text-[11px] tracking-[0.06em] text-muted">
                ANONYMOUS · ONLY THE AL-MAHDRAH TEAM SEES THIS
              </p>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
