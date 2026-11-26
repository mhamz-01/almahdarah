// Skeletons shown while switching pages inside the admin and student portals.
// The sidebar stays put; only the page area is replaced, so each skeleton mirrors
// the rough shape of its page (heading, then the page's main blocks).

import { SkeletonBlock, SkeletonCircle, SkeletonLine } from "@/components/ui/skeleton";

function Loading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

/** Eyebrow, big title and intro line used at the top of every student page. */
function StudentHeading({ intro = true }: { intro?: boolean }) {
  return (
    <div className="mb-8">
      <SkeletonLine className="w-28" />
      <SkeletonLine className="mt-4 h-9 w-56" />
      {intro && <SkeletonLine className="mt-4 h-3.5 w-full max-w-[520px]" />}
    </div>
  );
}

// ── Student portal ───────────────────────────────────────────────────────────

export function StudentDashboardSkeleton() {
  return (
    <Loading className="max-w-[1040px]">
      <SkeletonLine className="w-32" />
      <SkeletonLine className="mt-3.5 h-9 w-72 max-w-full" />
      <SkeletonBlock className="mt-6 h-[250px] rounded-[22px] sm:mt-7" />
      <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-[1.5fr_1fr]">
        <SkeletonBlock className="h-[240px] rounded-[22px]" />
        <SkeletonBlock className="h-[240px] rounded-[22px]" />
      </div>
      <div className="my-9 flex items-center gap-4">
        <SkeletonLine className="w-24" />
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[18px] border border-border bg-surface p-3">
            <SkeletonBlock className="aspect-video w-full rounded-[12px]" />
            <SkeletonLine className="mt-3.5 w-20" />
            <SkeletonLine className="mt-2.5 h-3.5 w-4/5" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

export function StudentAttendanceSkeleton() {
  return (
    <Loading className="max-w-[860px]">
      <StudentHeading />
      <SkeletonBlock className="mb-7 h-[92px] rounded-[14px]" />
      <div className="flex flex-col gap-3.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[14px] border border-border bg-surface px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2.5">
                <SkeletonLine className="w-36" />
                <SkeletonLine className="w-24" />
              </div>
              <SkeletonLine className="h-7 w-20 rounded-full" />
            </div>
            <div className="mt-5 grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <SkeletonBlock key={j} className="h-14 rounded-[10px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Loading>
  );
}

export function StudentCoursesSkeleton() {
  return (
    <Loading className="max-w-[1000px]">
      <StudentHeading />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[18px] border border-border bg-surface">
            <SkeletonBlock className="aspect-video w-full rounded-none" />
            <div className="space-y-3 p-5">
              <SkeletonLine className="h-4 w-3/4" />
              <SkeletonLine className="w-1/3" />
              <SkeletonLine className="mt-4 h-1.5 w-full" />
            </div>
          </div>
        ))}
      </div>
    </Loading>
  );
}

export function StudentCoursePlayerSkeleton() {
  return (
    <Loading className="max-w-[1200px]">
      <SkeletonLine className="w-24" />
      <SkeletonLine className="mt-4 h-8 w-80 max-w-full" />
      <SkeletonLine className="mt-3 mb-6 w-32" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <SkeletonBlock className="aspect-video w-full rounded-[16px]" />
          <SkeletonLine className="mt-5 h-5 w-2/3" />
          <SkeletonLine className="mt-3 h-3.5 w-1/2" />
        </div>
        <div className="space-y-2.5 rounded-[16px] border border-border bg-surface p-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-1.5">
              <SkeletonBlock className="h-11 w-[72px] shrink-0 rounded-[8px]" />
              <div className="flex-1 space-y-2">
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Loading>
  );
}

export function StudentNotificationsSkeleton() {
  return (
    <Loading className="max-w-[760px]">
      <StudentHeading />
      <div className="overflow-hidden rounded-[14px] border border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[4px_1fr] gap-4 border-b border-border px-[22px] py-5 last:border-b-0">
            <SkeletonLine className="h-full w-1 rounded-full" />
            <div className="space-y-2.5">
              <SkeletonLine className="w-28" />
              <SkeletonLine className="h-3.5 w-3/4" />
              <SkeletonLine className="w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </Loading>
  );
}

export function StudentTasksSkeleton() {
  return (
    <Loading className="max-w-[1040px]">
      <SkeletonLine className="w-28" />
      <SkeletonLine className="mt-3.5 h-9 w-40" />
      <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
        <SkeletonBlock className="h-[104px] rounded-[18px]" />
        <SkeletonBlock className="h-[104px] rounded-[18px]" />
      </div>
      <SkeletonLine className="mt-8 h-10 w-72 max-w-full rounded-full" />
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-[16px] border border-border bg-surface p-4">
            <SkeletonLine className="w-20" />
            {Array.from({ length: 3 - (i % 2) }).map((_, j) => (
              <SkeletonBlock key={j} className="h-[76px] rounded-[12px]" />
            ))}
          </div>
        ))}
      </div>
    </Loading>
  );
}

// ── Admin portal ─────────────────────────────────────────────────────────────

/** Title + action button, a filter row and a list: the shape of every admin panel. */
export function AdminPageSkeleton() {
  return (
    <Loading className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2.5">
          <SkeletonLine className="h-6 w-44" />
          <SkeletonLine className="w-64 max-w-full" />
        </div>
        <SkeletonLine className="h-10 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[86px]" />
        ))}
      </div>
      <div className="flex gap-2.5">
        <SkeletonLine className="h-9 w-56 rounded-full" />
        <SkeletonLine className="h-9 w-28 rounded-full" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0">
            <SkeletonCircle className="h-9 w-9 shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="w-1/3" />
              <SkeletonLine className="w-1/2" />
            </div>
            <SkeletonLine className="hidden h-7 w-20 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </Loading>
  );
}
