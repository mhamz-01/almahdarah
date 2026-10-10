import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { CoursePlayer } from "@/components/student/course-player";
import type { CourseLessonRow, CourseRow, LessonProgressRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudentCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const { id } = await params;
  const { lesson } = await searchParams;
  const courseId = Number(id);
  if (!Number.isInteger(courseId)) notFound();

  const supabase = createSupabaseAdminClient();
  const [courseRes, lessonsRes] = await Promise.all([
    supabase.from("courses").select("*").eq("id", courseId).eq("published", true).maybeSingle(),
    supabase.from("course_lessons").select("*").eq("course_id", courseId).order("position", { ascending: true }),
  ]);

  const course = courseRes.data as CourseRow | null;
  if (!course) notFound();
  const lessons = (lessonsRes.data as CourseLessonRow[] | null) ?? [];

  const progressRes = lessons.length
    ? await supabase
        .from("lesson_progress")
        .select("*")
        .eq("student_id", session.studentId)
        .in("lesson_id", lessons.map((l) => l.id))
    : { data: [] as LessonProgressRow[] };
  const progress = (progressRes.data as LessonProgressRow[] | null) ?? [];

  // ?lesson=<position> deep-links; otherwise resume the first unfinished lesson.
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
  const requested = lessons.find((l) => String(l.position) === lesson);
  const initial = requested ?? lessons.find((l) => !done.has(l.id)) ?? lessons[0];

  return (
    <div className="max-w-[1200px]">
      <Link href="/student/courses" className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase hover:text-ink">
        ← All courses
      </Link>
      <h1 className="mt-3.5 mb-1.5 font-display text-[clamp(24px,3vw,36px)] leading-none tracking-[-0.01em] text-ink uppercase">
        {course.title}
      </h1>
      {course.instructor && <p className="mb-6 font-mono text-[11px] text-muted">{course.instructor}</p>}

      {lessons.length === 0 ? (
        <p className="rounded-[3px] border border-border bg-surface px-6 py-8 text-[14px] text-text">
          This course has no lessons yet.
        </p>
      ) : (
        <CoursePlayer
          lessons={lessons}
          progress={progress}
          initialLessonId={initial.id}
        />
      )}
    </div>
  );
}
