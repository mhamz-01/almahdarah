import type { AttendanceCell, AttendanceRow, AttendanceWeek, StudentRow, StudentWithStats, Weekday } from "@/lib/types";

const WEEKDAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function startOfWeekMonday(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatWeekRange(monday: Date): string {
  const friday = addDays(monday, 4);
  if (monday.getUTCMonth() === friday.getUTCMonth()) {
    return `${monday.getUTCDate()}–${friday.getUTCDate()} ${MONTH_ABBR[friday.getUTCMonth()]}`;
  }
  return `${monday.getUTCDate()} ${MONTH_ABBR[monday.getUTCMonth()]} – ${friday.getUTCDate()} ${MONTH_ABBR[friday.getUTCMonth()]}`;
}

// Newest week first: index 0 is the current (in-progress) week.
export function buildWeekStarts(referenceDate: Date, count = 5): Date[] {
  const currentMonday = startOfWeekMonday(referenceDate);
  return Array.from({ length: count }, (_, i) => addDays(currentMonday, -7 * i));
}

export function computeStudentStats(
  student: StudentRow,
  attendance: AttendanceRow[],
  referenceDate: Date,
): StudentWithStats {
  const statusByDate = new Map(attendance.map((a) => [a.class_date, a.status]));

  // Never show weeks from before this student was enrolled — a freshly
  // added student has no history yet, so their calendar (and streak) starts
  // at their join week instead of inheriting 4 phantom "missed" weeks.
  const joinMonday = startOfWeekMonday(new Date(student.created_at));
  const weekStarts = buildWeekStarts(referenceDate, 5).filter((monday) => monday.getTime() >= joinMonday.getTime());

  const weeks: AttendanceWeek[] = weekStarts.map((monday, weekIndex) => {
    const cells: AttendanceCell[] = WEEKDAYS.map((day, dayIndex) => ({
      day,
      status: statusByDate.get(toISODate(addDays(monday, dayIndex))) ?? null,
    }));
    return { range: weekIndex === 0 ? "This week" : formatWeekRange(monday), startDate: toISODate(monday), cells };
  });

  let streak = 0;
  for (let i = 1; i < weeks.length; i++) {
    const cells = weeks[i].cells;
    if (cells.some((c) => c.status === "absent")) break;
    if (!cells.some((c) => c.status === "present")) break;
    streak++;
  }

  const missedTotal = weeks.reduce((n, w) => n + w.cells.filter((c) => c.status === "absent").length, 0);
  const attendedThisWeek = weeks[0].cells.filter((c) => c.status === "present").length;

  let lastMissed = "never";
  for (const w of weeks) {
    const missedCell = w.cells.find((c) => c.status === "absent");
    if (missedCell) {
      lastMissed = `${w.range} · ${missedCell.day.slice(0, 3)}`;
      break;
    }
  }

  return { ...student, streak, missedTotal, attendedThisWeek, lastMissed, weeks };
}
