"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { OptionSelect } from "@/components/student/option-select";
import { Pager } from "@/components/student/pager";
import { TaskTick } from "@/components/student/task-tick";
import { colorForSubject } from "@/lib/tasks";
import {
  addDays,
  dayName,
  dayNumber,
  paginate,
  planOptions,
  planState,
  summarizeWeek,
  tasksOnDay,
  unplannedTasks,
  weekDays,
  weekRangeLabel,
  weekStart,
} from "@/lib/task-plan";
import type { StudentTaskRow } from "@/lib/types";

interface WeeklyPlannerProps {
  tasks: StudentTaskRow[];
  todayIso: string;
  busyId: number | null;
  error: string | null;
  onToggle: (task: StudentTaskRow) => void;
  onPlan: (task: StudentTaskRow, iso: string | null) => void;
  onOpen: (task: StudentTaskRow) => void;
  onCreate: (plannedDate?: string) => void;
}

/** Drop targets carry `data-drop="<iso day>"` or `data-drop="unplanned"`. */
const UNPLANNED = "unplanned";

/** The "Not planned yet" tray shows this many tasks at a time. */
const TRAY_PAGE_SIZE = 6;

/** How far the pointer must travel before a mouse press on a chip becomes a drag. */
const MOUSE_DRAG_THRESHOLD = 5;
/** Distance from the screen's top/bottom edge where the page starts auto-scrolling. */
const SCROLL_EDGE = 90;

interface Press {
  task: StudentTaskRow;
  pointerId: number;
  /** Pointer position at press time. */
  x: number;
  y: number;
  /** Where inside the chip it was grabbed, and the chip's size, so the floating copy lines up. */
  dx: number;
  dy: number;
  w: number;
  /** Touch (and the grip handle) start dragging immediately; a mouse press on the chip body waits for movement. */
  immediate: boolean;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

function Grip() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      {[8, 12, 16].map((y) => (
        <g key={y}>
          <circle cx="9" cy={y} r="1.35" />
          <circle cx="15" cy={y} r="1.35" />
        </g>
      ))}
    </svg>
  );
}

interface ChipProps {
  task: StudentTaskRow;
  todayIso: string;
  busy: boolean;
  lifted: boolean;
  /** Always show the "Plan for" menu (used in the unplanned tray); otherwise only on small screens. */
  alwaysMenu?: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onPlan: (iso: string | null) => void;
  onPress: (e: React.PointerEvent<HTMLElement>, immediate: boolean) => void;
}

function Chip({ task, todayIso, busy, lifted, alwaysMenu, onToggle, onOpen, onPlan, onPress }: ChipProps) {
  const state = planState(task, todayIso);
  return (
    <li
      data-chip
      onPointerDown={(e) => {
        // Mouse users can grab the whole chip; on touch only the grip drags, so the page still scrolls.
        if (e.pointerType !== "mouse" || (e.target as HTMLElement).closest("button, select, a")) return;
        onPress(e, false);
      }}
      className={`rounded-[12px] border bg-surface p-2 transition-opacity select-none md:cursor-grab ${lifted ? "opacity-35" : ""} ${
        state === "missed" ? "border-gold" : state === "done" ? "border-border opacity-80" : "border-border-strong"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          aria-label={task.completed ? `Mark "${task.title}" as to do` : `Mark "${task.title}" as done`}
          className="group/check mt-px shrink-0"
        >
          <TaskTick checked={task.completed} busy={busy} size={18} />
        </button>
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <span className={`line-clamp-2 block text-[12.5px] leading-[1.3] font-semibold ${task.completed ? "text-muted line-through" : "text-ink"}`}>
            {task.title}
          </span>
          {task.subject && (
            <span className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: colorForSubject(task.subject) }} />
              <span className="truncate">{task.subject}</span>
            </span>
          )}
        </button>
        {/* Drag handle: touch-action none stops the browser scrolling instead of dragging */}
        <span
          role="presentation"
          aria-hidden
          title="Drag to a day"
          onPointerDown={(e) => {
            if (busy || (e.pointerType === "mouse" && e.button !== 0)) return;
            e.stopPropagation();
            onPress(e, true);
          }}
          onContextMenu={(e) => e.preventDefault()}
          className="-my-1 -mr-1 flex h-9 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-[10px] text-muted/70 select-none hover:bg-surface-2 hover:text-ink active:cursor-grabbing md:h-7 md:w-6"
          style={{ WebkitTouchCallout: "none" }}
        >
          <Grip />
        </span>
      </div>

      {state === "missed" && (
        <button
          type="button"
          onClick={() => onPlan(todayIso)}
          disabled={busy}
          className="mt-2 w-full rounded-full bg-gold/25 px-2 py-1 text-[11px] font-bold text-[#8a6b12] hover:bg-gold/35"
        >
          Missed · do it today
        </button>
      )}

      <div className={`mt-2 ${alwaysMenu ? "block" : "block md:hidden"}`}>
        <OptionSelect
          ariaLabel={`Plan "${task.title}" for a day`}
          value={task.planned_date ?? ""}
          emptyLabel={task.planned_date ? "Remove from plan" : undefined}
          placeholder="Plan for…"
          options={planOptions(todayIso, task.planned_date)}
          disabled={busy}
          onChange={(v) => onPlan(v || null)}
          className="border-dashed border-border-strong px-2.5 text-[11.5px] text-muted"
        />
      </div>
    </li>
  );
}

export function WeeklyPlanner({ tasks, todayIso, busyId, error, onToggle, onPlan, onOpen, onCreate }: WeeklyPlannerProps) {
  const thisWeek = weekStart(todayIso);
  const [start, setStart] = useState(thisWeek);
  const [press, setPress] = useState<Press | null>(null);
  const [dragging, setDragging] = useState(false);
  const [trayPage, setTrayPage] = useState(0);
  const [overKey, setOverKey] = useState<string | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const onPlanRef = useRef(onPlan);

  useEffect(() => {
    onPlanRef.current = onPlan;
  });

  const days = useMemo(() => weekDays(start), [start]);
  const summary = useMemo(() => summarizeWeek(tasks, days, todayIso), [tasks, days, todayIso]);
  const unplanned = useMemo(() => unplannedTasks(tasks), [tasks]);
  const tray = useMemo(() => paginate(unplanned, trayPage, TRAY_PAGE_SIZE), [unplanned, trayPage]);
  const isCurrent = start === thisWeek;
  const relation = start < thisWeek ? "Past week" : start > thisWeek ? "Upcoming week" : "This week";
  const draggedTask = dragging && press ? press.task : null;

  function startPress(task: StudentTaskRow, e: React.PointerEvent<HTMLElement>, immediate: boolean) {
    const chip = e.currentTarget.closest<HTMLElement>("[data-chip]");
    if (!chip) return;
    const rect = chip.getBoundingClientRect();
    if (immediate) e.preventDefault();
    setPress({ task, pointerId: e.pointerId, x: e.clientX, y: e.clientY, dx: e.clientX - rect.left, dy: e.clientY - rect.top, w: rect.width, immediate });
    setDragging(immediate);
  }

  // One gesture = one effect run: listeners live on the window, so the drag keeps
  // working wherever the pointer goes, and are removed the moment it ends.
  useEffect(() => {
    if (!press) return;
    const { task, pointerId, dx, dy } = press;
    const pos = { x: press.x, y: press.y };
    let active = press.immediate;
    let over: string | null = null;
    let overInBar = false;
    let raf = 0;

    const hit = () => {
      const el = document.elementFromPoint(pos.x, pos.y);
      overInBar = !!el?.closest("[data-dropbar]");
      return el?.closest<HTMLElement>("[data-drop]")?.dataset.drop ?? null;
    };
    const refreshOver = () => {
      const next = hit();
      if (next === over) return;
      over = next;
      setOverKey(next);
      if (next) navigator.vibrate?.(6);
    };
    const moveGhost = () => {
      if (ghostRef.current) ghostRef.current.style.transform = `translate3d(${pos.x - dx}px, ${pos.y - dy}px, 0) rotate(1.5deg) scale(1.03)`;
    };
    const tick = () => {
      // Scroll the page when the pointer is held near its top/bottom edge (not while over the mobile day strip).
      const vh = window.innerHeight;
      let step = 0;
      if (pos.y < SCROLL_EDGE) step = -Math.ceil((SCROLL_EDGE - pos.y) / 5);
      else if (pos.y > vh - SCROLL_EDGE && !overInBar) step = Math.ceil((pos.y - (vh - SCROLL_EDGE)) / 5);
      if (step) {
        window.scrollBy(0, step);
        refreshOver();
      }
      raf = requestAnimationFrame(tick);
    };
    const begin = () => {
      active = true;
      setDragging(true);
      document.documentElement.classList.add("planner-dragging");
      navigator.vibrate?.(12);
      raf = requestAnimationFrame(tick);
    };

    if (active) {
      document.documentElement.classList.add("planner-dragging");
      navigator.vibrate?.(12);
      raf = requestAnimationFrame(tick);
    }

    const finish = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("planner-dragging");
      if (active) {
        // A drag must not also count as a click on whatever is under the pointer.
        const swallow = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        window.addEventListener("click", swallow, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
        if (commit && over) {
          const target = over === UNPLANNED ? null : over;
          if (task.planned_date !== target) onPlanRef.current(task, target);
        }
      }
      setDragging(false);
      setOverKey(null);
      setPress(null);
    };

    function onMove(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!active) {
        if (Math.hypot(pos.x - press!.x, pos.y - press!.y) < MOUSE_DRAG_THRESHOLD) return;
        begin();
      }
      moveGhost();
      refreshOver();
    }
    function onUp(e: PointerEvent) {
      if (e.pointerId === pointerId) finish(true);
    }
    function onCancel(e: PointerEvent) {
      if (e.pointerId === pointerId) finish(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") finish(false);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("planner-dragging");
    };
  }, [press]);

  const chipProps = (task: StudentTaskRow) => ({
    task,
    todayIso,
    busy: busyId === task.id,
    lifted: draggedTask?.id === task.id,
    onToggle: () => onToggle(task),
    onOpen: () => onOpen(task),
    onPlan: (iso: string | null) => onPlan(task, iso),
    onPress: (e: React.PointerEvent<HTMLElement>, immediate: boolean) => startPress(task, e, immediate),
  });

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-[14px] border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Week navigation + summary */}
      <div className="rounded-[22px] border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStart(addDays(start, -7))}
              aria-label="Previous week"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-ink hover:border-ink"
            >
              <Chevron dir="left" />
            </button>
            <div className="min-w-[132px] text-center">
              <div className="font-display text-[18px] leading-none text-ink">{weekRangeLabel(start)}</div>
              <div className="mt-1 font-mono text-[10.5px] tracking-[0.12em] text-muted uppercase">{relation}</div>
            </div>
            <button
              type="button"
              onClick={() => setStart(addDays(start, 7))}
              aria-label="Next week"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-ink hover:border-ink"
            >
              <Chevron dir="right" />
            </button>
            {!isCurrent && (
              <button type="button" onClick={() => setStart(thisWeek)} className="ml-1 text-[12.5px] font-bold text-primary hover:underline">
                Back to this week
              </button>
            )}
          </div>

          <div className="min-w-[200px] flex-1 sm:max-w-[320px]">
            {summary.planned === 0 ? (
              <p className="text-right text-[12.5px] text-muted">Nothing planned for this week.</p>
            ) : (
              <>
                <div className="flex items-baseline justify-between text-[12.5px]">
                  <span className="font-semibold text-ink">
                    {summary.done} of {summary.planned} done
                  </span>
                  <span className="text-muted">
                    {summary.pct}%{summary.missed > 0 && <span className="font-semibold text-[#8a6b12]"> · {summary.missed} missed</span>}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={summary.pct ?? 0}
                  aria-label="Planned tasks completed this week"
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2"
                >
                  <div className="h-full rounded-full bg-green transition-all" style={{ width: `${summary.pct}%` }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Not planned yet */}
      {unplanned.length > 0 && (
        <section
          aria-label="Tasks not planned yet"
          data-drop={UNPLANNED}
          className={`mt-4 rounded-[22px] border border-dashed p-4 transition-colors ${
            overKey === UNPLANNED ? "border-primary bg-primary/[0.09]" : "border-border-strong bg-surface-2/50"
          }`}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[14px] font-bold text-ink">
              Not planned yet <span className="font-mono text-[12px] text-muted">{unplanned.length}</span>
            </h3>
            <span className="text-right text-[12px] text-muted">Drag by the grip <span className="hidden md:inline">onto a day,</span> or use the menu</span>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tray.items.map((task) => (
              <Chip key={task.id} {...chipProps(task)} alwaysMenu />
            ))}
          </ul>
          <Pager page={tray.page} pages={tray.pages} from={tray.from} to={tray.to} total={unplanned.length} onPage={setTrayPage} className="mt-3" />
        </section>
      )}

      {/* Days */}
      <ol className="mt-4 grid gap-3 md:grid-cols-7">
        {days.map((iso) => {
          const list = tasksOnDay(tasks, iso);
          const doneHere = list.filter((t) => t.completed).length;
          const isToday = iso === todayIso;
          const isPast = iso < todayIso;
          const isOver = overKey === iso;
          return (
            <li
              key={iso}
              aria-label={`${dayName(iso)} ${dayNumber(iso)}`}
              data-drop={iso}
              className={`flex min-h-[120px] flex-col rounded-[18px] border p-2.5 transition-colors ${
                isOver
                  ? "border-primary bg-primary/[0.09]"
                  : isToday
                    ? "border-primary bg-primary/[0.05]"
                    : isPast
                      ? "border-border bg-surface-2/40"
                      : "border-border bg-surface"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-1.5">
                  <span className={`font-mono text-[10.5px] tracking-[0.12em] uppercase ${isToday ? "font-bold text-primary" : "text-muted"}`}>
                    {dayName(iso)}
                  </span>
                  <span className={`font-display text-[17px] leading-none ${isToday ? "text-primary" : "text-ink"}`}>{dayNumber(iso)}</span>
                </div>
                {list.length > 0 && (
                  <span className="font-mono text-[10.5px] text-muted">
                    {doneHere}/{list.length}
                  </span>
                )}
              </div>

              <ul className="mt-2 flex flex-1 flex-col gap-1.5">
                {list.map((task) => (
                  <Chip key={task.id} {...chipProps(task)} />
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onCreate(iso)}
                aria-label={`Add a task on ${dayName(iso)} ${dayNumber(iso)}`}
                className="mt-2 flex h-8 items-center justify-center rounded-[10px] border border-dashed border-border-strong text-[12px] font-bold text-muted transition-colors hover:border-primary hover:text-primary"
              >
                + Add
              </button>
            </li>
          );
        })}
      </ol>

      {draggedTask &&
        createPortal(
          <>
            {/* The card that follows the finger / cursor */}
            <div
              ref={ghostRef}
              aria-hidden
              className="pointer-events-none fixed top-0 left-0 z-[130] rounded-[12px] border border-primary bg-surface p-2.5 shadow-[var(--shadow-lg)]"
              style={{
                width: press!.w,
                transform: `translate3d(${press!.x - press!.dx}px, ${press!.y - press!.dy}px, 0) rotate(1.5deg) scale(1.03)`,
              }}
            >
              <span className="line-clamp-2 block text-[12.5px] leading-[1.3] font-semibold text-ink">{draggedTask.title}</span>
              {draggedTask.subject && (
                <span className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: colorForSubject(draggedTask.subject) }} />
                  {draggedTask.subject}
                </span>
              )}
            </div>

            {/* Phone: every day of the week is one tap-length away, so no scrolling while dragging */}
            <div
              data-dropbar
              className="fixed inset-x-0 bottom-0 z-[125] border-t border-border-strong bg-surface/95 px-2 pt-2 pb-[max(env(safe-area-inset-bottom),10px)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur md:hidden"
            >
              <p className="mb-1.5 text-center text-[11px] font-semibold text-muted">Drop on a day</p>
              <div className="grid grid-cols-8 gap-1">
                {days.map((iso) => {
                  const here = overKey === iso;
                  return (
                    <div
                      key={iso}
                      data-drop={iso}
                      className={`flex h-14 flex-col items-center justify-center rounded-[12px] border text-center transition ${
                        here
                          ? "scale-105 border-primary bg-primary text-white"
                          : iso === todayIso
                            ? "border-primary bg-primary/[0.08] text-ink"
                            : "border-border bg-bg text-ink"
                      }`}
                    >
                      <span className={`font-mono text-[9.5px] tracking-[0.08em] uppercase ${here ? "text-white/85" : "text-muted"}`}>{dayName(iso)}</span>
                      <span className="font-display text-[16px] leading-none">{dayNumber(iso)}</span>
                    </div>
                  );
                })}
                <div
                  data-drop={UNPLANNED}
                  className={`flex h-14 flex-col items-center justify-center rounded-[12px] border border-dashed text-center transition ${
                    overKey === UNPLANNED ? "scale-105 border-primary bg-primary text-white" : "border-border-strong bg-bg text-muted"
                  }`}
                >
                  <span className="text-[10px] leading-tight font-bold">Not planned</span>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
