"use client";

import type { BookingFormState } from "@/lib/types";
import { mentoredCourses } from "@/lib/data/courses";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingDetailsFormProps {
  form: BookingFormState;
  onChange: <K extends keyof BookingFormState>(key: K, value: BookingFormState[K]) => void;
  onContinue: () => void;
  isValid: boolean;
  isSubmitting: boolean;
  submitError: boolean;
}

const inputClasses =
  "h-12 rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

export function BookingDetailsForm({
  form,
  onChange,
  onContinue,
  isValid,
  isSubmitting,
  submitError,
}: BookingDetailsFormProps) {
  return (
    <div>
      <span className="inline-flex items-center gap-2.5 text-[12.5px] font-bold tracking-[0.2em] text-primary uppercase">
        <span className="h-0.5 w-[22px] bg-primary" />
        Step 1 of 2
      </span>
      <h1 className="mt-3.5 font-display text-[clamp(26px,3.4vw,40px)] leading-[1.04] tracking-[-0.01em] text-ink uppercase">
        Tell us a little about you
      </h1>
      <p className="mt-3 max-w-[52ch] text-[15px] text-text">
        Two minutes — then pick a time that works for you. No payment is ever taken here.
      </p>

      <div className="mt-8 flex max-w-[520px] flex-col gap-[18px]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Full name</span>
            <input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              type="text"
              placeholder="Aisha Khan"
              className={inputClasses}
            />
          </label>
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">WhatsApp number</span>
            <input
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              type="tel"
              placeholder="+92 300 1234567"
              className={inputClasses}
            />
          </label>
        </div>

        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">Email address</span>
          <input
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            type="email"
            placeholder="aisha@email.com"
            className={inputClasses}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Country</span>
            <Select value={form.country} onValueChange={(value) => onChange("country", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pakistan">Pakistan</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="UAE">UAE</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Learner&apos;s age group</span>
            <Select value={form.ageGroup} onValueChange={(value) => onChange("ageGroup", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Child (5–12)">Child (5–12)</SelectItem>
                <SelectItem value="Teen (13–17)">Teen (13–17)</SelectItem>
                <SelectItem value="Adult (18+)">Adult (18+)</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>

        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">Interested in</span>
          <Select value={form.course} onValueChange={(value) => onChange("course", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {mentoredCourses.map((course) => (
                <SelectItem key={course.slug} value={course.title}>
                  {course.title}
                </SelectItem>
              ))}
              <SelectItem value="Not sure yet — please advise">
                Not sure yet — please advise
              </SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">
            Anything we should know? <span className="font-medium text-muted">(optional)</span>
          </span>
          <textarea
            value={form.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            rows={3}
            placeholder="e.g. my child has never studied Arabic before…"
            className="resize-y rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] py-[13px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none"
          />
        </label>

        <button
          type="button"
          onClick={onContinue}
          disabled={!isValid || isSubmitting}
          className={`mt-1.5 flex h-[54px] items-center justify-center gap-[9px] rounded-full text-[15.5px] font-bold transition-colors duration-200 ${
            isValid && !isSubmitting
              ? "cursor-pointer bg-primary text-white hover:brightness-[1.07]"
              : "cursor-not-allowed bg-surface-2 text-muted"
          }`}
        >
          {isSubmitting ? (
            "Saving your details…"
          ) : (
            <>
              Continue to pick a time <span className="text-lg">→</span>
            </>
          )}
        </button>
        {submitError && (
          <p className="text-center text-sm font-semibold text-red-600">
            Something went wrong saving your details — please try again.
          </p>
        )}
        <p className="text-center text-xs text-muted">
          🔒 Your details are only used to arrange your class — never shared or sold.
        </p>
      </div>
    </div>
  );
}
