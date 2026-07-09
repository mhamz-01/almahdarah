"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRatingInput } from "@/components/ui/star-rating-input";
import type { ReviewFormState } from "@/lib/types";

const inputClasses =
  "h-12 rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

const emptyForm: ReviewFormState = {
  reviewerType: "",
  name: "",
  country: "",
  city: "",
  rating: 0,
  reviewText: "",
};

export function ReviewForm() {
  const [form, setForm] = useState<ReviewFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField<K extends keyof ReviewFormState>(key: K, value: ReviewFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const isValid = Boolean(
    form.reviewerType &&
      form.name.trim() &&
      form.country.trim() &&
      form.city.trim() &&
      form.rating > 0 &&
      form.reviewText.trim(),
  );

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitError(false);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[720px] items-center gap-2.5 px-6 py-4">
          <Image
            src="/assets/almahdrah-logo.png"
            alt="Al-Mahdrah"
            width={32}
            height={32}
            className="h-8 w-auto [filter:var(--logo-filter)]"
          />
          <span className="font-display text-sm tracking-[0.01em] text-ink">AL-MAHDRAH</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[720px] flex-1 px-6 py-10 sm:py-14">
        {submitted ? (
          <div className="rounded-[22px] border border-green/30 bg-mint p-7 sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green/15">
              <span className="text-2xl leading-none font-extrabold text-green">✓</span>
            </div>
            <span className="mt-3.5 inline-flex items-center gap-2.5 text-[12.5px] font-bold tracking-[0.2em] text-green uppercase">
              <span className="h-0.5 w-[22px] bg-green" />
              Review received
            </span>
            <h1 className="mt-3.5 font-display text-[clamp(24px,3vw,34px)] leading-[1.04] tracking-[-0.01em] text-ink uppercase">
              Thank you, {form.name.trim().split(" ")[0]}
            </h1>
            <p className="mt-3 max-w-[52ch] text-[15px] text-text">
              Your review means a lot to us and helps other families get to know Al-Mahdrah.
            </p>
            <div className="mt-7">
              <Button href="/" variant="outline" size="md">
                Return home
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <span className="inline-flex items-center gap-2.5 text-[12.5px] font-bold tracking-[0.2em] text-primary uppercase">
              <span className="h-0.5 w-[22px] bg-primary" />
              Share your experience
            </span>
            <h1 className="mt-3.5 font-display text-[clamp(26px,3.4vw,40px)] leading-[1.04] tracking-[-0.01em] text-ink uppercase">
              Tell us about your experience
            </h1>
            <p className="mt-3 max-w-[54ch] text-[15px] text-text">
              A minute of your time — your honest words help other Muslim families discover Al-Mahdrah.
            </p>

            <div className="mt-8 flex max-w-[560px] flex-col gap-[18px]">
              <label className="flex flex-col gap-[7px]">
                <span className="text-[13px] font-bold text-ink">I am a</span>
                <Select
                  value={form.reviewerType}
                  onValueChange={(value) => updateField("reviewerType", value as ReviewFormState["reviewerType"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select one" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <label className="flex flex-col gap-[7px]">
                <span className="text-[13px] font-bold text-ink">Full name</span>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  type="text"
                  placeholder="Aisha Khan"
                  className={inputClasses}
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-[7px]">
                  <span className="text-[13px] font-bold text-ink">Country</span>
                  <input
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    type="text"
                    placeholder="Pakistan"
                    className={inputClasses}
                  />
                </label>
                <label className="flex flex-col gap-[7px]">
                  <span className="text-[13px] font-bold text-ink">City</span>
                  <input
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    type="text"
                    placeholder="Lahore"
                    className={inputClasses}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-[7px]">
                <span className="text-[13px] font-bold text-ink">Your rating</span>
                <StarRatingInput value={form.rating} onChange={(value) => updateField("rating", value)} />
              </div>

              <label className="flex flex-col gap-[7px]">
                <span className="text-[13px] font-bold text-ink">Your review</span>
                <textarea
                  value={form.reviewText}
                  onChange={(e) => updateField("reviewText", e.target.value)}
                  rows={5}
                  placeholder="Share what your experience with Al-Mahdrah has been like…"
                  className="resize-y rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] py-[13px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none"
                />
              </label>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className={`mt-1.5 flex h-[54px] items-center justify-center gap-[9px] rounded-full text-[15.5px] font-bold transition-colors duration-200 ${
                  isValid && !isSubmitting
                    ? "cursor-pointer bg-primary text-white hover:brightness-[1.07]"
                    : "cursor-not-allowed bg-surface-2 text-muted"
                }`}
              >
                {isSubmitting ? "Submitting…" : "Submit review"}
              </button>
              {submitError && (
                <p className="text-center text-sm font-semibold text-red-600">
                  Something went wrong submitting your review — please try again.
                </p>
              )}
              <p className="text-center text-xs text-muted">
                🔒 Shared only with the Al-Mahdrah team — never sold or published without your permission.
              </p>
              <p className="text-center text-xs text-muted">
                <Link href="/" className="underline hover:text-ink">
                  Back to Al-Mahdrah
                </Link>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
