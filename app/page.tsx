import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Vision } from "@/components/sections/vision";
import { Trust } from "@/components/sections/trust";
import { PaidCourses } from "@/components/sections/paid-courses";
import { FreeCourses } from "@/components/sections/free-courses";
import { Faculty } from "@/components/sections/faculty";
// import { Journal } from "@/components/sections/journal"; // hidden for now
import { DemoCta } from "@/components/sections/demo-cta";
import { LazySection } from "@/components/ui/lazy-section";
import { VisionSkeleton } from "@/components/skeletons/vision-skeleton";
import { TrustSkeleton } from "@/components/skeletons/trust-skeleton";
import { PaidCoursesSkeleton } from "@/components/skeletons/paid-courses-skeleton";
import { FreeCoursesSkeleton } from "@/components/skeletons/free-courses-skeleton";
import { FacultySkeleton } from "@/components/skeletons/faculty-skeleton";
// import { JournalSkeleton } from "@/components/skeletons/journal-skeleton"; // hidden for now
import { DemoCtaSkeleton } from "@/components/skeletons/demo-cta-skeleton";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <LazySection fallback={<VisionSkeleton />} minHeight={700}>
          <Vision />
        </LazySection>

        <LazySection fallback={<TrustSkeleton />} minHeight={900}>
          <Trust />
        </LazySection>

        <LazySection fallback={<PaidCoursesSkeleton />} minHeight={800}>
          <PaidCourses />
        </LazySection>

        <LazySection fallback={<FreeCoursesSkeleton />} minHeight={800}>
          <FreeCourses />
        </LazySection>

        <LazySection fallback={<FacultySkeleton />} minHeight={600}>
          <Faculty />
        </LazySection>

        {/* Journal section hidden for now
        <LazySection fallback={<JournalSkeleton />} minHeight={600}>
          <Journal />
        </LazySection>
        */}

        <LazySection fallback={<DemoCtaSkeleton />} minHeight={480}>
          <DemoCta />
        </LazySection>
      </main>
      <Footer />
    </>
  );
}
