"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { uploadFilesDirect } from "@/lib/direct-upload-client";
import { readApiJson } from "@/lib/read-api-json";
import { STUDENT_TASK_BUCKET } from "@/lib/student-task-files";
import type { StudentTaskRow } from "@/lib/types";

const MAX_FILES = 5;

const inputClasses =
  "h-12 min-w-0 rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] text-[16px] sm:h-11 sm:text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none";

interface PersonalTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the modal edits this task instead of creating a new one. */
  task: StudentTaskRow | null;
  subjectSuggestions: string[];
  /** Pre-fills "Plan for" when creating a task from a day of the weekly planner. */
  defaultPlannedDate?: string | null;
  onSaved: (task: StudentTaskRow) => void;
}

export function PersonalTaskModal(props: PersonalTaskModalProps) {
  // Remount the form per task so its state initialises from the right row
  // without needing an effect to sync props into state.
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="thin-scroll max-h-[92dvh] overflow-y-auto p-5 sm:p-8">
        {props.open && <PersonalTaskForm key={props.task?.id ?? "new"} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function PersonalTaskForm({ onOpenChange, task, subjectSuggestions, defaultPlannedDate, onSaved }: PersonalTaskModalProps) {
  const [subject, setSubject] = useState(task?.subject ?? "");
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [plannedDate, setPlannedDate] = useState(task ? (task.planned_date ?? "") : (defaultPlannedDate ?? ""));
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removePaths, setRemovePaths] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keptExisting = (task?.attachments ?? []).filter((a) => !removePaths.includes(a.path));
  const fileCount = keptExisting.length + newFiles.length;
  const isValid = Boolean(title.trim());

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...newFiles, ...Array.from(list)];
    if (keptExisting.length + next.length > MAX_FILES) {
      setError(`You can attach up to ${MAX_FILES} files per task`);
      return;
    }
    setError(null);
    setNewFiles(next);
  }

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("subject", subject.trim());
      form.set("title", title.trim());
      form.set("description", description.trim());
      form.set("due_date", dueDate);
      form.set("planned_date", plannedDate);
      if (newFiles.length) {
        const uploaded = await uploadFilesDirect("/api/student/tasks/upload-url", STUDENT_TASK_BUCKET, newFiles);
        form.set("uploads", JSON.stringify(uploaded));
      }
      removePaths.forEach((p) => form.append("remove_paths", p));

      const res = await fetch(task ? `/api/student/tasks/${task.id}` : "/api/student/tasks", {
        method: task ? "PATCH" : "POST",
        body: form,
      });
      const json = await readApiJson<{ ok: boolean; task?: StudentTaskRow; error?: string }>(res);
      if (!res.ok || !json.ok || !json.task) throw new Error(json.error ?? "Request failed");
      onSaved(json.task);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save this task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <DialogTitle>{task ? "Edit your task" : "Add a personal task"}</DialogTitle>
      <DialogDescription>Only you can see this — your teachers don&apos;t.</DialogDescription>

      <div className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">Task title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            placeholder="Revise Surah al-Mulk"
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">Subject (optional)</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            type="text"
            list="personal-task-subjects"
            placeholder="Leave empty if it doesn't belong to a subject"
            className={inputClasses}
          />
          <datalist id="personal-task-subjects">
            {subjectSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">Notes (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Anything you want to remember about this task"
            className="resize-y rounded-xl border-[1.5px] border-border-strong bg-surface px-[15px] py-[13px] text-[16px] sm:text-[14.5px] text-ink transition-colors focus:border-primary focus:shadow-[0_0_0_4px_rgba(17,130,163,0.16)] focus:outline-none"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Plan for (optional)</span>
            <input value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} type="date" className={inputClasses} />
            <span className="text-[11.5px] text-muted">The day you&apos;ll do it — shows in your weekly plan.</span>
          </label>
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-bold text-ink">Due date (optional)</span>
            <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className={inputClasses} />
            <span className="text-[11.5px] text-muted">The deadline, if there is one.</span>
          </label>
        </div>

        <div className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">Files (optional)</span>

          {(keptExisting.length > 0 || newFiles.length > 0) && (
            <ul className="flex flex-col gap-1.5">
              {keptExisting.map((a) => (
                <li
                  key={a.path}
                  className="flex items-center justify-between gap-3 rounded-[8px] border border-border bg-bg px-3 py-2 text-[12.5px] text-text"
                >
                  <span className="truncate">📎 {a.name}</span>
                  <button
                    type="button"
                    onClick={() => setRemovePaths((p) => [...p, a.path])}
                    className="shrink-0 px-1 py-1.5 font-bold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
              {newFiles.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-[8px] border border-border bg-bg px-3 py-2 text-[12.5px] text-text"
                >
                  <span className="truncate">📎 {f.name}</span>
                  <button
                    type="button"
                    onClick={() => setNewFiles((list) => list.filter((_, idx) => idx !== i))}
                    className="shrink-0 px-1 py-1.5 font-bold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {fileCount < MAX_FILES && (
            <input
              key={newFiles.length}
              onChange={(e) => addFiles(e.target.files)}
              type="file"
              multiple
              className="rounded-xl border-[1.5px] border-dashed border-border-strong bg-surface px-[15px] py-[13px] text-[13px] text-text file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-primary"
            />
          )}
          <span className="text-[11.5px] text-muted">
            PDFs, documents or images — up to {MAX_FILES} files, 15MB each.
          </span>
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
          {submitting ? "Saving…" : task ? "Save changes" : "Add task"}
        </button>
      </div>
    </>
  );
}
