import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { computeStudentStats } from "@/lib/students";
import { AYAHS, AHADITH } from "@/lib/data/reflections";
import type { AttendanceRow, ClassScheduleRow, StudentAuthRow, Weekday } from "@/lib/types";

export const dynamic = "force-dynamic";

const WEEKDAY_BY_UTC_INDEX: (Weekday | null)[] = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", null];

export default async function StudentHomePage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const supabase = createSupabaseAdminClient();
  const [studentRes, attendanceRes, scheduleRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", session.studentId).maybeSingle(),
    supabase.from("attendance").select("*").eq("student_id", session.studentId).order("class_date", { ascending: false }).limit(200),
    supabase.from("class_schedule").select("*").order("sort_order", { ascending: true }),
  ]);

  const student = studentRes.data as StudentAuthRow | null;
  if (!student) redirect("/student/login");

  const attendance = (attendanceRes.data as AttendanceRow[] | null) ?? [];
  const schedule = (scheduleRes.data as ClassScheduleRow[] | null) ?? [];
  const now = new Date();
  const stats = computeStudentStats(student, attendance, now);
  const thisWeek = stats.weeks[0]?.cells ?? [];
  const thisWeekAttended = thisWeek.filter((c) => c.status === "present").length;
  const thisWeekMissed = thisWeek.filter((c) => c.status === "absent").length;
  const heldThisWeek = schedule.filter((s) => s.status === "scheduled").length;

  const todayDay = WEEKDAY_BY_UTC_INDEX[now.getUTCDay()];
  const todayClass = todayDay ? (schedule.find((s) => s.day === todayDay) ?? null) : null;
  const todayLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const firstName = student.name.split(" ")[0];

  const homeStats = [
    { label: "Streak", value: String(stats.streak), detail: "weeks unbroken", colorClass: "text-primary-2" },
    { label: "This week", value: `${thisWeekAttended} / ${heldThisWeek}`, detail: "classes attended", colorClass: "text-green" },
    { label: "Missed", value: String(thisWeekMissed), detail: "classes this week", colorClass: thisWeekMissed ? "text-red-600" : "text-muted" },
    { label: "Classes", value: String(schedule.length), detail: "subjects enrolled", colorClass: "text-navy" },
  ];

  return (
    <div className="max-w-[820px]">
      <span className="font-mono text-[11px] tracking-[0.26em] text-muted uppercase">{todayLabel}</span>
      <h1 className="mt-3.5 mb-2.5 font-display text-[clamp(28px,3.6vw,42px)] leading-none tracking-[-0.01em] text-ink uppercase">
        As-salāmu ʿalaykum, {firstName}
      </h1>
      <p className="mb-[34px] text-[15px] leading-[1.65] text-text">
        Your week at a glance — which classes you sat, and which you missed.
      </p>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-border bg-border lg:grid-cols-4">
        {homeStats.map((s) => (
          <div key={s.label} className="bg-surface p-5">
            <div className="text-[10.5px] font-bold tracking-[0.14em] text-muted uppercase">{s.label}</div>
            <div className={`mt-3 font-display text-[30px] leading-none ${s.colorClass}`}>{s.value}</div>
            <div className="mt-2 font-mono text-[11px] text-muted">{s.detail}</div>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-[18px] rounded-[3px] border border-border-strong bg-surface px-7 py-[26px]">
        <div>
          <span className="text-[10.5px] font-bold tracking-[0.14em] text-primary uppercase">
            {todayClass ? "Today's class" : "No class today"}
          </span>
          <div className="mt-2.5 font-display text-[21px] leading-[1.1] text-ink uppercase">
            {todayClass ? todayClass.subject : "Enjoy your day off"}
          </div>
          {todayClass && (
            <div className="mt-[7px] font-mono text-[12.5px] text-muted">
              {todayClass.start_time} · {todayClass.teacher}
            </div>
          )}
        </div>
        {todayClass && todayClass.status === "scheduled" && (
          <Link
            href="/student/punch"
            className="flex h-12 items-center rounded-full bg-primary px-[26px] text-[14.5px] font-bold text-white transition-colors hover:brightness-[1.08]"
          >
            Mark me present
          </Link>
        )}
      </div>

      <div className="mt-[46px]">
        <div className="mb-[18px] flex items-baseline justify-between gap-3">
          <h2 className="m-0 font-display text-[16px] tracking-[0.02em] text-ink uppercase">The fruits of ṣabr</h2>
          <span className="font-mono text-[11px] text-muted">Your real reward</span>
        </div>
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
          {AYAHS.map((a) => (
            <div key={a.source} className="flex flex-col rounded-[3px] border border-border bg-surface p-6">
              <span className="text-[10.5px] font-bold tracking-[0.14em] uppercase" style={{ color: a.colorVar }}>
                {a.tag}
              </span>
              <p className="mt-4 flex-1 font-serif text-[16px] leading-[1.75] text-ink">{a.text}</p>
              <div className="mt-5 border-t border-border pt-3.5 font-mono text-[11px] text-muted">{a.source}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-[46px]">
        <div className="mb-[18px] flex items-baseline justify-between gap-3">
          <h2 className="m-0 font-display text-[16px] tracking-[0.02em] text-ink uppercase">On ʿilm &amp; ʿamal</h2>
          <span className="font-mono text-[11px] text-muted">Refreshed weekly</span>
        </div>
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
          {AHADITH.map((h) => (
            <div key={h.source} className="flex flex-col rounded-[3px] border border-border bg-bg p-6">
              <span className="text-[10.5px] font-bold tracking-[0.14em] uppercase" style={{ color: h.colorVar }}>
                {h.tag}
              </span>
              <p className="mt-4 flex-1 font-serif text-[16px] leading-[1.7] text-ink italic">&quot;{h.text}&quot;</p>
              <div className="mt-5 border-t border-border pt-3.5 font-mono text-[11px] text-muted">{h.source}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
