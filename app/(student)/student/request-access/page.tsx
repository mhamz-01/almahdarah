import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RequestAccessForm } from "@/components/student/request-access-form";

export const metadata: Metadata = {
  title: "Request Portal Access | Al-Mahdrah Islamic Academy",
  robots: { index: false, follow: false },
};

export default function RequestAccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-[460px]">
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
          Request access
        </h1>
        <p className="mb-[30px] text-[14.5px] leading-[1.6] text-text">
          Choose the username and password you want to sign in with. Your teacher will review your request — once it&apos;s
          accepted, you can sign in right away.
        </p>

        <RequestAccessForm />

        <div className="mt-7 border-t border-border pt-[22px] text-[13px] text-muted">
          Already approved?{" "}
          <Link href="/student/login" className="font-bold text-primary">
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}
