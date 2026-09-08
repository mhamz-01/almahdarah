"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { StudentRow } from "@/lib/types";

const inputClasses =
  "h-11 rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

const AVATAR_COLORS = ["#1182A3", "#2B7977", "#25345D", "#3E9E54", "#8a6b12", "#C1503F"];

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (student: StudentRow) => void;
}

export function AddStudentModal({ open, onOpenChange, onCreated }: AddStudentModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [level, setLevel] = useState("Level 1");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setUsername("");
    setLevel("Level 1");
    setAvatarColor(AVATAR_COLORS[0]);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  const isValid = Boolean(name.trim() && username.trim() && level.trim());

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          level: level.trim(),
          avatar_color: avatarColor,
        }),
      });
      const json = (await res.json()) as { ok: boolean; student?: StudentRow; error?: string };
      if (!res.ok || !json.ok || !json.student) throw new Error(json.error ?? "Request failed");
      onCreated(json.student);
      reset();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add this student");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>Add a student</DialogTitle>
        <DialogDescription>
          They&apos;ll appear in the roster right away — generate a portal login for them whenever you&apos;re ready.
        </DialogDescription>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Ahmad Khalid"
              className={inputClasses}
            />
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="ahmad.k24"
              className={`${inputClasses} font-mono`}
            />
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Level</span>
            <input
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              type="text"
              placeholder="Level 1"
              className={inputClasses}
            />
          </label>

          <div className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Avatar color</span>
            <div className="flex gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  aria-label={`Use ${color}`}
                  aria-pressed={avatarColor === color}
                  className={`h-8 w-8 shrink-0 rounded-full transition-transform ${
                    avatarColor === color ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""
                  }`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={`mt-1 flex h-12 items-center justify-center rounded-full text-[14.5px] font-bold transition-colors duration-200 ${
              isValid && !submitting
                ? "cursor-pointer bg-primary text-white hover:brightness-[1.07]"
                : "cursor-not-allowed bg-surface-2 text-muted"
            }`}
          >
            {submitting ? "Adding…" : "Add student"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
