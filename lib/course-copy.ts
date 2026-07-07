import type { CourseDetail } from "@/lib/types";

export function getCourseCopy(type: CourseDetail["type"]) {
  const isPaid = type === "paid";

  return {
    isPaid,
    badgeLabel: isPaid ? "Mentored · Live 1:1" : "Free · Self-paced",
    heroCtaLabel: isPaid ? "Book a free demo" : "Start free course",
    heroCtaSecondary: isPaid ? "See curriculum" : "Preview lesson 1",
    priceLine: isPaid
      ? "Free demo class — tuition arranged directly with your teacher afterward."
      : "Completely free to access — no card required, ever.",
    formatLine: isPaid ? "Live 1:1 sessions" : "Self-paced video",
    certLine: "Certificate on completion",
    trustLine: isPaid ? "Taught, never transactional" : "No sign-up friction",
    coursesAnchor: isPaid ? "/#courses" : "/#free",
    stickyLabel: isPaid ? "Book free demo" : "Start free",
  };
}

export function getCourseCounts(course: Pick<CourseDetail, "modules">) {
  const lessonCount = course.modules.reduce((total, mod) => total + mod.lessons.length, 0);
  return {
    moduleCountLine: `${course.modules.length} modules`,
    lessonCountLine: `${lessonCount} lessons`,
  };
}

export function getBookingHref(course: Pick<CourseDetail, "type" | "title">) {
  if (course.type !== "paid") return "#curriculum";
  return `/book-a-demo?course=${encodeURIComponent(course.title)}`;
}
