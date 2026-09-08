import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StudentLoginForm } from "@/components/student/student-login-form";

export const metadata: Metadata = {
  title: "Student Sign In | Al-Mahdrah Islamic Academy",
  robots: { index: false, follow: false },
};

export default function StudentLoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(168deg, rgba(37,52,93,.92) 0%, rgba(17,130,163,.82) 100%)" }}
        />
        <div className="relative flex h-full flex-col justify-between p-[52px] text-white">
          <Image
            src="/assets/almahdrah-logo.png"
            alt="Al-Mahdrah"
            width={52}
            height={52}
            className="h-[52px] w-auto invert brightness-[1.6]"
          />
          <div>
            <span className="font-mono text-[11px] tracking-[0.28em] text-white/80 uppercase">Student portal</span>
            <p className="mt-4 max-w-[22ch] font-display text-[clamp(28px,3.4vw,44px)] leading-none tracking-[-0.01em] uppercase">
              Your seat in the majlis
            </p>
            <p className="mt-[18px] max-w-[38ch] font-serif text-[17px] leading-[1.55] text-white/90 italic">
              Mark your attendance, follow your classes, and keep your week unbroken.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[390px]">
          <span className="font-mono text-[11px] tracking-[0.26em] text-muted uppercase">Enrolled students only</span>
          <h1 className="mt-4 mb-2.5 font-display text-[clamp(28px,3.4vw,38px)] leading-none tracking-[-0.01em] text-ink uppercase">
            Sign in
          </h1>
          <p className="mb-[30px] text-[14.5px] leading-[1.6] text-text">
            Use the username and password your teacher issued when you enrolled.
          </p>

          <StudentLoginForm />

          <div className="mt-7 border-t border-border pt-[22px] text-[13px] leading-[1.7] text-muted">
            Not enrolled yet?{" "}
            <Link href="/book-a-demo" className="font-bold text-primary">
              Book a free demo class →
            </Link>
            <br />
            Lost your credentials? Message your class teacher on WhatsApp.
          </div>
        </div>
      </div>
    </div>
  );
}
