import type { CourseDetail } from "@/lib/types";
import { getCourseDetail } from "@/lib/data/course-details";

export function getFacultyCourses(courseSlugs: string[]) {
  const courses = courseSlugs
    .map((slug) => getCourseDetail(slug))
    .filter((course): course is CourseDetail => Boolean(course));

  const hasPaidCourse = courses.some((course) => course.type === "paid");
  const primaryCourse = courses.find((course) => course.type === "paid") ?? courses[0];

  return { courses, hasPaidCourse, primaryCourse, primarySlug: primaryCourse?.slug };
}

export function getFacultyFirstName(name: string) {
  return name.split(" ").slice(-1)[0] ?? name;
}

export function getFacultyBookingHref(primaryCourse?: CourseDetail) {
  if (!primaryCourse) return undefined;
  if (primaryCourse.type === "paid") return `/book-a-demo?course=${encodeURIComponent(primaryCourse.title)}`;
  return `/courses/${primaryCourse.slug}`;
}
