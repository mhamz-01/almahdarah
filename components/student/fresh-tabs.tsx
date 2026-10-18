"use client";

import { useState } from "react";
import Link from "next/link";
import { Segmented } from "@/components/ui/segmented";

export interface FreshClass {
  id: number;
  href: string;
  videoId: string;
  title: string;
  course: string;
  when: string;
}

export interface FreshTask {
  key: string;
  href: string;
  title: string;
  subject: string;
  color: string;
  dueLabel: string | null;
  dueBadgeClass: string | null;
  description: string;
  kind: "assigned" | "personal";
  attachments: number;
  planned: string | null;
}

const PAGE_SIZE = 3;

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

function Pager({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  const from = page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-surface text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border-strong";
  return (
    <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3">
      <span className="font-mono text-[12px] text-muted">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
          {Array.from({ length: pages }, (_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === page ? "w-5 bg-primary" : "w-1.5 bg-border-strong"}`} />
          ))}
        </div>
        <button type="button" className={btn} onClick={() => onPage(page - 1)} disabled={page === 0} aria-label="Previous page">
          <Arrow dir="left" />
        </button>
        <button type="button" className={btn} onClick={() => onPage(page + 1)} disabled={page >= pages - 1} aria-label="Next page">
          <Arrow dir="right" />
        </button>
      </div>
    </nav>
  );
}

function ClassCard({ c }: { c: FreshClass }) {
  return (
    <Link
      href={c.href}
      className="group flex flex-col overflow-hidden rounded-[22px] border border-border bg-surface transition-colors hover:border-border-strong"
    >
      <div className="relative aspect-video overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${c.videoId}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-navy/85 px-2.5 py-1 font-mono text-[10.5px] tracking-[0.08em] text-white uppercase">
          {c.when}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="truncate font-mono text-[11px] text-muted">{c.course}</span>
        <span className="mt-1.5 line-clamp-2 text-[15px] leading-[1.35] font-semibold text-ink group-hover:underline">{c.title}</span>
        <span className="mt-auto pt-4 text-[13px] font-bold text-primary">Watch lesson →</span>
      </div>
    </Link>
  );
}

function TaskCard({ t }: { t: FreshTask }) {
  const chip = "inline-flex items-center rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-text";
  return (
    <Link
      href={t.href}
      className="group flex aspect-square flex-col overflow-hidden rounded-[22px] border border-border bg-surface transition-colors hover:border-border-strong"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white sm:px-5" style={{ background: t.color }}>
        <span className="truncate text-[12px] font-bold tracking-[0.1em] uppercase">{t.subject}</span>
        <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-[10.5px] tracking-[0.08em] uppercase">
          {t.kind === "assigned" ? "Assigned" : "Personal"}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        {t.dueLabel ? (
          <span className={`self-start rounded-full px-2.5 py-1 text-[11px] font-bold ${t.dueBadgeClass ?? "bg-surface-2 text-ink"}`}>
            {t.dueLabel}
          </span>
        ) : (
          <span className="self-start rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted">No due date</span>
        )}
        <span className="mt-3 line-clamp-2 text-[16px] leading-[1.3] font-semibold text-ink group-hover:underline">{t.title}</span>
        <p className="mt-2 line-clamp-3 text-[13px] leading-[1.55] text-text">
          {t.description || "No description added."}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          {t.planned && <span className={chip}>Planned {t.planned}</span>}
          {t.attachments > 0 && (
            <span className={chip}>
              {t.attachments} file{t.attachments === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <span className="border-t border-border pt-3 mt-3 text-[13px] font-bold text-primary">View task →</span>
      </div>
    </Link>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[18px] border border-dashed border-border-strong px-5 py-8 text-center text-[13.5px] text-muted">{children}</p>
  );
}

export function FreshTabs({ classes, tasks }: { classes: FreshClass[]; tasks: FreshTask[] }) {
  const [active, setActive] = useState<"classes" | "tasks">("classes");
  const [pages, setPages] = useState({ classes: 0, tasks: 0 });

  const tabs = [
    { key: "classes" as const, label: "Classes this week", count: classes.length, href: "/student/courses", linkLabel: "All courses →" },
    { key: "tasks" as const, label: "Tasks this week", count: tasks.length, href: "/student/tasks", linkLabel: "All tasks →" },
  ];
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  const total = current.count;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pages[active], pageCount - 1);
  const setPage = (p: number) => setPages((prev) => ({ ...prev, [active]: p }));
  const start = page * PAGE_SIZE;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Fresh for you"
          value={active}
          onChange={setActive}
          options={tabs.map((t) => ({
            key: t.key,
            label: (
              <span className="inline-flex items-center gap-2">
                {t.label}
                <span className={`rounded-full px-1.5 font-mono text-[10.5px] transition-colors duration-300 ${t.key === active ? "bg-primary text-white" : "bg-border text-muted"}`}>
                  {t.count}
                </span>
              </span>
            ),
          }))}
          className="inline-block bg-surface-2 p-1"
          thumbClass="bg-surface shadow-[var(--shadow-sm)]"
          activeClass="text-ink"
          buttonClass="h-9 text-[13px]"
          optionProps={(key) => ({ id: `fresh-tab-${key}`, "aria-controls": `fresh-panel-${key}` })}
        />
        <Link href={current.href} className="shrink-0 text-[12.5px] font-semibold text-primary hover:underline">
          {current.linkLabel}
        </Link>
      </div>

      <div key={active} role="tabpanel" id={`fresh-panel-${active}`} aria-labelledby={`fresh-tab-${active}`} className="fade-in">
        {total === 0 ? (
          <Empty>
            {active === "classes"
              ? "Nothing new uploaded yet this week. Check back soon, in sha Allah."
              : "You're all caught up — no tasks due this week."}
          </Empty>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active === "classes"
              ? classes.slice(start, start + PAGE_SIZE).map((c) => (
                  <li key={c.id} className="flex">
                    <div className="flex w-full flex-col [&>a]:flex-1">
                      <ClassCard c={c} />
                    </div>
                  </li>
                ))
              : tasks.slice(start, start + PAGE_SIZE).map((t) => (
                  <li key={t.key} className="flex">
                    <div className="flex w-full flex-col [&>a]:flex-1">
                      <TaskCard t={t} />
                    </div>
                  </li>
                ))}
          </ul>
        )}
        <Pager page={page} pages={pageCount} total={total} onPage={setPage} />
      </div>
    </div>
  );
}
