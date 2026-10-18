import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDays,
  groupOpenTasks,
  isValidIsoDate,
  paginate,
  planOptions,
  planState,
  shortDate,
  sortForTable,
  summarizeWeek,
  tasksOnDay,
  unplannedTasks,
  weekDays,
  weekRangeLabel,
  weekStart,
  type PlannableTask,
} from "@/lib/task-plan";

function task(over: Partial<PlannableTask> = {}): PlannableTask {
  return { planned_date: null, due_date: null, completed: false, created_at: "2026-10-01T00:00:00Z", ...over };
}

describe("dates", () => {
  it("validates real calendar dates only", () => {
    assert.equal(isValidIsoDate("2026-10-17"), true);
    assert.equal(isValidIsoDate("2026-02-30"), false);
    assert.equal(isValidIsoDate("2026-13-01"), false);
    assert.equal(isValidIsoDate("17-10-2026"), false);
    assert.equal(isValidIsoDate(""), false);
    assert.equal(isValidIsoDate(null), false);
  });

  it("adds days across month and year boundaries", () => {
    assert.equal(addDays("2026-10-31", 1), "2026-11-01");
    assert.equal(addDays("2026-12-31", 1), "2027-01-01");
    assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  });

  it("finds the Monday of any weekday, including Sunday", () => {
    // 2026-10-19 is a Monday
    assert.equal(weekStart("2026-10-19"), "2026-10-19");
    assert.equal(weekStart("2026-10-21"), "2026-10-19");
    assert.equal(weekStart("2026-10-25"), "2026-10-19"); // Sunday belongs to the week before
    assert.equal(weekStart("2026-10-26"), "2026-10-26");
  });

  it("builds a seven day Monday–Sunday week", () => {
    const days = weekDays("2026-10-19");
    assert.equal(days.length, 7);
    assert.equal(days[0], "2026-10-19");
    assert.equal(days[6], "2026-10-25");
  });

  it("survives daylight-saving changes", () => {
    assert.equal(addDays("2026-03-28", 1), "2026-03-29");
    assert.equal(addDays("2026-10-24", 1), "2026-10-25");
    assert.equal(weekDays("2026-10-26").at(-1), "2026-11-01");
  });

  it("formats labels", () => {
    assert.equal(shortDate("2026-10-19"), "Mon 19 Oct");
    assert.equal(weekRangeLabel("2026-10-19"), "19 – 25 Oct");
    assert.equal(weekRangeLabel("2026-10-26"), "26 Oct – 1 Nov");
  });
});

describe("planState", () => {
  const today = "2026-10-21";
  it("covers every state", () => {
    assert.equal(planState(task(), today), "unplanned");
    assert.equal(planState(task({ planned_date: "2026-10-21" }), today), "today");
    assert.equal(planState(task({ planned_date: "2026-10-22" }), today), "upcoming");
    assert.equal(planState(task({ planned_date: "2026-10-20" }), today), "missed");
    assert.equal(planState(task({ planned_date: "2026-10-20", completed: true }), today), "done");
    assert.equal(planState(task({ completed: true }), today), "done");
  });
});

describe("grouping", () => {
  it("lists a day's open tasks before its finished ones", () => {
    const a = task({ planned_date: "2026-10-21", completed: true, created_at: "2026-10-01T00:00:00Z" });
    const b = task({ planned_date: "2026-10-21", created_at: "2026-10-02T00:00:00Z" });
    const c = task({ planned_date: "2026-10-22" });
    assert.deepEqual(tasksOnDay([a, b, c], "2026-10-21"), [b, a]);
  });

  it("lists unplanned open tasks by due date, undated last", () => {
    const later = task({ due_date: "2026-10-30" });
    const sooner = task({ due_date: "2026-10-25" });
    const undated = task();
    const planned = task({ planned_date: "2026-10-21" });
    const done = task({ completed: true });
    assert.deepEqual(unplannedTasks([undated, later, planned, done, sooner]), [sooner, later, undated]);
  });
});

describe("summarizeWeek", () => {
  const days = weekDays("2026-10-19");
  it("counts planned, done and missed tasks inside the week only", () => {
    const tasks = [
      task({ planned_date: "2026-10-19", completed: true }),
      task({ planned_date: "2026-10-20" }), // missed (before today)
      task({ planned_date: "2026-10-22" }), // upcoming
      task({ planned_date: "2026-10-27" }), // next week — ignored
      task(), // unplanned — ignored
    ];
    assert.deepEqual(summarizeWeek(tasks, days, "2026-10-21"), { planned: 3, done: 1, missed: 1, pct: 33 });
  });

  it("reports null percentage for an empty week", () => {
    assert.deepEqual(summarizeWeek([], days, "2026-10-21"), { planned: 0, done: 0, missed: 0, pct: null });
  });
});

describe("sortForTable", () => {
  it("puts open tasks first, then planned day, due date, newest", () => {
    const done = task({ completed: true, planned_date: "2026-10-18" });
    const lateDay = task({ planned_date: "2026-10-23" });
    const earlyDay = task({ planned_date: "2026-10-21" });
    const noPlanDue = task({ due_date: "2026-10-22" });
    const nothing = task();
    assert.deepEqual(sortForTable([done, nothing, lateDay, noPlanDue, earlyDay]), [earlyDay, lateDay, noPlanDue, nothing, done]);
  });
});

describe("planOptions", () => {
  it("offers today plus 13 days with friendly labels", () => {
    const options = planOptions("2026-10-21", null);
    assert.equal(options.length, 14);
    assert.equal(options[0].label, "Today · Wed 21 Oct");
    assert.equal(options[1].label, "Tomorrow · Thu 22 Oct");
    assert.equal(options[13].value, "2026-11-03");
  });

  it("keeps a task's existing day selectable even when it is outside the range", () => {
    const options = planOptions("2026-10-21", "2026-10-15");
    assert.equal(options[0].value, "2026-10-15");
    assert.equal(options.length, 15);
  });
});

describe("groupOpenTasks", () => {
  it("groups open tasks as missed, today, upcoming, unplanned and drops empty groups", () => {
    const missed = task({ planned_date: "2026-10-19" });
    const today = task({ planned_date: "2026-10-21" });
    const later = task({ planned_date: "2026-10-25" });
    const none = task();
    const done = task({ completed: true, planned_date: "2026-10-21" });
    const groups = groupOpenTasks([none, later, done, today, missed], "2026-10-21");
    assert.deepEqual(groups.map((g) => g.key), ["missed", "today", "upcoming", "unplanned"]);
    assert.deepEqual(groups.map((g) => g.tasks), [[missed], [today], [later], [none]]);
    assert.deepEqual(groupOpenTasks([later], "2026-10-21").map((g) => g.key), ["upcoming"]);
  });
});

describe("paginate", () => {
  const list = Array.from({ length: 13 }, (_, i) => i + 1);
  it("slices pages and reports the visible range", () => {
    assert.deepEqual(paginate(list, 0, 6), { page: 0, pages: 3, items: [1, 2, 3, 4, 5, 6], from: 1, to: 6 });
    assert.deepEqual(paginate(list, 2, 6), { page: 2, pages: 3, items: [13], from: 13, to: 13 });
  });
  it("clamps an out-of-range page and handles an empty list", () => {
    assert.equal(paginate(list, 9, 6).page, 2);
    assert.equal(paginate(list, -1, 6).page, 0);
    assert.deepEqual(paginate([], 0, 6), { page: 0, pages: 1, items: [], from: 0, to: 0 });
  });
});
