import type { ReactNode } from "react";
import { HomeHeader } from "@/components/home/home-header";
import { HomeFooter } from "@/components/home/sections";
import { DsBody } from "@/components/home/ds-body";
import { dsFontVariables } from "@/lib/fonts-v2";

/**
 * Page shell for the v2 design system: the new header and footer, the v2 colour/type tokens and
 * fonts. Used by the inner public pages (reviews, quotes, courses) so they match the home page.
 */
export function V2Page({
  children,
  bare = false,
}: {
  children: ReactNode;
  /** skip the top padding that clears the fixed header (for pages with their own full-bleed hero) */
  bare?: boolean;
}) {
  return (
    <div data-ds="v2" className={`${dsFontVariables} min-h-screen`}>
      <DsBody fonts={dsFontVariables} />
      <HomeHeader />
      <main className={bare ? "" : "pt-[88px]"}>{children}</main>
      <HomeFooter />
    </div>
  );
}
