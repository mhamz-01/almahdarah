import { DsBody } from "@/components/home/ds-body";
import { dsFontVariables } from "@/lib/fonts-v2";

// Every student page (sign-in, request access, the portal) uses the v2 design system:
// the same palette and Geist type as the public site. Tokens live in app/globals.css.
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-ds="v2" data-portal="student" className={`${dsFontVariables} min-h-screen`}>
      <DsBody fonts={dsFontVariables} portal="student" />
      {children}
    </div>
  );
}
