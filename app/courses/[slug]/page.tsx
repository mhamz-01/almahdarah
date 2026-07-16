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
import { getPublishedReviews } from "@/lib/supabase";
import type { AccentToken, CourseTestimonial, ReviewRow } from "@/lib/types";

export const revalidate = 3600;

const REVIEW_ACCENTS: AccentToken[] = ["primary", "green", "gold", "navy", "primary-2"];
const REVIEWER_LABEL: Record<ReviewRow["reviewer_type"], string> = {
  parent: "Parent",
  student: "Student",
};

function hashSlug(slug: string) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) % 100000;
  return hash;
}

function reviewsForCourse(reviews: ReviewRow[], slug: string): CourseTestimonial[] {
  if (reviews.length === 0) return [];
  const offset = hashSlug(slug) % reviews.length;
  const picks = Array.from({ length: Math.min(3, reviews.length) }, (_, i) => reviews[(offset + i) % reviews.length]);
  return picks.map((review, i) => ({
    quote: review.review_text,
    name: review.name,
    role: `${REVIEWER_LABEL[review.reviewer_type]} · ${review.city}, ${review.country}`,
    accent: REVIEW_ACCENTS[i % REVIEW_ACCENTS.length],
  }));
}

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

  let testimonials = course.testimonials;
  if (course.type === "free") {
    const { data } = await getPublishedReviews();
    testimonials = reviewsForCourse(data ?? [], slug);
  }

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
          <CourseTestimonials testimonials={testimonials} />
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