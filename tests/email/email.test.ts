import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isoWeekday, pakistanDateOf, pakistanToday, previousWeek } from "@/lib/email/dates";
import { buildPlanReminder, buildWeeklyDigest, reminderHasContent } from "@/lib/email/digest";
import { validateEmailPrefs } from "@/lib/email/prefs";
import { esc, renderPlanReminder, renderWeeklyDigest } from "@/lib/email/templates";
import type { AttendanceRow, BoardCardRow, ClassScheduleRow, StudentRow, StudentTaskRow, TaskRow } from "@/lib/types";

const SITE = "https://example.test";

const student: StudentRow = {
  id: 1,
  created_at: "2026-09-01T00:00:00Z",
  name: "Aisha Khan",
  username: "aisha",
  avatar_color: "#1182a3",
  email: "aisha@example.com",
  phone: null,
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
const schedule: ClassScheduleRow[] = DAYS.map((day, i) => ({
  id: i + 1, day, subject: `Subject ${day}`, start_time: "5:00 PM", duration: "1h", teacher: "T", color: "#000",
  status: "scheduled", note: "", sort_order: i, updated_at: "", published_at: null,
}));

function present(date: string): AttendanceRow {
  return { id: 0, student_id: 1, class_date: date, day: "Monday", status: "present", created_at: "" };
}

function personal(over: Partial<StudentTaskRow>): StudentTaskRow {
  return {
    id: 1, student_id: 1, created_at: "2026-10-01T00:00:00Z", subject: null, title: "Task", description: "", due_date: null,
    planned_date: null, completed: false, completed_at: null, notes: "", attachments: [], ...over,
  };
}

describe("dates", () => {
  it("uses Pakistan time for today", () => {
    assert.equal(pakistanToday(new Date("2026-10-18T20:30:00Z")), "2026-10-19"); // 01:30 on the 19th in Pakistan
    assert.equal(pakistanToday(new Date("2026-10-18T18:59:00Z")), "2026-10-18");
    assert.equal(pakistanDateOf("2026-10-18T20:30:00Z"), "2026-10-19");
  });

  it("numbers weekdays Monday=1 to Sunday=7", () => {
    assert.equal(isoWeekday("2026-10-19"), 1);
    assert.equal(isoWeekday("2026-10-25"), 7);
  });

  it("reports on the Monday-to-Sunday week before today", () => {
    assert.deepEqual(previousWeek("2026-10-19"), { start: "2026-10-12", end: "2026-10-18" });
    assert.deepEqual(previousWeek("2026-10-22"), { start: "2026-10-12", end: "2026-10-18" });
  });
});

describe("buildWeeklyDigest", () => {
  const base = {
    student,
    schedule,
    assignedTasks: [] as TaskRow[],
    boardCards: [] as BoardCardRow[],
    weekStart: "2026-10-12",
    todayIso: "2026-10-19",
  };

  it("counts attended and missed classes for the finished week", () => {
    const d = buildWeeklyDigest({ ...base, attendance: [present("2026-10-12"), present("2026-10-13")], personalTasks: [] });
    assert.equal(d.classes.held, 5);
    assert.equal(d.classes.attended, 2);
    assert.equal(d.classes.missed, 3);
    assert.deepEqual(d.classes.days.map((x) => x.status), ["present", "present", "absent", "absent", "absent"]);
    assert.equal(d.inProgress, false);
    assert.equal(d.firstName, "Aisha");
    assert.equal(d.weekLabel, "12 – 18 Oct");
  });

  it("treats a cancelled class as neither held nor missed", () => {
    const cancelled = schedule.map((s) => (s.day === "Friday" ? { ...s, status: "cancelled" as const } : s));
    const d = buildWeeklyDigest({ ...base, schedule: cancelled, attendance: DAYS.slice(0, 4).map((_, i) => present(`2026-10-${12 + i}`)), personalTasks: [] });
    assert.equal(d.classes.held, 4);
    assert.equal(d.classes.attended, 4);
    assert.equal(d.classes.missed, 0);
    assert.equal(d.classes.days[4].status, "cancelled");
  });

  it("includes the finished week in the streak when it was clean", () => {
    const attendance = DAYS.map((_, i) => present(`2026-10-${12 + i}`));
    const d = buildWeeklyDigest({ ...base, attendance, personalTasks: [] });
    assert.equal(d.classes.missed, 0);
    assert.equal(d.streak, 1);
  });

  it("splits tasks into done this week, in progress and to do, and counts overdue", () => {
    const doneThisWeek = personal({ id: 1, title: "Done in week", completed: true, completed_at: "2026-10-14T10:00:00Z" });
    const doneBefore = personal({ id: 2, title: "Done long ago", completed: true, completed_at: "2026-09-20T10:00:00Z" });
    const started = personal({ id: 3, title: "Started", due_date: "2026-10-30" });
    const late = personal({ id: 4, title: "Late one", due_date: "2026-10-15" });
    const cards: BoardCardRow[] = [{ id: 1, student_id: 1, personal_task_id: 3, assigned_task_id: null, status: "in_progress", created_at: "", moved_at: "" }];
    const d = buildWeeklyDigest({ ...base, attendance: [], personalTasks: [doneThisWeek, doneBefore, started, late], boardCards: cards });
    assert.deepEqual(d.tasks.doneThisWeek.lines.map((l) => l.title), ["Done in week"]);
    assert.deepEqual(d.tasks.inProgress.lines.map((l) => l.title), ["Started"]);
    assert.deepEqual(d.tasks.todo.lines.map((l) => l.title), ["Late one"]);
    assert.equal(d.tasks.overdueCount, 1);
    assert.equal(d.tasks.todo.lines[0].overdue, true);
    assert.equal(d.tasks.openCount, 2);
  });

  it("counts a teacher task ticked off during the week as done", () => {
    const assigned: TaskRow[] = [{ id: 9, created_at: "2026-10-01T00:00:00Z", subject: "Fiqh", title: "Worksheet", description: "", due_date: null, attachment_url: null, attachment_name: null, attachment_path: null }];
    const cards: BoardCardRow[] = [{ id: 1, student_id: 1, personal_task_id: null, assigned_task_id: 9, status: "done", created_at: "", moved_at: "2026-10-16T09:00:00Z" }];
    const d = buildWeeklyDigest({ ...base, attendance: [], assignedTasks: assigned, personalTasks: [], boardCards: cards });
    assert.deepEqual(d.tasks.doneThisWeek.lines.map((l) => l.title), ["Worksheet"]);
    assert.equal(d.tasks.openCount, 0);
  });

  it("caps long lists at five but reports the true total", () => {
    const many = Array.from({ length: 8 }, (_, i) => personal({ id: i + 1, title: `T${i}` }));
    const d = buildWeeklyDigest({ ...base, attendance: [], personalTasks: many });
    assert.equal(d.tasks.todo.lines.length, 5);
    assert.equal(d.tasks.todo.total, 8);
  });

  it("marks a week still in progress and does not call future days missed", () => {
    const d = buildWeeklyDigest({ ...base, attendance: [present("2026-10-19")], personalTasks: [], weekStart: "2026-10-19", todayIso: "2026-10-21" });
    assert.equal(d.inProgress, true);
    assert.equal(d.classes.days[0].status, "present");
    assert.equal(d.classes.days[1].status, "absent"); // Tuesday has passed without a punch
    assert.equal(d.classes.days[3].status, "upcoming");
    assert.equal(d.classes.missed, 1);
  });
});

describe("buildPlanReminder", () => {
  it("lists today's planned tasks and earlier unfinished ones, ignoring done and unplanned", () => {
    const tasks = [
      personal({ id: 1, title: "Today A", planned_date: "2026-10-21" }),
      personal({ id: 2, title: "Missed", planned_date: "2026-10-19" }),
      personal({ id: 3, title: "Tomorrow", planned_date: "2026-10-22" }),
      personal({ id: 4, title: "Done today", planned_date: "2026-10-21", completed: true }),
      personal({ id: 5, title: "Unplanned" }),
    ];
    const r = buildPlanReminder(student, tasks, "2026-10-21");
    assert.deepEqual(r.today.lines.map((l) => l.title), ["Today A"]);
    assert.deepEqual(r.missed.lines.map((l) => l.title), ["Missed"]);
    assert.equal(reminderHasContent(r), true);
  });

  it("has no content (so no email) when nothing is planned or missed", () => {
    const r = buildPlanReminder(student, [personal({ planned_date: "2026-10-22" }), personal({ id: 2 })], "2026-10-21");
    assert.equal(reminderHasContent(r), false);
  });
});

describe("email templates", () => {
  const digest = buildWeeklyDigest({
    student, schedule, attendance: [present("2026-10-12")], assignedTasks: [],
    personalTasks: [personal({ title: "<script>alert(1)</script> & revise", subject: 'Fiqh "A"' })],
    boardCards: [], weekStart: "2026-10-12", todayIso: "2026-10-19",
  });

  it("escapes user text in the HTML", () => {
    const { html } = renderWeeklyDigest(digest, SITE);
    assert.ok(!html.includes("<script>alert(1)"));
    assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt; &amp; revise"));
    assert.equal(esc(`<a href="x">'`), "&lt;a href=&quot;x&quot;&gt;&#39;");
  });

  it("builds a subject, links to the portal and a plain-text copy", () => {
    const { subject, html, text } = renderWeeklyDigest(digest, SITE);
    assert.equal(subject, "Your week at Al-Mahdrah · 12 – 18 Oct");
    assert.ok(html.includes(`${SITE}/student`));
    assert.ok(html.includes(`${SITE}/student/reminders`));
    assert.ok(text.includes("Assalamu alaikum, Aisha"));
    assert.ok(text.includes("attended 1 of 5"));
  });

  it("omits empty task sections and says so when there are no tasks", () => {
    const empty = buildWeeklyDigest({ student, schedule, attendance: [], assignedTasks: [], personalTasks: [], boardCards: [], weekStart: "2026-10-12", todayIso: "2026-10-19" });
    const { html } = renderWeeklyDigest(empty, SITE);
    assert.ok(!html.includes("Done this week"));
    assert.ok(!html.includes("In progress ·"));
    assert.ok(html.includes("No tasks right now"));
  });

  it("renders the plan reminder", () => {
    const r = buildPlanReminder(student, [personal({ title: "Revise al-Mulk", planned_date: "2026-10-21" })], "2026-10-21");
    const { subject, html, text } = renderPlanReminder(r, SITE);
    assert.ok(subject.startsWith("Your plan for today"));
    assert.ok(html.includes("Revise al-Mulk"));
    assert.ok(text.includes("Revise al-Mulk"));
    assert.ok(html.includes(`${SITE}/student/tasks`));
  });
});

describe("validateEmailPrefs", () => {
  it("accepts toggles, sorted unique days and a normalised email", () => {
    const r = validateEmailPrefs({ weekly_digest: false, plan_reminder: true, reminder_days: [5, 1, 1, 3], email: "  Aisha@Example.COM " });
    assert.deepEqual(r, { ok: true, value: { weekly_digest: false, plan_reminder: true, reminder_days: [1, 3, 5], email: "aisha@example.com" } });
  });

  it("allows turning every day off", () => {
    assert.deepEqual(validateEmailPrefs({ reminder_days: [] }), { ok: true, value: { reminder_days: [] } });
  });

  it("rejects bad input", () => {
    for (const body of [null, "x", {}, { weekly_digest: "yes" }, { reminder_days: [0] }, { reminder_days: [8] }, { reminder_days: [1.5] }, { reminder_days: "mon" }, { email: "nope" }, { email: 5 }, { email: "a@b" }]) {
      assert.equal(validateEmailPrefs(body).ok, false, JSON.stringify(body));
    }
  });
});
