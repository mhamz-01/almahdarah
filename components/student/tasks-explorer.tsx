"use client";

import { useMemo, useState } from "react";
import { colorForSubject, dueMetaFor, groupTasksBySubject } from "@/lib/tasks";
import type { TaskRow } from "@/lib/types";

interface TasksExplorerProps {
  tasks: TaskRow[];
  loadError: string | null;
}

function formatAdded(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function attachmentLabel(name: string | null) {
  if (!name) return "View attachment";
  return name.length > 28 ? `${name.slice(0, 25)}…` : name;
}

export function TasksExplorer({ tasks, loadError }: TasksExplorerProps) {
  const [subjectFilter, setSubjectFilter] = useState<string | "all">("all");
  const now = useMemo(() => new Date(), []);

  const groups = useMemo(() => groupTasksBySubject(tasks), [tasks]);
  const visibleGroups = subjectFilter === "all" ? groups : groups.filter((g) => g.subject === subjectFilter);

  return (
    <div className="max-w-[920px]">
      <span className="font-mono text-[11px] tracking-[0.26em] text-muted uppercase">
        {tasks.length} task{tasks.length === 1 ? "" : "s"} assigned
      </span>
      <h1 className="mt-3.5 mb-2.5 font-display text-[clamp(28px,3.6vw,42px)] leading-none tracking-[-0.01em] text-ink uppercase">
        Tasks
      </h1>
      <p className="mb-[30px] text-[15px] leading-[1.65] text-text">
        Everything your teachers have set, grouped by subject — no checklists to fill in, just what&apos;s due.
      </p>

      {loadError && (
        <p className="mb-6 rounded-[3px] border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
          Couldn&apos;t load your tasks: {loadError}
        </p>
      )}

      {groups.length > 0 && (
        <div className="no-scrollbar mb-8 flex flex-wrap gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubjectFilter("all")}
            className={`flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[12.5px] font-bold transition-colors ${
              subjectFilter === "all"
                ? "border-ink bg-ink text-bg"
                : "border-border-strong bg-surface text-muted hover:border-primary"
            }`}
          >
            All subjects
          </button>
          {groups.map((g) => (
            <button
              key={g.subject}
              type="button"
              onClick={() => setSubjectFilter(g.subject)}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-bold transition-colors"
              style={
                subjectFilter === g.subject
                  ? { borderColor: colorForSubject(g.subject), background: colorForSubject(g.subject), color: "#fff" }
                  : { borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--muted)" }
              }
            >
              {g.subject}
              <span className="opacity-75">· {g.tasks.length}</span>
            </button>
          ))}
        </div>
      )}

      {visibleGroups.length === 0 ? (
        <div className="rounded-[3px] border border-border bg-surface px-6 py-16 text-center">
          <div className="font-display text-[16px] tracking-[0.02em] text-ink uppercase">Nothing here yet</div>
          <p className="mx-auto mt-2.5 max-w-[42ch] text-[13.5px] text-muted">
            {tasks.length === 0
              ? "Your teachers haven't set any tasks yet — check back after your next class."
              : "No tasks for this subject yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {visibleGroups.map((group) => {
            const color = colorForSubject(group.subject);
            return (
              <section key={group.subject}>
                <div className="mb-3.5 flex items-baseline gap-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
                  <h2 className="m-0 font-display text-[16px] tracking-[0.02em] text-ink uppercase">{group.subject}</h2>
                  <span className="font-mono text-[11px] text-muted">
                    {group.tasks.length} task{group.tasks.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {group.tasks.map((task) => {
                    const dueMeta = dueMetaFor(task.due_date, now);
                    return (
                      <div
                        key={task.id}
                        className="flex flex-col rounded-[3px] border border-border bg-surface p-5"
                        style={{ borderTopColor: color, borderTopWidth: 3 }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2.5">
                          <span className="text-[14.5px] font-bold text-ink">{task.title}</span>
                          {dueMeta && (
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-[0.04em] uppercase ${dueMeta.badgeClass}`}
                            >
                              {dueMeta.label}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="mt-2.5 flex-1 text-[13.5px] leading-[1.6] text-text">{task.description}</p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-border pt-3.5">
                          <span className="font-mono text-[11px] text-muted">Added {formatAdded(task.created_at)}</span>
                          {task.attachment_url && (
                            <a
                              href={task.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-[12.5px] font-bold text-primary transition-colors hover:underline"
                            >
                              📎 {attachmentLabel(task.attachment_name)}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
