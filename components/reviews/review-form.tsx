"use client";

import { useState } from "react";
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
    <div className="bg-bg text-text">
      <div className="mx-auto w-full max-w-[720px] px-6 py-[clamp(48px,8vw,96px)]">
        {submitted ? (
          <div className="rounded-2xl border border-green/30 bg-mint p-7 sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green/15">
              <span className="text-2xl leading-none font-extrabold text-green">âœ“</span>
            </div>
            <span className="mt-4 block font-mono text-xs tracking-[0.1em] text-green">
              REVIEW RECEIVED
            </span>
            <h1 className="mt-3 text-[clamp(30px,4vw,46px)] leading-[1.04] font-semibold tracking-[-0.04em] text-ink">
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
            <span className="block font-mono text-xs tracking-[0.1em] text-primary">
              SHARE YOUR EXPERIENCE
            </span>
            <h1 className="mt-4 max-w-[16ch] text-[clamp(36px,5vw,60px)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-ink">
              Tell us about your experience
            </h1>
            <p className="mt-5 max-w-[48ch] text-[17px] leading-[1.6] text-text">
              A minute of your time â€” your honest words help other Muslim families discover Al-Mahdrah.
            </p>

            <div className="mt-8 flex max-w-[560px] flex-col gap-[18px]">
              <label className="flex flex-col gap-[7px]">
                <span className="text-[13.5px] font-semibold text-ink">I am a</span>
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
                <span className="text-[13.5px] font-semibold text-ink">Full name</span>
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
                  <span className="text-[13.5px] font-semibold text-ink">Country</span>
                  <input
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    type="text"
                    placeholder="Pakistan"
                    className={inputClasses}
                  />
                </label>
                <label className="flex flex-col gap-[7px]">
                  <span className="text-[13.5px] font-semibold text-ink">City</span>
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
                <span className="text-[13.5px] font-semibold text-ink">Your rating</span>
                <StarRatingInput value={form.rating} onChange={(value) => updateField("rating", value)} />
              </div>

              <label className="flex flex-col gap-[7px]">
                <span className="text-[13.5px] font-semibold text-ink">Your review</span>
                <textarea
                  value={form.reviewText}
                  onChange={(e) => updateField("reviewText", e.target.value)}
                  rows={5}
                  placeholder="Share what your experience with Al-Mahdrah has been likeâ€¦"
                  className="resize-y rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] py-[13px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none"
                />
              </label>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className={`mt-1.5 flex h-[54px] items-center justify-center gap-[9px] rounded-full text-[15.5px] font-semibold transition-colors duration-200 ${
                  isValid && !isSubmitting
                    ? "cursor-pointer bg-primary text-primary-ink hover:-translate-y-px hover:shadow-[0_10px_22px_-10px_rgba(17,130,163,.7)]"
                    : "cursor-not-allowed bg-surface-2 text-muted"
                }`}
              >
                {isSubmitting ? "Submittingâ€¦" : "Submit review"}
              </button>
              {submitError && (
                <p className="text-center text-sm font-semibold text-red-600">
                  Something went wrong submitting your review â€” please try again.
                </p>
              )}
              <p className="text-center text-xs text-muted">
                ðŸ”’ Shared only with the Al-Mahdrah team â€” never sold or published without your permission.
              </p>
              <p className="text-center text-xs text-muted">
                <Link href="/" className="underline hover:text-ink">
                  Back to Al-Mahdrah
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
