"use client";

import { useMemo, useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import { OptionSelect } from "@/components/student/option-select";
import { Pager } from "@/components/student/pager";
import { TaskTick } from "@/components/student/task-tick";
import { colorForSubject, dueMetaFor } from "@/lib/tasks";
import { groupOpenTasks, paginate, planOptions, planState, shortDate, sortForTable } from "@/lib/task-plan";
import type { StudentTaskRow } from "@/lib/types";

interface MyTasksTableProps {
  tasks: StudentTaskRow[];
  todayIso: string;
  now: Date;
  busyId: number | null;
  error: string | null;
  onToggle: (task: StudentTaskRow) => void;
  onPlan: (task: StudentTaskRow, iso: string | null) => void;
  onOpen: (task: StudentTaskRow) => void;
  onEdit: (task: StudentTaskRow) => void;
  onDelete: (task: StudentTaskRow) => void;
  onCreate: () => void;
}

type Filter = "open" | "done" | "all";

const PAGE_SIZE = 10;

export function MyTasksTable({ tasks, todayIso, now, busyId, error, onToggle, onPlan, onOpen, onEdit, onDelete, onCreate }: MyTasksTableProps) {
  const [filter, setFilter] = useState<Filter>("open");
  const [subject, setSubject] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const subjects = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.subject).filter((s): s is string => !!s))).sort(),
    [tasks],
  );
  const scoped = useMemo(() => (subject ? tasks.filter((t) => t.subject === subject) : tasks), [tasks, subject]);

  const openCount = scoped.filter((t) => !t.completed).length;
  const doneCount = scoped.length - openCount;

  // "To do" is split under headings (missed / today / coming up / not planned); the other lists stay flat.
  const groups = useMemo<{ key: string; label: string | null; tasks: StudentTaskRow[] }[]>(() => {
    if (filter === "open") return groupOpenTasks(scoped, todayIso);
    const list = sortForTable(filter === "done" ? scoped.filter((t) => t.completed) : scoped);
    return list.length ? [{ key: "flat", label: null, tasks: list }] : [];
  }, [scoped, filter, todayIso]);
  const rowCount = groups.reduce((n, g) => n + g.tasks.length, 0);

  // Page over the flattened rows, then re-group so each page keeps its headings.
  const paged = useMemo(() => {
    const flat = groups.flatMap((g) => g.tasks.map((task) => ({ groupKey: g.key, task })));
    const result = paginate(flat, pageIndex, PAGE_SIZE);
    const visible: typeof groups = [];
    for (const { groupKey, task } of result.items) {
      const last = visible[visible.length - 1];
      if (last && last.key === groupKey) last.tasks.push(task);
      else visible.push({ key: groupKey, label: groups.find((g) => g.key === groupKey)?.label ?? null, tasks: [task] });
    }
    return { ...result, visible };
  }, [groups, pageIndex]);

  function changeFilter(next: Filter) {
    setFilter(next);
    setPageIndex(0);
  }
  function changeSubject(next: string) {
    setSubject(next);
    setPageIndex(0);
  }
  function goToPage(next: number) {
    setPageIndex(next);
    document.getElementById("my-tasks-top")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function renderRow(task: StudentTaskRow) {
    const state = planState(task, todayIso);
    const due = task.completed ? null : dueMetaFor(task.due_date, now);
    const busy = busyId === task.id;
    return (
      <li
        key={task.id}
        className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-x-1 gap-y-1.5 border-b border-border px-2 py-3 last:border-b-0 hover:bg-bg sm:px-4 md:grid-cols-[28px_minmax(0,1fr)_170px_110px_68px] md:gap-x-3 md:gap-y-2 md:px-4"
      >
        <button
          type="button"
          onClick={() => onToggle(task)}
          disabled={busy}
          aria-label={task.completed ? `Mark "${task.title}" as to do` : `Mark "${task.title}" as done`}
          className="group/check flex h-10 w-10 items-center justify-center md:col-start-1 md:row-start-1 md:h-7 md:w-7"
        >
          <TaskTick checked={task.completed} busy={busy} />
        </button>

        <button type="button" onClick={() => onOpen(task)} className="min-w-0 py-0.5 pr-2 text-left md:col-start-2 md:row-start-1 md:pr-0" title="View details">
          <span className={`line-clamp-2 block text-[15px] leading-[1.3] font-semibold md:truncate md:text-[14.5px] ${task.completed ? "text-muted line-through" : "text-ink"}`}>
            {task.title}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: task.subject ? colorForSubject(task.subject) : "var(--muted)" }} />
              <span className="truncate">{task.subject ?? "No subject"}</span>
            </span>
            {due && <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold md:hidden ${due.badgeClass}`}>{due.label}</span>}
          </span>
        </button>

        <div className="hidden md:col-start-4 md:row-start-1 md:block">
          {due ? (
            <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${due.badgeClass}`}>{due.label}</span>
          ) : (
            <span className="text-[12px] text-muted">{task.due_date && task.completed ? shortDate(task.due_date) : "—"}</span>
          )}
        </div>

        {/* Phone: plan menu and actions share one row under the title. Desktop: they become grid columns. */}
        <div className="col-start-2 flex items-center gap-2 md:contents">
          <div className="min-w-0 flex-1 md:col-start-3 md:row-start-1">
            <OptionSelect
              ariaLabel={`Plan "${task.title}" for a day`}
              value={task.planned_date ?? ""}
              emptyLabel="Not planned"
              options={planOptions(todayIso, task.planned_date)}
              disabled={busy}
              onChange={(v) => onPlan(task, v || null)}
              className={
                state === "missed"
                  ? "border-gold bg-gold/10 text-[#8a6b12]"
                  : task.planned_date
                    ? "border-border-strong text-ink"
                    : "border-dashed border-border-strong text-muted"
              }
            />
          </div>

          <div className="flex shrink-0 md:col-start-5 md:row-start-1 md:justify-end">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit "${task.title}"`}
              title="Edit"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary/10 hover:text-primary md:h-8 md:w-8"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Delete "${task.title}"`}
              title="Delete"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-600/10 hover:text-red-600 md:h-8 md:w-8"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
              </svg>
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div id="my-tasks-top" className="scroll-mt-24">
      {error && (
        <p role="alert" className="mb-4 rounded-[14px] border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Filters: one quiet row. Status on the left, subject (only when there is a choice) on the right. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Segmented
          ariaLabel="Show tasks"
          value={filter}
          onChange={changeFilter}
          options={[
            { key: "open", label: <>To do <span className="font-mono text-[11.5px] opacity-70">{openCount}</span></> },
            { key: "done", label: <>Done <span className="font-mono text-[11.5px] opacity-70">{doneCount}</span></> },
            { key: "all", label: <>All <span className="font-mono text-[11.5px] opacity-70">{scoped.length}</span></> },
          ]}
          className="w-full bg-surface-2 p-1 sm:w-auto sm:bg-transparent sm:p-0"
          thumbClass="bg-surface shadow-[var(--shadow-sm)] sm:bg-primary/10 sm:shadow-none"
          activeClass="text-primary"
          buttonClass="h-9 px-3 text-[13px] sm:h-8"
        />

        {subjects.length > 1 && (
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <span className="text-[12px] text-muted">Subject</span>
            <OptionSelect
              ariaLabel="Filter by subject"
              value={subject}
              emptyLabel="All subjects"
              options={subjects.map((x) => ({ value: x, label: x }))}
              onChange={changeSubject}
              className="w-full min-w-[140px] border-border-strong text-ink sm:w-auto"
            />
          </div>
        )}
      </div>

      {rowCount === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-[22px] border border-dashed border-border-strong px-6 py-14 text-center">
          <div className="text-[16px] font-bold text-ink">
            {tasks.length === 0 ? "No personal tasks yet" : filter === "done" ? "Nothing completed yet" : "You're all caught up"}
          </div>
          <p className="mx-auto mt-2 max-w-[42ch] text-[13.5px] text-muted">
            {tasks.length === 0
              ? "Add the things you want to do — revision, memorisation, reading — then plan them across your week."
              : filter === "done"
                ? "Tick off a task and it will be kept here."
                : "Add something new, or look back at what you've finished."}
          </p>
          {subject && (
            <button type="button" onClick={() => changeSubject("")} className="mt-4 text-[13px] font-bold text-primary hover:underline">
              Show all subjects
            </button>
          )}
          {filter !== "done" && (
            <button
              type="button"
              onClick={onCreate}
              className="mt-5 h-10 rounded-full bg-primary px-5 text-[13.5px] font-bold text-white transition hover:brightness-[1.07]"
            >
              + Add a task
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-5 pb-20 sm:pb-0">
          {paged.visible.map((group) => (
            <section key={group.key} aria-label={group.label ?? "Tasks"}>
              {group.label && (
                <h3
                  className={`mb-2 flex items-center gap-2 px-1 font-mono text-[10.5px] tracking-[0.18em] uppercase ${
                    group.key === "missed" ? "text-[#8a6b12]" : "text-muted"
                  }`}
                >
                  {group.label}
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 tracking-normal">{group.tasks.length}</span>
                </h3>
              )}
              <div className="overflow-hidden rounded-[18px] border border-border bg-surface">
                <ul>{group.tasks.map(renderRow)}</ul>
              </div>
            </section>
          ))}
          <Pager page={paged.page} pages={paged.pages} from={paged.from} to={paged.to} total={rowCount} onPage={goToPage} className="px-1" />
        </div>
      )}
    </div>
  );
}
