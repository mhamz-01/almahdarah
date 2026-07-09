import type { Metadata } from "next";
import Image from "next/image";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Sign In | Al-Mahdrah Islamic Academy",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-bg px-6 text-text">
      <div className="flex items-center gap-2.5">
        <Image
          src="/assets/almahdrah-logo.png"
          alt="Al-Mahdrah"
          width={36}
          height={36}
          className="h-9 w-auto [filter:var(--logo-filter)]"
        />
        <span className="font-display text-base tracking-[0.01em] text-ink">AL-MAHDRAH</span>
      </div>

      <div className="w-full max-w-[420px] rounded-[22px] border border-border bg-surface p-8 shadow-[var(--shadow-md)]">
        <span className="inline-flex items-center gap-2.5 text-[12.5px] font-bold tracking-[0.2em] text-primary uppercase">
          <span className="h-0.5 w-[22px] bg-primary" />
          Admin
        </span>
        <h1 className="mt-3 font-display text-[26px] leading-[1.05] tracking-[-0.01em] text-ink uppercase">
          Sign in to dashboard
        </h1>
        <p className="mt-2 text-[14px] text-text">Leads and reviews are only visible here.</p>

        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
