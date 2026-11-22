import { Suspense } from "react";
import { HomeHeader } from "@/components/home/home-header";
import { HomeHero } from "@/components/home/hero";
import { Tension } from "@/components/home/tension";
import { ReviewsSection } from "@/components/home/reviews-section";
import { Method } from "@/components/home/method";
import {
  FinalCta,
  FreeSection,
  HomeFooter,
  ProgrammesSection,
  RhythmSection,
  SalafSection,
  TeachersSection,
} from "@/components/home/sections";
import { dsFontVariables } from "@/lib/fonts-v2";

// v2 design system: tokens are scoped to [data-ds="v2"] (see app/globals.css) so the rest of the
// site keeps its current look until those pages are migrated.
export default function Home() {
  return (
    <div data-ds="v2" className={`${dsFontVariables} min-h-screen`}>
      <HomeHeader />
      <main>
        <HomeHero />
        <Tension />
        <Method />
        <Suspense fallback={null}>
          <ReviewsSection />
        </Suspense>
        <FreeSection />
        <ProgrammesSection />
        <RhythmSection />
        <TeachersSection />
        <SalafSection />
        <FinalCta />
      </main>
      <HomeFooter />
    </div>
  );
}
