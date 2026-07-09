import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/admin/logout-button";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-6 py-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image
              src="/assets/almahdrah-logo.png"
              alt="Al-Mahdrah"
              width={32}
              height={32}
              className="h-8 w-auto [filter:var(--logo-filter)]"
            />
            <span className="font-display text-sm tracking-[0.01em] text-ink">AL-MAHDRAH ADMIN</span>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1160px] flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
