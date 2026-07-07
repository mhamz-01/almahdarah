import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FacultyHero } from "@/components/sections/faculty/faculty-hero";
import { FacultySpecialties } from "@/components/sections/faculty/faculty-specialties";
import { FacultyTimeline } from "@/components/sections/faculty/faculty-timeline";
import { FacultyPhilosophy } from "@/components/sections/faculty/faculty-philosophy";
import { FacultyCourses } from "@/components/sections/faculty/faculty-courses";
import { FacultyDemoCta } from "@/components/sections/faculty/faculty-demo-cta";
import { LazySection } from "@/components/ui/lazy-section";
import { CourseSectionSkeleton } from "@/components/skeletons/course-section-skeleton";
import { getAllFacultySlugs, getFacultyProfile } from "@/lib/data/faculty-profiles";
import { getFacultyCourses, getFacultyFirstName } from "@/lib/faculty-copy";

interface FacultyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllFacultySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: FacultyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const faculty = getFacultyProfile(slug);

  if (!faculty) return {};

  return {
    title: `${faculty.name} | Al-Mahdrah Islamic Academy`,
    description: faculty.bio,
  };
}

export default async function FacultyPage({ params }: FacultyPageProps) {
  const { slug } = await params;
  const faculty = getFacultyProfile(slug);

  if (!faculty) notFound();

  const { courses, hasPaidCourse, primaryCourse } = getFacultyCourses(faculty.courseSlugs);
  const firstName = getFacultyFirstName(faculty.name);

  return (
    <>
      <Header />
      <main>
        <FacultyHero faculty={faculty} hasPaidCourse={hasPaidCourse} primaryCourse={primaryCourse} />

        <LazySection fallback={<CourseSectionSkeleton rows={4} bordered />} minHeight={480}>
          <FacultySpecialties faculty={faculty} />
        </LazySection>

        <LazySection fallback={<CourseSectionSkeleton rows={4} />} minHeight={560}>
          <FacultyTimeline timeline={faculty.timeline} />
        </LazySection>

        <LazySection fallback={<CourseSectionSkeleton rows={1} />} minHeight={420}>
          <FacultyPhilosophy faculty={faculty} />
        </LazySection>

        <LazySection fallback={<CourseSectionSkeleton rows={3} />} minHeight={520}>
          <FacultyCourses courses={courses} firstName={firstName} />
        </LazySection>

        <LazySection fallback={<CourseSectionSkeleton rows={1} />} minHeight={420}>
          <FacultyDemoCta faculty={faculty} hasPaidCourse={hasPaidCourse} primaryCourse={primaryCourse} />
        </LazySection>
      </main>
      <Footer />
    </>
  );
}
