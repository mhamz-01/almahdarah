import { DsBody } from "@/components/home/ds-body";
import { dsFontVariables } from "@/lib/fonts-v2";

// The admin area (sign-in and dashboard) uses the v2 design system, like the student
// portal and the public site: same palette, Geist type and lattice. Tokens live in app/globals.css.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-ds="v2" data-portal="admin" className={`${dsFontVariables} min-h-screen`}>
      <DsBody fonts={dsFontVariables} portal="admin" />
      {children}
    </div>
  );
}
