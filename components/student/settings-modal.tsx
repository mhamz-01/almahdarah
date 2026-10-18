"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { EmailReminders, type EmailRemindersProps } from "@/components/student/email-reminders";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export interface StudentProfile {
  name: string;
  username: string;
  avatarColor: string;
  email: string | null;
  phone: string | null;
  timeAtAlmahdrah: string | null;
  expectations: string | null;
  memberSince: string;
}

export type SettingsSection = "profile" | "appearance" | "email" | "feedback";

const SECTIONS: { key: SettingsSection; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "appearance", label: "Appearance" },
  { key: "email", label: "Email reminders" },
  { key: "feedback", label: "Feedback & complaints" },
];

const KINDS = [
  { value: "feedback", label: "Feedback" },
  { value: "complaint", label: "Complaint" },
  { value: "improvement", label: "Improvement" },
] as const;

const MESSAGE_MAX_LENGTH = 2000;

function initialsFor(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-[3px] border border-border bg-bg px-4 py-3.5">
      <div className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">{label}</div>
      <div className="mt-1.5 text-[14.5px] leading-[1.6] break-words whitespace-pre-wrap text-ink">{value || "—"}</div>
    </div>
  );
}

function ProfileSection({ profile }: { profile: StudentProfile }) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-[22px] text-white"
          style={{ background: profile.avatarColor }}
        >
          {initialsFor(profile.name)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[20px] font-bold text-ink">{profile.name}</div>
          <div className="font-mono text-[12px] text-muted">{profile.username}</div>
        </div>
      </div>
      <p className="mt-5 mb-4 text-[13px] text-muted">These are the details you submitted when you requested access.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" value={profile.name} />
        <Field label="Username" value={profile.username} />
        <Field label="Email" value={profile.email} />
        <Field label="Phone" value={profile.phone} />
        <div className="sm:col-span-2">
          <Field label="Time with Al-Mahdrah" value={profile.timeAtAlmahdrah} />
        </div>
        <div className="sm:col-span-2">
          <Field label="What you expect from the portal" value={profile.expectations} />
        </div>
        <Field label="Member since" value={profile.memberSince} />
      </div>
    </div>
  );
}

const THEMES = [
  { value: "light", label: "Light", hint: "Warm paper tones, easy in daylight" },
  { value: "dark", label: "Dark", hint: "Softer on the eyes at night" },
] as const;

function AppearanceSection() {
  const { resolvedTheme, setTheme } = useTheme();
  const hasMounted = useHasMounted();
  const current = hasMounted ? resolvedTheme : null;

  return (
    <div>
      <p className="mb-4 text-[13.5px] leading-[1.6] text-text">Choose how the portal looks. Your choice is remembered on this device.</p>
      <div role="radiogroup" aria-label="Colour theme" className="grid gap-3 sm:grid-cols-2">
        {THEMES.map((t) => (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={current === t.value}
            onClick={() => setTheme(t.value)}
            className={`rounded-[3px] border-2 px-4 py-4 text-left transition-colors ${
              current === t.value ? "border-primary bg-primary/[0.06]" : "border-border hover:border-border-strong"
            }`}
          >
            <span className="block text-[15px] font-bold text-ink">{t.label}</span>
            <span className="mt-1 block text-[12.5px] text-muted">{t.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FeedbackSection() {
  const [kind, setKind] = useState<(typeof KINDS)[number]["value"]>("feedback");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/student/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, message }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Something went wrong — please try again.");
        return;
      }
      setSent(true);
      setMessage("");
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-[3px] border border-border-strong bg-mint p-6">
        <div className="font-display text-[18px] tracking-[0.02em] text-ink uppercase">Thank you</div>
        <p className="mt-3 text-[14.5px] leading-[1.65] text-text">Your message has been sent to your teachers. Jazakallahu khayran.</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 h-10 rounded-full border border-border-strong px-5 text-[13px] font-bold text-ink hover:border-ink"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-[13.5px] leading-[1.6] text-text">
        Facing an issue, or have an idea to make the portal better? Tell us here.
      </p>
      <div role="radiogroup" aria-label="Type" className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            role="radio"
            aria-checked={kind === k.value}
            onClick={() => setKind(k.value)}
            className={`h-9 rounded-full border px-4 text-[13px] font-bold transition-colors ${
              kind === k.value ? "border-primary bg-primary text-white" : "border-border-strong text-text hover:border-ink"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="mb-2 block text-[12px] font-bold tracking-[0.1em] text-muted uppercase">Your message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MESSAGE_MAX_LENGTH}
          rows={9}
          placeholder="Describe the issue or your suggestion…"
          className="w-full resize-none rounded-[3px] border border-border-strong bg-surface p-4 text-[14.5px] leading-[1.6] text-ink transition-colors focus:border-primary focus:outline-none"
        />
        <span className="mt-1 block text-right font-mono text-[11px] text-muted">
          {message.length}/{MESSAGE_MAX_LENGTH}
        </span>
      </label>
      {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={sending || !message.trim()}
        className="h-11 self-start rounded-full bg-primary px-7 text-[13.5px] font-bold text-white transition-opacity disabled:opacity-50"
      >
        {sending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}

const TITLES: Record<SettingsSection, string> = {
  profile: "Profile",
  appearance: "Appearance",
  email: "Email reminders",
  feedback: "Feedback & complaints",
};

export function SettingsModal({
  open,
  onOpenChange,
  section,
  onSectionChange,
  profile,
  emailPrefs,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  profile: StudentProfile;
  emailPrefs: EmailRemindersProps;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(720px,90vh)] max-w-[960px] flex-col overflow-hidden p-0 sm:p-0 md:flex-row">
        <nav
          aria-label="Settings sections"
          className="flex shrink-0 gap-1.5 border-b border-border bg-bg p-3 pr-14 md:w-[230px] md:flex-col md:border-r md:border-b-0 md:p-5"
        >
          <DialogTitle className="mb-0 hidden text-[15px] md:mb-3 md:block">Settings</DialogTitle>
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => onSectionChange(s.key)}
              aria-current={section === s.key}
              className={`rounded-[3px] border px-3.5 py-2.5 text-left text-[13.5px] transition-colors ${
                section === s.key ? "border-border-strong bg-surface font-bold text-ink" : "border-transparent font-medium text-text hover:border-border"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-6 sm:p-9">
          <DialogDescription className="sr-only">Your profile, email reminders and feedback</DialogDescription>
          <h2 className="mb-6 font-display text-[22px] leading-[1.1] text-ink uppercase">
            {TITLES[section]}
          </h2>
          <div key={section} className="fade-in">
            {section === "profile" && <ProfileSection profile={profile} />}
            {section === "appearance" && <AppearanceSection />}
            {section === "email" && <EmailReminders {...emailPrefs} />}
            {section === "feedback" && <FeedbackSection />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
