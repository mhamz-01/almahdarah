"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { ClassScheduleRow, Weekday } from "@/lib/types";

const inputClasses =
  "h-11 rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

const DAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const CLASS_COLORS = ["#1182A3", "#2B7977", "#25345D", "#3E9E54", "#8a6b12", "#C1503F"];

interface AddClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  takenDays: Weekday[];
  onCreated: (slot: ClassScheduleRow) => void;
}

export function AddClassModal({ open, onOpenChange, takenDays, onCreated }: AddClassModalProps) {
  const availableDays = DAYS.filter((d) => !takenDays.includes(d));

  const [day, setDay] = useState<Weekday>(availableDays[0] ?? DAYS[0]);
  const [subject, setSubject] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [teacher, setTeacher] = useState("");
  const [color, setColor] = useState(CLASS_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDay(availableDays[0] ?? DAYS[0]);
    setSubject("");
    setStartTime("");
    setDuration("");
    setTeacher("");
    setColor(CLASS_COLORS[0]);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  const isValid = Boolean(subject.trim() && startTime.trim() && duration.trim() && teacher.trim());

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day,
          subject: subject.trim(),
          start_time: startTime.trim(),
          duration: duration.trim(),
          teacher: teacher.trim(),
          color,
          status: "scheduled",
          note: "",
        }),
      });
      const json = (await res.json()) as { ok: boolean; slot?: ClassScheduleRow; error?: string };
      if (!res.ok || !json.ok || !json.slot) throw new Error(json.error ?? "Request failed");
      onCreated(json.slot);
      reset();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add this class");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>Add a class</DialogTitle>
        <DialogDescription>One class per weekday — it goes live to the student portal immediately.</DialogDescription>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Day</span>
            <select value={day} onChange={(e) => setDay(e.target.value as Weekday)} className={inputClasses}>
              {DAYS.map((d) => (
                <option key={d} value={d} disabled={takenDays.includes(d)}>
                  {d}
                  {takenDays.includes(d) ? " — already scheduled" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Class / subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              type="text"
              placeholder="Tafsīr"
              className={inputClasses}
            />
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex flex-col gap-[7px]">
              <span className="text-[13px] font-bold text-ink">Start time</span>
              <input
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                type="text"
                placeholder="5:00 PM"
                className={inputClasses}
              />
            </label>
            <label className="flex flex-col gap-[7px]">
              <span className="text-[13px] font-bold text-ink">Duration</span>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                type="text"
                placeholder="60 min"
                className={inputClasses}
              />
            </label>
          </div>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Teacher</span>
            <input
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              type="text"
              placeholder="Ust. Bilal"
              className={inputClasses}
            />
          </label>

          <div className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Color</span>
            <div className="flex gap-2">
              {CLASS_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Use ${c}`}
                  aria-pressed={color === c}
                  className={`h-8 w-8 shrink-0 rounded-full transition-transform ${
                    color === c ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting || availableDays.length === 0}
            className={`mt-1 flex h-12 items-center justify-center rounded-full text-[14.5px] font-bold transition-colors duration-200 ${
              isValid && !submitting && availableDays.length > 0
                ? "cursor-pointer bg-primary text-white hover:brightness-[1.07]"
                : "cursor-not-allowed bg-surface-2 text-muted"
            }`}
          >
            {submitting ? "Adding…" : availableDays.length === 0 ? "All weekdays scheduled" : "Add class"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
