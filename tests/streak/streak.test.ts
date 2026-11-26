import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateCancellationPayload } from "@/lib/admin/schedule-validation";
import { guessCourseId, planRecordingLinks, resolveCurrentWeekRecordings, resolveRecordingLinks } from "@/lib/recordings-match";
import { computeStudentStats, EMPTY_STREAK_CONTEXT, mondayOf, type StreakContext } from "@/lib/students";
import type { AttendanceRow, ClassScheduleRow, StudentRow, Weekday } from "@/lib/types";

// Mondays: 5, 12, 19, 26 Oct and 2 Nov 2026.
const student: StudentRow = {
  id: 1,
  created_at: "2026-10-05T08:00:00Z",
  name: "Yusuf Ali",
  username: "yusuf",
  avatar_color: "#1182a3",
  email: null,
  phone: null,
};

const FOUR: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday"];
function slot(day: Weekday, id: number, over: Partial<ClassScheduleRow> = {}): ClassScheduleRow {
  return {
    id, day, subject: `${day} class`, start_time: "5:00 PM", duration: "1h", teacher: "T", color: "#000", status: "scheduled",
    note: "", sort_order: id, updated_at: "", published_at: null, active_from: "2000-01-01", course_id: null, ...over,
  };
}
const schedule = FOUR.map((d, i) => slot(d, i + 1));

function present(...dates: string[]): AttendanceRow[] {
  return dates.map((date, i) => ({ id: i, student_id: 1, class_date: date, day: "Monday", status: "present", created_at: "" }));
}
/** Mon–Thu of the week starting `monday` (YYYY-MM-DD, day of month only varies). */
function week(monday: string): string[] {
  return [0, 1, 2, 3].map((i) => {
    const d = new Date(`${monday}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}
function ctx(over: Partial<StreakContext> = {}): StreakContext {
  return { ...EMPTY_STREAK_CONTEXT, schedule, ...over };
}
const at = (iso: string) => new Date(`${iso}T15:00:00Z`);

describe("weekly target follows the timetable", () => {
  it("counts a 4-class week as perfect, and Friday never counts as missed", () => {
    const s = computeStudentStats(student, present(...week("2026-10-05")), at("2026-10-12"), ctx());
    assert.equal(s.streak, 1);
    assert.equal(s.weeks[1].target, 4);
    assert.equal(s.weeks[1].cells[4].status, "no_class");
    assert.equal(s.missedTotal, 0);
  });

  it("leaves a cancelled date out of the target", () => {
    const [mon, tue, wed] = week("2026-10-05");
    const s = computeStudentStats(student, present(mon, tue, wed), at("2026-10-12"), ctx({ cancelledDates: new Set(["2026-10-08"]) }));
    assert.equal(s.weeks[1].target, 3);
    assert.equal(s.weeks[1].cells[3].status, "cancelled");
    assert.equal(s.streak, 1);
  });

  it("pauses the streak when every class in a week is cancelled", () => {
    const cancelled = new Set(week("2026-10-12"));
    const attendance = present(...week("2026-10-05"), ...week("2026-10-19"));
    const s = computeStudentStats(student, attendance, at("2026-10-26"), ctx({ cancelledDates: cancelled }));
    assert.equal(s.weeks[2].outcome, "paused");
    assert.equal(s.streak, 2);
  });

  it("counts the current week as soon as its last class is attended", () => {
    const s = computeStudentStats(student, present(...week("2026-10-05")), at("2026-10-09"), ctx());
    assert.equal(s.weeks[0].outcome, "perfect");
    assert.equal(s.streak, 1);
  });

  it("does not turn past weeks into misses when a class is added later", () => {
    const withFriday = [...schedule, slot("Friday", 9, { active_from: "2026-10-19" })];
    const s = computeStudentStats(student, present(...week("2026-10-05"), ...week("2026-10-12")), at("2026-10-19"), ctx({ schedule: withFriday }));
    assert.equal(s.weeks[1].cells[4].status, "no_class");
    assert.equal(s.streak, 2);
    assert.equal(s.weeks[0].cells[4].status, "upcoming");
  });
});

describe("catching up on a missed class", () => {
  const [mon, tue, wed, thu] = week("2026-10-05");

  it("keeps the streak while waiting for the recording, then breaks it after 7 days", () => {
    const attendance = present(mon, wed, thu);
    const waiting = computeStudentStats(student, attendance, at("2026-10-12"), ctx());
    assert.equal(waiting.weeks[1].cells[1].status, "catch_up");
    assert.equal(waiting.streak, 1);
    assert.equal(waiting.atRisk, true);
    assert.equal(waiting.catchUps[0].state, "waiting");

    const late = computeStudentStats(student, attendance, at("2026-10-15"), ctx());
    assert.equal(late.weeks[1].cells[1].status, "absent");
    assert.equal(late.streak, 0);
  });

  const recording = (linkedAt: string) =>
    new Map([[tue, { lessonId: 50, linkedAt, lesson: { courseId: 3, position: 12, title: "Lesson 12", videoId: "abc", durationSeconds: 3600 } }]]);

  it("shows a linked recording with a 7-day deadline and watch progress", () => {
    const s = computeStudentStats(
      student,
      present(mon, wed, thu),
      at("2026-10-12"),
      ctx({ recordings: recording("2026-10-07T20:00:00Z"), progress: new Map([[50, { completedAt: null, positionSeconds: 1440 }]]) }),
    );
    assert.equal(s.catchUps[0].state, "ready");
    assert.equal(s.catchUps[0].deadline, "2026-10-14");
    assert.equal(s.catchUps[0].watchedSeconds, 1440);
    assert.equal(s.atRisk, true);
  });

  it("counts the class as attended once the whole recording is watched in time", () => {
    const s = computeStudentStats(
      student,
      present(mon, wed, thu),
      at("2026-10-12"),
      ctx({ recordings: recording("2026-10-07T20:00:00Z"), progress: new Map([[50, { completedAt: "2026-10-10T09:00:00Z", positionSeconds: 0 }]]) }),
    );
    assert.equal(s.weeks[1].cells[1].status, "caught_up");
    assert.equal(s.weeks[1].attended, 4);
    assert.equal(s.streak, 1);
    assert.equal(s.atRisk, false);
    assert.equal(s.attendanceRate, 100);
  });

  it("does not count a recording finished after the deadline", () => {
    const s = computeStudentStats(
      student,
      present(mon, wed, thu, ...week("2026-10-12")),
      at("2026-10-16"),
      ctx({ recordings: recording("2026-10-07T20:00:00Z"), progress: new Map([[50, { completedAt: "2026-10-15T09:00:00Z", positionSeconds: 0 }]]) }),
    );
    assert.equal(s.weeks[1].cells[1].status, "absent");
    assert.equal(s.missedTotal, 1);
    assert.equal(s.streak, 1); // this week is complete, the miss reset the earlier run
  });

  it("gives the full 7 days when the recording is linked late", () => {
    const s = computeStudentStats(student, present(mon, wed, thu), at("2026-10-17"), ctx({ recordings: recording("2026-10-12T20:00:00Z") }));
    assert.equal(s.catchUps[0].deadline, "2026-10-19");
    assert.equal(s.weeks[1].cells[1].status, "catch_up");
  });
});

describe("rewards", () => {
  it("tracks best streak, perfect weeks and milestones", () => {
    const mondays = ["2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26", "2026-11-02"];
    const s = computeStudentStats(student, present(...mondays.flatMap(week)), at("2026-11-09"), ctx());
    assert.equal(s.streak, 5);
    assert.equal(s.bestStreak, 5);
    assert.equal(s.perfectWeeks, 5);
    assert.deepEqual(s.earnedMilestones.map((m) => m.weeks), [4]);
    assert.equal(s.nextMilestone?.weeks, 8);
  });

  it("keeps the best streak after a reset", () => {
    const attendance = present(...week("2026-10-05"), ...week("2026-10-12"), ...week("2026-10-19").slice(1), ...week("2026-10-26"));
    const s = computeStudentStats(student, attendance, at("2026-11-02"), ctx());
    assert.equal(s.streak, 1);
    assert.equal(s.bestStreak, 2);
    assert.equal(s.missedTotal, 1);
  });
});

describe("linking recordings", () => {
  const courses = [
    { id: 1, title: "Al-Aqeedah Al-Wasitiyyah" },
    { id: 2, title: "Qasas-un-Nabiyyin (Arabic)" },
    { id: 3, title: "Al-Da' wa al-Dawa' (Arabic Course)" },
  ];

  it("guesses the course from the class name and refuses ties", () => {
    assert.equal(guessCourseId("Aqeedah al-Wasitiyyah", courses), 1);
    assert.equal(guessCourseId("Qasas un Nabiyyin", courses), 2);
    assert.equal(guessCourseId("Arabic", courses), null);
    assert.equal(guessCourseId("Fiqh", courses), null);
  });

  it("links each new lesson to the latest unlinked class on or before the day it was added", () => {
    const sched = [slot("Monday", 1, { course_id: 1 }), slot("Tuesday", 2, { course_id: 1 })];
    const plan = planRecordingLinks({
      schedule: sched,
      courses,
      cancelledDates: new Set(["2026-11-03"]),
      existing: [{ class_date: "2026-11-09", lesson_id: 99 }],
      lessons: [
        { id: 10, course_id: 1, position: 30, created_at: "2026-11-02T18:00:00Z" },
        { id: 11, course_id: 1, position: 31, created_at: "2026-11-10T18:00:00Z" },
        { id: 12, course_id: 1, position: 29, created_at: "2026-10-01T18:00:00Z" },
        { id: 13, course_id: 2, position: 5, created_at: "2026-11-02T18:00:00Z" },
      ],
      todayIso: "2026-11-10",
    });
    assert.deepEqual(plan, [
      { class_date: "2026-11-02", schedule_id: 1, lesson_id: 10 },
      { class_date: "2026-11-10", schedule_id: 2, lesson_id: 11 },
    ]);
  });
});

describe("linking a batch of recordings", () => {
  it("matches several lessons added together to the latest classes, in order", () => {
    const sched = [slot("Monday", 1, { course_id: 1 }), slot("Tuesday", 2, { course_id: 1 }), slot("Wednesday", 3, { course_id: 1 })];
    const plan = planRecordingLinks({
      schedule: sched,
      courses: [{ id: 1, title: "Aqeedah" }],
      cancelledDates: new Set(),
      existing: [],
      lessons: [
        { id: 21, course_id: 1, position: 41, created_at: "2026-11-04T18:00:00Z" },
        { id: 20, course_id: 1, position: 40, created_at: "2026-11-04T18:00:00Z" },
      ],
      todayIso: "2026-11-04",
      lookbackDays: 2,
    });
    assert.deepEqual(plan, [
      { class_date: "2026-11-03", schedule_id: 2, lesson_id: 20 },
      { class_date: "2026-11-04", schedule_id: 3, lesson_id: 21 },
    ]);
  });
});

describe("cancel validation", () => {
  it("accepts a date with a known reason and defaults to notifying", () => {
    const r = validateCancellationPayload({ date: "2026-11-25", reason: "Holiday" });
    assert.deepEqual(r, { ok: true, value: { class_date: "2026-11-25", reason: "Holiday", note: "", notify: true } });
  });

  it("rejects bad dates and reasons", () => {
    assert.equal(validateCancellationPayload({ date: "2026-02-30" }).ok, false);
    assert.equal(validateCancellationPayload({ date: "2026-11-25", reason: "Bored" }).ok, false);
  });
});

describe("dates", () => {
  it("finds the Monday of any day", () => {
    assert.equal(mondayOf("2026-11-25"), "2026-11-23");
    assert.equal(mondayOf("2026-11-29"), "2026-11-23");
    assert.equal(mondayOf("2026-11-23"), "2026-11-23");
  });
});

describe("late uploads in the current week", () => {
  const courses = [{ id: 1, title: "Arbaeen an-Nawawi (Hadith)" }, { id: 2, title: "Aqeedah" }];

  it("shows the latest video of the course uploaded since the missed class", () => {
    const sched = [slot("Monday", 1, { course_id: 1 }), slot("Tuesday", 2, { course_id: 2 })];
    const map = resolveCurrentWeekRecordings({
      schedule: sched,
      courses,
      cancelledDates: new Set(),
      adminLinkedDates: new Set(),
      lessons: [
        { id: 30, course_id: 1, position: 30, created_at: "2026-11-25T18:00:00Z" }, // Monday's Hadith, uploaded Wednesday
        { id: 31, course_id: 2, position: 8, created_at: "2026-11-24T18:00:00Z" },
      ],
      todayIso: "2026-11-25",
    });
    assert.equal(map.get("2026-11-23")?.lessonId, 30);
    assert.equal(map.get("2026-11-24")?.lessonId, 31);
  });

  it("stops at the course's next class that week, so it never takes that class's video", () => {
    const sched = [slot("Monday", 1, { course_id: 1 }), slot("Thursday", 4, { course_id: 1 })];
    const map = resolveCurrentWeekRecordings({
      schedule: sched,
      courses,
      cancelledDates: new Set(),
      adminLinkedDates: new Set(),
      lessons: [
        { id: 40, course_id: 1, position: 40, created_at: "2026-11-24T18:00:00Z" },
        { id: 41, course_id: 1, position: 41, created_at: "2026-11-26T18:00:00Z" },
      ],
      todayIso: "2026-11-27",
    });
    assert.equal(map.get("2026-11-23")?.lessonId, 40);
    assert.equal(map.get("2026-11-26")?.lessonId, 41);
  });

  it("leaves a class alone when the admin picked its recording", () => {
    const map = resolveCurrentWeekRecordings({
      schedule: [slot("Monday", 1, { course_id: 1 })],
      courses,
      cancelledDates: new Set(),
      adminLinkedDates: new Set(["2026-11-23"]),
      lessons: [{ id: 50, course_id: 1, position: 50, created_at: "2026-11-24T18:00:00Z" }],
      todayIso: "2026-11-25",
    });
    assert.equal(map.has("2026-11-23"), false);
  });
});

describe("missed classes from earlier weeks", () => {
  it("finds last week's recording even when the nightly sync never stored a link", () => {
    // Today is Thursday 26 Nov; the Hadith class on Tue 17 Nov was missed and its video came in that night.
    const { thisWeek, older } = resolveRecordingLinks({
      schedule: [slot("Tuesday", 2, { course_id: 1 })],
      courses: [{ id: 1, title: "Arbaeen an-Nawawi (Hadith)" }],
      cancelledDates: new Set(),
      existing: [],
      lessons: [
        { id: 60, course_id: 1, position: 60, created_at: "2026-11-17T18:00:00Z" },
        { id: 61, course_id: 1, position: 61, created_at: "2026-11-24T18:00:00Z" },
      ],
      todayIso: "2026-11-26",
    });
    assert.equal(thisWeek.get("2026-11-24")?.lessonId, 61);
    assert.deepEqual(older, [{ class_date: "2026-11-17", schedule_id: 2, lesson_id: 60, addedAt: "2026-11-17T18:00:00Z" }]);
  });
});
