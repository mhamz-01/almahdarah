import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StickyEnrollBar } from "@/components/layout/sticky-enroll-bar";
import { CourseHero } from "@/components/sections/course/course-hero";
import { CourseOutcomes } from "@/components/sections/course/course-outcomes";
import { CourseCurriculum } from "@/components/sections/course/course-curriculum";
import { CourseTeacher } from "@/components/sections/course/course-teacher";
import { CourseLogistics } from "@/components/sections/course/course-logistics";
import { CourseTestimonials } from "@/components/sections/course/course-testimonials";
import { CourseEnrollCta } from "@/components/sections/course/course-enroll-cta";
import { CourseFaqSection } from "@/components/sections/course/course-faq";
import { LazySection } from "@/components/ui/lazy-section";
import { CourseSectionSkeleton } from "@/components/skeletons/course-section-skeleton";
import { getAllCourseSlugs, getCourseDetail } from "@/lib/data/course-details";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllCourseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseDetail(slug);

  if (!course) return {};

  return {
    title: `${course.title} | Al-Mahdrah Islamic Academy`,
    description: course.subtitle,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseDetail(slug);

  if (!course) notFound();

  return (
    <>
      <Header />
      <main>
        <CourseHero course={course} />

        <LazySection fallback={<CourseSectionSkeleton rows={course.outcomes.length} />} minHeight={560}>
          <CourseOutcomes outcomes={course.outcomes} />
        </LazySection>

        <LazySection fallback={<CourseSectionSkeleton rows={3} bordered />} minHeight={680}>
          <CourseCurriculum modules={course.modules} />
        </LazySection>

        <LazySection fallback={<CourseSectionSkeleton rows={2} />} minHeight={480}>
          <CourseTeacher course={course} />
        </LazySection>

        <LazySection fallback={<CourseSectionSkeleton rows={4} bordered />} minHeight={620}>
          <CourseLogistics logistics={course.logistics} audience={course.audience} />
        </LazySection>

        <LazySection fallback={<CourseSectionSkeleton rows={2} />} minHeight={420}>
          <CourseTestimonials testimonials={course.testimonials} />
        </LazySection>

        <LazySection fallback={<CourseSectionSkeleton rows={3} />} minHeight={620}>
          <CourseEnrollCta course={course} />
        </LazySection>

        <LazySection fallback={<CourseSectionSkeleton rows={3} />} minHeight={520}>
          <CourseFaqSection faqs={course.faqs} />
        </LazySection>
      </main>
      <Footer />
   
    </>
  );
}

{/* <StickyEnrollBar course={course} />i */}