"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/config";
import type { JoinCommunityFormState } from "@/lib/types";

interface JoinCommunityDialogProps {
  courseTitle: string;
  children: React.ReactNode;
}

const inputClasses =
  "h-11 rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] text-[14px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

const emptyForm: Omit<JoinCommunityFormState, "courseTitle"> = {
  name: "",
  age: "",
  contact: "",
  message: "",
};

export function JoinCommunityDialog({ courseTitle, children }: JoinCommunityDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function resetAndClose() {
    setOpen(false);
    setTimeout(() => {
      setForm(emptyForm);
      setSubmitted(false);
      setSubmitError(false);
    }, 200);
  }

  const isValid = Boolean(form.name.trim() && form.age.trim() && form.contact.trim() && form.message.trim());

  async function handleSubmit() {
    setSubmitError(false);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/join-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, courseTitle }),
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetAndClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {submitted ? (
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green/15">
              <span className="text-xl leading-none font-extrabold text-green">✓</span>
            </div>
            <DialogTitle className="mt-4">You&apos;re in</DialogTitle>
            <DialogDescription>
              Thanks, {form.name.trim().split(" ")[0]} — tap below to join the WhatsApp community. We&apos;ll also
              reach out on {form.contact.trim()} shortly.
            </DialogDescription>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex h-[52px] items-center justify-center gap-[9px] rounded-full bg-green text-[15px] font-bold text-white transition-transform duration-200 hover:brightness-[1.07]"
            >
              Join community on WhatsApp →
            </a>
          </div>
        ) : (
          <div>
            <span className="inline-flex items-center gap-2.5 text-[11.5px] font-bold tracking-[0.2em] text-primary uppercase">
              <span className="h-0.5 w-[18px] bg-primary" />
              {courseTitle}
            </span>
            <DialogTitle className="mt-2.5">Join the community</DialogTitle>
            <DialogDescription>
              A couple of details first, so we know who&apos;s joining — then you&apos;re straight through.
            </DialogDescription>

            <div className="mt-6 flex flex-col gap-[14px]">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <label className="flex flex-col gap-[6px]">
                  <span className="text-[13px] font-bold text-ink">Full name</span>
                  <input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    type="text"
                    placeholder="Aisha Khan"
                    className={inputClasses}
                  />
                </label>
                <label className="flex flex-col gap-[6px]">
                  <span className="text-[13px] font-bold text-ink">Age</span>
                  <input
                    value={form.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    type="number"
                    min={3}
                    max={120}
                    placeholder="24"
                    className={inputClasses}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-[6px]">
                <span className="text-[13px] font-bold text-ink">WhatsApp number or email</span>
                <input
                  value={form.contact}
                  onChange={(e) => updateField("contact", e.target.value)}
                  type="text"
                  placeholder="+92 300 1234567 or you@email.com"
                  className={inputClasses}
                />
              </label>

              <label className="flex flex-col gap-[6px]">
                <span className="text-[13px] font-bold text-ink">Why would you like to join?</span>
                <textarea
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  rows={3}
                  placeholder="Tell us a little about what you're hoping to get from the community…"
                  className="resize-y rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] py-[11px] text-[14px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none"
                />
              </label>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className={`mt-1 flex h-[50px] items-center justify-center gap-[9px] rounded-full text-[14.5px] font-bold transition-colors duration-200 ${
                  isValid && !isSubmitting
                    ? "cursor-pointer bg-primary text-white hover:brightness-[1.07]"
                    : "cursor-not-allowed bg-surface-2 text-muted"
                }`}
              >
                {isSubmitting ? "Submitting…" : "Join community"}
              </button>
              {submitError && (
                <p className="text-center text-sm font-semibold text-red-600">
                  Something went wrong — please try again.
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
