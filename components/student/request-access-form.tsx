"use client";

import { useState } from "react";

const inputClasses =
  "h-[50px] w-full rounded-[3px] border border-border-strong bg-surface px-4 text-[15px] text-ink transition-colors focus:border-primary focus:outline-none";
const labelClasses = "mb-2 block text-[12px] font-bold tracking-[0.1em] text-muted uppercase";

export function RequestAccessForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timeAt, setTimeAt] = useState("");
  const [expectations, setExpectations] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isValid = Boolean(
    name.trim() && username.trim() && email.trim() && phone.trim() && password.length >= 6 && timeAt.trim() && expectations.trim(),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          email,
          phone,
          password,
          time_at_almahdrah: timeAt,
          expectations,
          website,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Something went wrong — please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[3px] border border-border-strong bg-mint p-6">
        <div className="font-display text-[18px] tracking-[0.02em] text-ink uppercase">Request sent</div>
        <p className="mt-3 text-[14.5px] leading-[1.65] text-text">
          Thank you, {name.trim().split(" ")[0]}. Your teacher will review your request. Once it&apos;s accepted you can
          sign in with the username and password you chose.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      <label className="block">
        <span className={labelClasses}>Full name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          autoComplete="name"
          placeholder="Ahmad Khalid"
          className={inputClasses}
        />
      </label>

      <label className="block">
        <span className={labelClasses}>Email</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          placeholder="ahmad@example.com"
          className={inputClasses}
        />
      </label>

      <label className="block">
        <span className={labelClasses}>Mobile number</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          autoComplete="tel"
          placeholder="+44 7700 900123"
          className={inputClasses}
        />
      </label>

      <label className="block">
        <span className={labelClasses}>Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="ahmad.k24"
          className={`${inputClasses} font-mono`}
        />
        <span className="mt-1.5 block text-[12px] text-muted">Letters, numbers, dots, underscores and hyphens.</span>
      </label>

      <label className="block">
        <span className={labelClasses}>Password</span>
        <span className="relative block">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className={`${inputClasses} pr-16`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-[12px] font-bold text-primary"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      <label className="block">
        <span className={labelClasses}>How long have you been with Al-Mahdrah?</span>
        <input
          value={timeAt}
          onChange={(e) => setTimeAt(e.target.value)}
          type="text"
          placeholder="e.g. 6 months, 2 years, just starting"
          className={inputClasses}
        />
      </label>

      <label className="block">
        <span className={labelClasses}>What do you expect from the student portal?</span>
        <textarea
          value={expectations}
          onChange={(e) => setExpectations(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Tell us what you'd like to use it for"
          className="w-full resize-y rounded-[3px] border border-border-strong bg-surface px-4 py-3 text-[15px] text-ink transition-colors focus:border-primary focus:outline-none"
        />
      </label>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <input
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <button
        type="submit"
        disabled={!isValid || submitting}
        className={`mt-2 h-[52px] w-full rounded-full text-[15px] font-bold text-white shadow-[var(--shadow-sm)] transition-colors ${
          isValid && !submitting ? "cursor-pointer bg-primary hover:brightness-[1.08]" : "cursor-not-allowed bg-primary/60"
        }`}
      >
        {submitting ? "Sending…" : "Send request"}
      </button>
      {error && <p className="text-center text-[13.5px] font-semibold text-red-600">{error}</p>}
    </form>
  );
}
