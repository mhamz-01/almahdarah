"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const inputClasses =
  "h-[50px] w-full rounded-[3px] border border-border-strong bg-surface px-4 text-[15px] text-ink transition-colors focus:border-primary focus:outline-none";
const labelClasses = "mb-2 block text-[12px] font-bold tracking-[0.1em] text-muted uppercase";
const introClasses = "mb-[26px] text-[14.5px] leading-[1.6] text-text";

const PASSWORD_MIN_LENGTH = 6;
const RESEND_SECONDS = 60;

interface Account {
  id: number;
  name: string;
  username: string;
}

type Step = "email" | "code" | "password" | "done";

async function post<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = (await res.json()) as { ok: boolean; error?: string } & T;
    if (!res.ok || !json.ok) return { ok: false, error: json.error ?? "Something went wrong — please try again." };
    return { ok: true, data: json };
  } catch {
    return { ok: false, error: "Something went wrong — please try again." };
  }
}

function SubmitButton({ enabled, busy, label, busyLabel }: { enabled: boolean; busy: boolean; label: string; busyLabel: string }) {
  return (
    <button
      type="submit"
      disabled={!enabled || busy}
      className={`h-[52px] w-full rounded-full text-[15px] font-bold text-white shadow-[var(--shadow-sm)] transition-colors ${
        enabled && !busy ? "cursor-pointer bg-primary hover:brightness-[1.08]" : "cursor-not-allowed bg-primary/60"
      }`}
    >
      {busy ? busyLabel : label}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [doneUsername, setDoneUsername] = useState("");

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  async function requestCode() {
    setError(null);
    setNotice(null);
    setBusy(true);
    const result = await post("/api/student/password-reset/request", { email });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setResendIn(RESEND_SECONDS);
    return true;
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (await requestCode()) {
      setCode("");
      setStep("code");
    }
  }

  async function handleResend() {
    if (await requestCode()) setNotice("A new code is on its way. Only the newest code works.");
  }

  async function handleCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    const result = await post<{ token: string; accounts: Account[] }>("/api/student/password-reset/verify", { email, code });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setToken(result.data.token);
    setAccounts(result.data.accounts);
    setAccountId(result.data.accounts.length === 1 ? result.data.accounts[0].id : null);
    setStep("password");
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setError(null);
    setBusy(true);
    const result = await post<{ username: string }>("/api/student/password-reset/complete", { token, studentId: accountId, password });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDoneUsername(result.data.username);
    setToken("");
    setPassword("");
    setConfirm("");
    setStep("done");
  }

  function startOver() {
    setStep("email");
    setCode("");
    setToken("");
    setError(null);
    setNotice(null);
  }

  const errorLine = error && <p className="mt-3 text-center text-[13.5px] font-semibold text-red-600">{error}</p>;

  if (step === "email") {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return (
      <form onSubmit={handleEmail}>
        <p className={introClasses}>Enter the email address you used when you requested your account. We&apos;ll send you a 6-digit code.</p>
        <label className="mb-[22px] block">
          <span className={labelClasses}>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="ahmad@example.com"
            className={inputClasses}
          />
        </label>
        <SubmitButton enabled={valid} busy={busy} label="Send code" busyLabel="Sending…" />
        {errorLine}
      </form>
    );
  }

  if (step === "code") {
    return (
      <form onSubmit={handleCode}>
        <p className={introClasses}>
          If an account uses <strong className="break-all text-ink">{email.trim()}</strong>, a 6-digit code is on its way. It expires in 10 minutes.
          Check your spam folder too.
        </p>
        <label className="mb-3 block">
          <span className={labelClasses}>Verification code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="123456"
            className={`${inputClasses} text-center font-mono text-[22px] tracking-[0.4em]`}
          />
        </label>
        <div className="mb-[22px] flex items-center justify-between gap-3 text-[13px]">
          <button type="button" onClick={startOver} className="cursor-pointer font-bold text-primary">
            Use a different email
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendIn > 0 || busy}
            className={resendIn > 0 || busy ? "cursor-not-allowed text-muted" : "cursor-pointer font-bold text-primary"}
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
        </div>
        <SubmitButton enabled={code.length === 6} busy={busy} label="Verify code" busyLabel="Checking…" />
        {notice && <p className="mt-3 text-center text-[13.5px] text-text">{notice}</p>}
        {errorLine}
      </form>
    );
  }

  if (step === "password") {
    const valid = accountId !== null && password.length >= PASSWORD_MIN_LENGTH && confirm.length > 0;
    return (
      <form onSubmit={handlePassword}>
        <p className={introClasses}>Code verified. Choose a new password. You have 15 minutes to finish.</p>

        {accounts.length > 1 ? (
          <fieldset className="mb-[18px]">
            <legend className={labelClasses}>Which account?</legend>
            <div className="flex flex-col gap-2">
              {accounts.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-[3px] border px-4 py-3 text-[14px] transition-colors ${
                    accountId === a.id ? "border-primary bg-surface" : "border-border-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="account"
                    checked={accountId === a.id}
                    onChange={() => setAccountId(a.id)}
                    className="h-[15px] w-[15px] accent-primary"
                  />
                  <span className="text-ink">{a.name}</span>
                  <span className="ml-auto font-mono text-[13px] text-muted">{a.username}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <p className="mb-[18px] text-[13.5px] text-muted">
            Account: <span className="font-mono font-bold text-ink">{accounts[0]?.username}</span>
          </p>
        )}

        <label className="mb-[18px] block">
          <span className={labelClasses}>New password</span>
          <span className="relative block">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              autoFocus
              maxLength={72}
              placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
              className={`${inputClasses} pr-16`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[12px] font-bold text-primary"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
        </label>

        <label className="mb-[22px] block">
          <span className={labelClasses}>Confirm new password</span>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            maxLength={72}
            className={inputClasses}
          />
        </label>

        <SubmitButton enabled={valid} busy={busy} label="Save new password" busyLabel="Saving…" />
        {errorLine}
        {error && (
          <p className="mt-2 text-center text-[13px]">
            <button type="button" onClick={startOver} className="cursor-pointer font-bold text-primary">
              Start again
            </button>
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="rounded-[3px] border border-border-strong bg-mint p-6">
      <div className="font-display text-[18px] tracking-[0.02em] text-ink uppercase">Password updated</div>
      <p className="mt-3 text-[14.5px] leading-[1.65] text-text">
        You can now sign in as <span className="font-mono font-bold text-ink">{doneUsername}</span> with your new password. You&apos;ve been
        signed out on all other devices.
      </p>
      <Link
        href="/student/login"
        className="mt-5 flex h-[48px] w-full items-center justify-center rounded-full bg-primary text-[15px] font-bold text-white hover:brightness-[1.08]"
      >
        Sign in
      </Link>
    </div>
  );
}
