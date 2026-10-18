"use client";

import { useState } from "react";
import Link from "next/link";

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
  return (
    <Link
      href={t.href}
      className="group flex flex-col overflow-hidden rounded-[22px] border border-border bg-surface transition-colors hover:border-border-strong"
    >
      <div className="relative flex aspect-video items-center justify-center overflow-hidden" style={{ background: t.color }}>
        <span aria-hidden className="font-display text-[clamp(56px,9vw,84px)] leading-none text-white/90">
          {t.subject.charAt(0).toUpperCase()}
        </span>
        {t.dueLabel && (
          <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${t.dueBadgeClass ?? "bg-white text-ink"}`}>
            {t.dueLabel}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="truncate font-mono text-[11px] text-muted">{t.subject}</span>
        <span className="mt-1.5 line-clamp-2 text-[15px] leading-[1.35] font-semibold text-ink group-hover:underline">{t.title}</span>
        <span className="mt-auto pt-4 text-[13px] font-bold text-primary">View task →</span>
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
        <div role="tablist" aria-label="Fresh for you" className="inline-flex rounded-full bg-surface-2 p-1">
          {tabs.map((t) => {
            const selected = t.key === active;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                id={`fresh-tab-${t.key}`}
                aria-selected={selected}
                aria-controls={`fresh-panel-${t.key}`}
                onClick={() => setActive(t.key)}
                className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-bold transition-colors ${
                  selected ? "bg-surface text-ink shadow-[var(--shadow-sm)]" : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
                <span className={`rounded-full px-1.5 font-mono text-[10.5px] ${selected ? "bg-primary text-white" : "bg-border text-muted"}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
        <Link href={current.href} className="shrink-0 text-[12.5px] font-semibold text-primary hover:underline">
          {current.linkLabel}
        </Link>
      </div>

      <div role="tabpanel" id={`fresh-panel-${active}`} aria-labelledby={`fresh-tab-${active}`}>
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
