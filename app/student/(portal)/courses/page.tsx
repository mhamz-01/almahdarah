import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { CourseLessonRow, CourseRow, LessonProgressRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudentCoursesPage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const [coursesRes, lessonsRes, progressRes] = await Promise.all([
    supabase.from("courses").select("*").eq("published", true).order("sort_order", { ascending: true }),
    supabase.from("course_lessons").select("id, course_id"),
    supabase.from("lesson_progress").select("lesson_id, completed").eq("student_id", session.studentId),
  ]);

  const courses = (coursesRes.data as CourseRow[] | null) ?? [];
  const lessons = (lessonsRes.data as Pick<CourseLessonRow, "id" | "course_id">[] | null) ?? [];
  const progress = (progressRes.data as Pick<LessonProgressRow, "lesson_id" | "completed">[] | null) ?? [];
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));

  return (
    <div className="max-w-[1000px]">
      <span className="font-mono text-[11px] tracking-[0.26em] text-muted uppercase">Learn</span>
      <h1 className="mt-3.5 mb-2.5 font-display text-[clamp(28px,3.6vw,42px)] leading-none tracking-[-0.01em] text-ink uppercase">
        Courses
      </h1>
      <p className="mb-[34px] text-[15px] leading-[1.65] text-text">
        Watch lessons right here in the portal. Your place is saved, so you can pick up where you left off.
      </p>

      {coursesRes.error && (
        <p className="mb-4 rounded-[3px] border border-red-600/30 bg-red-600/5 px-4 py-3 text-[13px] text-red-600">
          Couldn&apos;t load courses: {coursesRes.error.message}
        </p>
      )}

      {courses.length === 0 && !coursesRes.error && (
        <p className="rounded-[3px] border border-border bg-surface px-6 py-8 text-[14px] text-text">
          No courses have been published yet.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {courses.map((course) => {
          const courseLessons = lessons.filter((l) => l.course_id === course.id);
          const doneCount = courseLessons.filter((l) => done.has(l.id)).length;
          const pct = courseLessons.length ? Math.round((doneCount / courseLessons.length) * 100) : 0;
          return (
            <Link
              key={course.id}
              href={`/student/courses/${course.id}`}
              className="group overflow-hidden rounded-[3px] border border-border bg-surface transition-colors hover:border-border-strong"
            >
              <div className="relative aspect-video bg-surface-2">
                {course.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                )}
                <span className="absolute right-3 bottom-3 rounded-full bg-black/70 px-3 py-1 font-mono text-[10.5px] text-white">
                  {courseLessons.length} lessons
                </span>
              </div>
              <div className="p-5">
                <div className="font-display text-[17px] text-ink uppercase group-hover:underline">{course.title}</div>
                {course.instructor && <div className="mt-1 font-mono text-[11px] text-muted">{course.instructor}</div>}
                {course.description && (
                  <p className="mt-3 line-clamp-3 text-[13.5px] leading-[1.6] text-text">{course.description}</p>
                )}
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-primary-2" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 font-mono text-[10.5px] text-muted">
                  {doneCount} of {courseLessons.length} completed
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
