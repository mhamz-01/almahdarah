import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateStudentTaskFields, validateStudentTaskQuickUpdate } from "@/lib/student-task-validation";

describe("validateStudentTaskFields — planned_date", () => {
  const base = { title: "Revise Surah al-Mulk", subject: "", description: "", due_date: "" };

  it("accepts a real planned day and trims it", () => {
    const r = validateStudentTaskFields({ ...base, planned_date: " 2026-10-21 " });
    assert.equal(r.ok && r.value.planned_date, "2026-10-21");
  });

  it("treats empty or missing as not planned", () => {
    for (const planned_date of ["", "   ", undefined, null]) {
      const r = validateStudentTaskFields({ ...base, planned_date });
      assert.equal(r.ok && r.value.planned_date, null);
    }
  });

  it("rejects impossible or malformed days", () => {
    for (const planned_date of ["2026-02-30", "2026-13-01", "tomorrow", "21-10-2026"]) {
      const r = validateStudentTaskFields({ ...base, planned_date });
      assert.equal(r.ok, false, planned_date);
    }
  });

  it("still requires a title", () => {
    assert.equal(validateStudentTaskFields({ ...base, title: "  ", planned_date: "2026-10-21" }).ok, false);
  });
});

describe("validateStudentTaskQuickUpdate", () => {
  it("accepts completing a task", () => {
    assert.deepEqual(validateStudentTaskQuickUpdate({ completed: true }), { ok: true, value: { completed: true } });
  });

  it("accepts moving to a day and removing from the plan", () => {
    assert.deepEqual(validateStudentTaskQuickUpdate({ planned_date: "2026-10-21" }), {
      ok: true,
      value: { planned_date: "2026-10-21" },
    });
    assert.deepEqual(validateStudentTaskQuickUpdate({ planned_date: null }), { ok: true, value: { planned_date: null } });
  });

  it("accepts both together", () => {
    const r = validateStudentTaskQuickUpdate({ completed: false, planned_date: "2026-10-22" });
    assert.deepEqual(r, { ok: true, value: { completed: false, planned_date: "2026-10-22" } });
  });

  it("rejects empty, wrong-typed or invalid bodies", () => {
    for (const body of [null, undefined, "x", {}, { completed: "yes" }, { planned_date: "2026-02-30" }, { planned_date: 5 }, { planned_date: "" }]) {
      assert.equal(validateStudentTaskQuickUpdate(body).ok, false, JSON.stringify(body));
    }
  });

  it("ignores unknown fields so nothing else can be changed through this endpoint", () => {
    const r = validateStudentTaskQuickUpdate({ completed: true, student_id: 99, title: "hacked" });
    assert.deepEqual(r, { ok: true, value: { completed: true } });
  });
});

describe("validateStudentTaskQuickUpdate — notes", () => {
  it("accepts and trims notes, including clearing them", () => {
    assert.deepEqual(validateStudentTaskQuickUpdate({ notes: "  halfway through  " }), { ok: true, value: { notes: "halfway through" } });
    assert.deepEqual(validateStudentTaskQuickUpdate({ notes: "" }), { ok: true, value: { notes: "" } });
  });

  it("rejects non-text and over-long notes", () => {
    assert.equal(validateStudentTaskQuickUpdate({ notes: 5 }).ok, false);
    assert.equal(validateStudentTaskQuickUpdate({ notes: "x".repeat(2001) }).ok, false);
    assert.equal(validateStudentTaskQuickUpdate({ notes: "x".repeat(2000) }).ok, true);
  });
});
