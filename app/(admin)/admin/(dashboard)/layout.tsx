import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-text sm:flex-row">
      <AdminSidebar />
      <main className="w-full min-w-0 flex-1 px-5 py-7 sm:px-9 sm:py-10">
        <div className="mx-auto max-w-[1100px]">{children}</div>
      </main>
    </div>
  );
}
