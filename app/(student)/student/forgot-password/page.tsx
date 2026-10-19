import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/student/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Al-Mahdrah Islamic Academy",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        <Link href="/student/login" className="mb-8 inline-flex items-center gap-3">
          <Image
            src="/assets/almahdrah-logo.png"
            alt="Al-Mahdrah"
            width={40}
            height={40}
            className="h-10 w-auto [filter:var(--logo-filter)]"
          />
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Student portal</span>
        </Link>

        <h1 className="mb-2.5 font-display text-[clamp(28px,3.4vw,38px)] leading-none tracking-[-0.01em] text-ink uppercase">
          Reset password
        </h1>

        <ForgotPasswordForm />

        <div className="mt-7 border-t border-border pt-[22px] text-[13px] leading-[1.7] text-muted">
          Remembered it?{" "}
          <Link href="/student/login" className="font-bold text-primary">
            Sign in →
          </Link>
          <br />
          No email on your account? Message your class teacher on WhatsApp.
        </div>
      </div>
    </div>
  );
}
