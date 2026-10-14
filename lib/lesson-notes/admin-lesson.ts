// Server-only. Shared preamble for the /api/admin/lesson-notes/[lessonId]/*
// routes: checks the admin session and loads the lesson (with its course).

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { CourseLessonRow, CourseRow } from "@/lib/types";

type Loaded = {
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  lesson: CourseLessonRow;
  course: Pick<CourseRow, "id" | "title">;
};

export function jsonError(error: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

export async function loadLessonForAdmin(params: Promise<{ lessonId: string }>): Promise<Loaded | NextResponse> {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) return jsonError("Unauthorized", 401);

  const lessonId = Number((await params).lessonId);
  if (!Number.isInteger(lessonId)) return jsonError("Invalid lesson", 400);

  const supabase = createSupabaseAdminClient();
  const { data: lesson } = await supabase.from("course_lessons").select("*").eq("id", lessonId).maybeSingle();
  if (!lesson) return jsonError("Lesson not found", 404);

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", (lesson as CourseLessonRow).course_id)
    .maybeSingle();
  if (!course) return jsonError("Course not found", 404);

  return { supabase, lesson: lesson as CourseLessonRow, course: course as Loaded["course"] };
}
