import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Sign In | Al-Mahdrah Islamic Academy",
  robots: { index: false, follow: false },
};

const rise = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function AdminLoginPage() {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-paper px-5 py-4 sm:px-8 sm:py-6">
      <div
        aria-hidden
        className="ds-lattice pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_50%_40%,#000_0%,transparent_68%)]"
      />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <header className="relative flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/assets/almahdrah-logo.png" alt="" width={34} height={34} className="h-[34px] w-[34px] object-contain [filter:var(--logo-filter)]" />
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Al-Mahdrah</span>
        </Link>
        <Link href="/" className="rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-[13px] font-medium text-text transition-colors hover:border-border-strong hover:text-ink">
          ← Back to site
        </Link>
      </header>

      <main className="relative flex min-h-0 flex-1 items-center justify-center py-4">
        <div className="ds-rise w-full max-w-[420px] rounded-[24px] border border-border bg-surface p-7 shadow-[var(--shadow-lg)] sm:p-9" style={rise(80)}>
          <span className="font-mono text-[12px] tracking-[0.1em] text-primary uppercase">Admin portal</span>
          <h1 className="mt-3 text-[clamp(30px,4vw,38px)] leading-[1.04] font-semibold tracking-[-0.04em] text-ink">Welcome back.</h1>
          <p className="mt-2.5 mb-7 text-[14.5px] leading-[1.55] text-text">
            Sign in to manage students, classes, courses and the public site.
          </p>
          <AdminLoginForm />
        </div>
      </main>

      <p className="relative text-center font-mono text-[11px] tracking-[0.08em] text-muted uppercase">Staff only · Al-Mahdrah Islamic Academy</p>
    </div>
  );
}
