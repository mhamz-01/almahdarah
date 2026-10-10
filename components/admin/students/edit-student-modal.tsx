"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const inputClasses =
  "h-11 rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

export interface EditableStudent {
  id: number;
  name: string;
  username: string;
  password: string | null;
}

interface EditStudentModalProps {
  student: EditableStudent | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (student: { id: number; name: string; username: string; password: string | null }) => void;
}

export function EditStudentModal({ student, onOpenChange, onSaved }: EditStudentModalProps) {
  return (
    <Dialog open={student !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {student && <EditStudentForm key={student.id} student={student} onOpenChange={onOpenChange} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  );
}

function EditStudentForm({
  student,
  onOpenChange,
  onSaved,
}: {
  student: EditableStudent;
  onOpenChange: (open: boolean) => void;
  onSaved: EditStudentModalProps["onSaved"];
}) {
  const [name, setName] = useState(student.name);
  const [username, setUsername] = useState(student.username);
  const [password, setPassword] = useState(student.password ?? "");
  const [showPassword, setShowPassword] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A student whose password can't be shown (set before passwords were
  // viewable) keeps it unless the admin types a new one.
  const passwordChanged = password !== (student.password ?? "");
  const isValid = Boolean(name.trim() && username.trim() && (!passwordChanged || password.length >= 6));

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), username: username.trim(), ...(passwordChanged ? { password } : {}) }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        student?: { id: number; name: string; username: string };
        password?: string | null;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.student) throw new Error(json.error ?? "Request failed");
      onSaved({ ...json.student, password: json.password ?? student.password });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save changes");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <DialogTitle>Edit student</DialogTitle>
      <DialogDescription>Changes to the username or password apply the next time they sign in.</DialogDescription>

      <div className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" className={inputClasses} />
        </label>

        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            className={`${inputClasses} font-mono`}
          />
        </label>

        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">Password</span>
          <span className="relative block">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={student.password === null ? "Type a new password to set one" : ""}
              className={`${inputClasses} w-full pr-16 font-mono`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[12px] font-bold text-primary"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
          {student.password === null && (
            <span className="text-[11.5px] text-muted">
              The current password can&apos;t be shown — it was set before passwords were viewable. Leave blank to keep it.
            </span>
          )}
        </label>

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
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </>
  );
}
