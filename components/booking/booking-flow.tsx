"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookingHeader } from "@/components/booking/booking-header";
import { BookingDetailsForm } from "@/components/booking/booking-details-form";
import { BookingCalendlyLauncher } from "@/components/booking/booking-calendly-launcher";
import { BookingConfirmationBanner } from "@/components/booking/booking-confirmation-banner";
import { BookingTrustPanel } from "@/components/booking/booking-trust-panel";
import { mentoredCourses } from "@/lib/data/courses";
import { CALENDLY_URL } from "@/lib/config";
import type { BookingFormState } from "@/lib/types";

const DEFAULT_COURSE = mentoredCourses[0]?.title ?? "Tajwīd & Recitation";

export function BookingFlow() {
  const searchParams = useSearchParams();

  const initialCourse = useMemo(() => {
    const requested = searchParams.get("course");
    if (requested && mentoredCourses.some((course) => course.title === requested)) return requested;
    return DEFAULT_COURSE;
  }, [searchParams]);

  const [step, setStep] = useState<1 | 2>(1);
  const [calendlyOpened, setCalendlyOpened] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [form, setForm] = useState<BookingFormState>(() => ({
    name: "",
    phone: "",
    email: "",
    country: "",
    ageGroup: "",
    course: initialCourse,
    notes: "",
  }));

  function updateField<K extends keyof BookingFormState>(key: K, value: BookingFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleContinue() {
    setSubmitError(false);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/book-a-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStep(2);
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const step1Valid = Boolean(
    form.name.trim() && form.phone.trim() && form.email.trim() && form.country && form.ageGroup,
  );
  const firstName = form.name.trim().split(" ")[0] || "there";

  return (
    <>
      <BookingHeader step={step} scheduled={scheduled} />

      <main className="mx-auto grid w-full max-w-[1160px] flex-1 grid-cols-1 items-start gap-9 px-6 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14 lg:py-16">
        <div>
          {step === 1 && (
            <BookingDetailsForm
              form={form}
              onChange={updateField}
              onContinue={handleContinue}
              isValid={step1Valid}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}

          {step === 2 && (
            <div>
              {scheduled ? (
                <BookingConfirmationBanner firstName={firstName} email={form.email} />
              ) : (
                <>
                  <span className="inline-flex items-center gap-2.5 text-[12.5px] font-bold tracking-[0.2em] text-primary uppercase">
                    <span className="h-0.5 w-[22px] bg-primary" />
                    Step 2 of 2
                  </span>
                  <h1 className="mt-3.5 font-display text-[clamp(26px,3.4vw,40px)] leading-[1.04] tracking-[-0.01em] text-ink uppercase">
                    Pick a time that suits you
                  </h1>
                  <p className="mt-3 max-w-[52ch] text-[15px] text-text">
                    30 minutes, over video call — for your demo on{" "}
                    <strong className="text-ink">{form.course}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-5 inline-flex h-11 items-center rounded-full border-[1.5px] border-border-strong bg-surface px-5 text-[13.5px] font-semibold text-fg transition-colors duration-200 hover:border-primary"
                  >
                    ← Back to details
                  </button>

                  <div className="mt-6 flex flex-col items-start gap-5 rounded-[22px] border border-border bg-surface p-8 shadow-[var(--shadow-sm)]">
                    {!CALENDLY_URL ? (
                      <p className="max-w-[46ch] text-[15px] text-text">
                        Scheduling isn&apos;t connected yet — set{" "}
                        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">
                          NEXT_PUBLIC_CALENDLY_URL
                        </code>{" "}
                        to enable live booking.
                      </p>
                    ) : !calendlyOpened ? (
                      <>
                        <p className="max-w-[46ch] text-[15px] text-text">
                          Calendly will open in a new tab — pick any time that works for you there, then come
                          back here to confirm.
                        </p>
                        <BookingCalendlyLauncher
                          url={CALENDLY_URL}
                          prefillName={form.name}
                          prefillEmail={form.email}
                          onOpen={() => setCalendlyOpened(true)}
                        />
                      </>
                    ) : (
                      <>
                        <p className="max-w-[46ch] text-[15px] text-text">
                          Once you&apos;ve picked a time in the Calendly tab, come back here to finish up.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setScheduled(true)}
                            className="flex h-[54px] items-center justify-center gap-[9px] rounded-full bg-primary px-[26px] text-[15.5px] font-bold text-white transition-colors duration-200 hover:brightness-[1.07]"
                          >
                            I&apos;ve booked my time
                          </button>
                          <BookingCalendlyLauncher
                            url={CALENDLY_URL}
                            prefillName={form.name}
                            prefillEmail={form.email}
                            label="Reopen Calendly"
                            variant="outline"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <BookingTrustPanel />
      </main>
    </>
  );
}
