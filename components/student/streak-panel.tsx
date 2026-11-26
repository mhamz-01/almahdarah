import { PunchButton } from "@/components/student/punch-button";
import { MILESTONES } from "@/lib/students";
import type { AttendanceCell, CatchUpItem, ClassScheduleRow, StudentWithStats } from "@/lib/types";

// The student dashboard's streak section: one card that says how long the
// streak is and what to do next, the week at a glance, catch-up cards for
// missed classes, the next badge, and a short "how it works".

function shortDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

function weeks(n: number) {
  return `${n} ${n === 1 ? "week" : "weeks"}`;
}

export interface TodayInfo {
  slot: Pick<ClassScheduleRow, "subject" | "start_time" | "teacher"> | null;
  cancelled: boolean;
  punched: boolean;
  next: { subject: string; label: string } | null;
}

function Flame() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.6 2.2c.3 2.6-.6 4.2-2 5.8-1.3 1.5-2.6 3-2.6 5.2 0 1.3.5 2.4 1.3 3.2-.1-1.9.8-3 1.9-4 1-.9 1.7-1.9 1.9-3.4 2.7 1.8 4.4 4.6 4.4 7.3A6.5 6.5 0 0 1 12 18.5a6.5 6.5 0 0 1-6.5-6.5c0-4.7 4-7 7.1-9.8Z" />
    </svg>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path className="wk-tick" d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function Cross() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
      <path className="wk-tick" d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}

/** One day on the week path: a round node on the track, the day and a word under it. */
function DayNode({ cell, index, todayIso, time, catchUp }: { cell: AttendanceCell; index: number; todayIso: string; time: string | null; catchUp?: CatchUpItem }) {
  const isToday = cell.date === todayIso;
  const dateNum = String(Number(cell.date.slice(8)));
  // Every node is filled (navy when "empty") so the track line passes behind it.
  let node = "bg-navy border border-white/25 text-white/70";
  let inner: React.ReactNode = dateNum;
  let small = "";
  let halo = false;

  switch (cell.status) {
    case "present":
    case "caught_up":
      node = "bg-green text-white shadow-[0_0_0_4px_rgba(62,158,84,0.22)]";
      inner = <Tick />;
      small = cell.status === "present" ? "Attended" : "Caught up";
      break;
    case "catch_up": {
      const pct = catchUp?.durationSeconds ? Math.min(99, Math.round((catchUp.watchedSeconds / catchUp.durationSeconds) * 100)) : 0;
      node = "bg-navy text-gold";
      inner = (
        <>
          <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
            <circle
              className="wk-ring"
              cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
              pathLength={100} strokeDasharray="100" strokeDashoffset={100 - Math.max(pct, 4)}
            />
          </svg>
          <span className="relative text-[11px] sm:text-[13px]">{pct > 0 ? `${pct}%` : "!"}</span>
        </>
      );
      small = "Catch up";
      break;
    }
    case "absent":
      node = "bg-red-600/85 text-white";
      inner = <Cross />;
      small = "Missed";
      break;
    case "cancelled":
      node = "bg-navy border border-white/20 text-white/45 line-through";
      small = "Cancelled";
      break;
    case "no_class":
      node = "bg-navy border border-dashed border-white/25 text-white/45";
      inner = <span className="h-1.5 w-1.5 rounded-full bg-white/35" />;
      small = "No class";
      break;
    case "before_join":
      node = "bg-navy border border-dashed border-white/15 text-white/35";
      inner = <span className="h-1.5 w-1.5 rounded-full bg-white/25" />;
      small = "Not joined";
      break;
    case "upcoming":
      if (isToday) {
        node = "bg-navy border-2 border-gold text-gold";
        halo = true;
        small = time ?? "Today";
      } else {
        small = time ?? "Upcoming";
      }
      break;
  }

  return (
    <li className="flex min-w-0 flex-col items-center text-center">
      <span
        className={`wk-node relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-extrabold sm:h-12 sm:w-12 sm:text-[15px] ${node}`}
        style={{ "--i": index } as React.CSSProperties}
      >
        {halo && <span aria-hidden className="wk-halo absolute inset-0 rounded-full border-2 border-gold" />}
        {inner}
      </span>
      <span className={`mt-2 max-w-full truncate text-[11px] font-bold sm:text-[12px] ${isToday ? "text-gold" : "text-white"}`}>
        {isToday ? "Today" : cell.day.slice(0, 3)}
      </span>
      <span className="max-w-full truncate text-[10px] text-white/70 sm:text-[11px]">{small}</span>
    </li>
  );
}

/** The week as a path: a track that fills up to today, with a node per class day. */
function WeekPath({ cells, todayIso, timeByDay, catchUps }: { cells: AttendanceCell[]; todayIso: string; timeByDay: Record<string, string>; catchUps: CatchUpItem[] }) {
  const n = cells.length;
  const reached = cells.reduce((last, c, i) => (c.date <= todayIso ? i : last), -1);
  const fill = n > 1 && reached > 0 ? (reached / (n - 1)) * 100 : 0;
  const edge = `${50 / n}%`; // the track runs from the first node's centre to the last one's
  return (
    <ol aria-label="This week's classes" className="relative mt-4 grid gap-1 sm:gap-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      <span aria-hidden className="absolute top-5 h-[3px] -translate-y-1/2 rounded-full bg-white/12 sm:top-6" style={{ left: edge, right: edge }}>
        <span className="wk-fill block h-full rounded-full bg-gradient-to-r from-green to-gold" style={{ width: `${fill}%` }} />
      </span>
      {cells.map((cell, i) => (
        <DayNode
          key={cell.date}
          cell={cell}
          index={i}
          todayIso={todayIso}
          time={timeByDay[cell.day] ?? null}
          catchUp={catchUps.find((c) => c.date === cell.date)}
        />
      ))}
    </ol>
  );
}

export function StreakCard({ stats, today, todayIso, timeByDay }: { stats: StudentWithStats; today: TodayInfo; todayIso: string; timeByDay: Record<string, string> }) {
  const week = stats.weeks[0];
  const openCatchUps = stats.catchUps.filter((c) => c.state !== "done");
  const firstOpen = openCatchUps[0];
  const upcomingLeft = week.cells.filter((c) => c.status === "upcoming").length;
  const catchUpsThisWeek = week.cells.filter((c) => c.status === "catch_up").length;
  const allCancelled = week.target === 0 && week.cells.some((c) => c.status === "cancelled");

  const headline = stats.streak > 0 ? `${weeks(stats.streak)} streak` : "Start your streak";
  const sub = stats.atRisk && firstOpen
    ? `You missed ${firstOpen.day}. Catch up on it to keep your streak.`
    : stats.streak > 0
      ? `You haven’t missed a class in ${weeks(stats.streak)}.`
      : stats.missedTotal > 0
        ? "A missed class reset your streak. Attend every class this week to begin again."
        : "Attend every class this week and your streak begins.";

  // What to do next, in one line.
  const todayOpen = today.slot && !today.cancelled && !today.punched;
  const finishesWeek = todayOpen && upcomingLeft === 1 && catchUpsThisWeek === 0;
  let action: { title: string; detail: string } | null = null;
  if (todayOpen && today.slot) {
    action = {
      title: `Go to today’s class at ${today.slot.start_time}`,
      detail: finishesWeek ? `and your streak becomes ${weeks(stats.streak + 1)}.` : `${today.slot.subject} with ${today.slot.teacher}.`,
    };
  } else if (firstOpen?.state === "ready") {
    action = { title: "Watch the class you missed", detail: `Finish it by ${shortDate(firstOpen.deadline)} to keep your streak.` };
  } else if (today.slot && today.punched) {
    action = { title: "You’re marked present today", detail: "Masha’Allah. Keep it going." };
  } else if (today.next) {
    action = { title: `Next class: ${today.next.subject}`, detail: today.next.label };
  }

  let weekLine: string;
  if (allCancelled) weekLine = "Every class this week was cancelled, so your streak is paused.";
  else if (week.target === 0) weekLine = "No classes this week.";
  else weekLine = `This week: ${week.attended} of ${week.target} ${week.target === 1 ? "class" : "classes"} done`;
  const weekRight =
    catchUpsThisWeek > 0
      ? `+ ${catchUpsThisWeek} catch-up to finish`
      : upcomingLeft > 0
        ? `${upcomingLeft} to go`
        : week.target > 0 && week.outcome === "perfect"
          ? "Week complete ✓"
          : "";

  return (
    <section aria-labelledby="streak-title" className="mt-6 flex flex-col gap-5 rounded-[20px] bg-navy p-4 text-white sm:mt-7 sm:rounded-[22px] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16 ${stats.streak > 0 ? "bg-gold text-navy" : "bg-white/10 text-white/70"}`}>
            <Flame />
          </span>
          <div>
            <h2 id="streak-title" className="font-display text-[24px] leading-[1.1] sm:text-[34px]">
              {headline}
            </h2>
            <p className="mt-1 text-[14px] text-white/85">{sub}</p>
          </div>
        </div>
        {stats.atRisk ? (
          <span className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-gold bg-gold/20 px-3.5 py-2 text-[13px] font-bold text-gold">
            Streak at risk
          </span>
        ) : action ? (
          <div className="flex w-full flex-col gap-2 rounded-[14px] bg-gold px-4 py-3 text-navy sm:w-auto sm:max-w-[340px]">
            <div>
              <div className="text-[15px] font-extrabold">{action.title}</div>
              <div className="text-[13px] font-medium">{action.detail}</div>
            </div>
            {todayOpen && <PunchButton punched={today.punched} />}
          </div>
        ) : null}
      </div>

      {stats.atRisk && todayOpen && today.slot && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-white/8 px-4 py-3">
          <span className="text-[14px] font-semibold">Today: {today.slot.subject} at {today.slot.start_time}</span>
          <PunchButton punched={today.punched} onDark />
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2.5">
          <span className="text-[15px] font-bold">{weekLine}</span>
          {weekRight && <span className="text-[13px] text-white/80">{weekRight}</span>}
        </div>
        <WeekPath cells={week.cells} todayIso={todayIso} timeByDay={timeByDay} catchUps={stats.catchUps} />
      </div>
    </section>
  );
}

function Medal({ earned }: { earned: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={earned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 2.8l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 16.6l-5.38 2.85 1.03-6L3.3 9.2l6-.9L12 2.8Z" strokeLinejoin="round" />
    </svg>
  );
}

export function NextBadgeCard({ stats }: { stats: StudentWithStats }) {
  const next = stats.nextMilestone;
  const pct = next ? Math.min(100, Math.round((stats.streak / next.weeks) * 100)) : 100;
  const earned = new Set(stats.earnedMilestones.map((m) => m.weeks));
  const facts = [
    { label: "Best streak", value: weeks(stats.bestStreak) },
    { label: "Perfect weeks", value: String(stats.perfectWeeks) },
    { label: "Attendance", value: stats.attendanceRate === null ? "—" : `${stats.attendanceRate}%` },
  ];

  return (
    <div className="flex h-full flex-col rounded-[22px] border border-border bg-surface p-4 sm:p-5">
      <span className="block font-mono text-[11px] tracking-[0.12em] text-primary uppercase">{next ? "Next badge" : "Every badge earned"}</span>

      <div className="mt-3 flex items-center gap-4">
        {/* Medallion: the ring fills as the streak grows towards the badge */}
        <span className="relative flex h-[84px] w-[84px] shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90 text-gold" aria-hidden>
            <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2.6" />
            <circle
              className="wk-ring"
              cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"
              pathLength={100} strokeDasharray="100" strokeDashoffset={100 - Math.max(pct, 2)}
            />
          </svg>
          <span className="flex h-[62px] w-[62px] flex-col items-center justify-center rounded-full bg-gradient-to-b from-gold/35 to-gold/10 text-gold-ink">
            <span className="text-[22px] leading-none font-extrabold">{next ? stats.streak : stats.bestStreak}</span>
            <span className="mt-0.5 text-[10px] font-semibold">{next ? `of ${next.weeks}` : "weeks"}</span>
          </span>
        </span>
        <div className="min-w-0">
          <div className="text-[17px] leading-tight font-bold text-ink">{next ? next.name : "Half a year"}</div>
          <div className="mt-1 text-[13px] text-text">
            {next
              ? `${weeks(next.weeks - stats.streak)} of unbroken attendance to go.`
              : "Masha’Allah, half a year without a break. Keep going."}
          </div>
        </div>
      </div>

      {/* Badge ladder */}
      <ol aria-label="Badges" className="mt-5 grid grid-cols-4 gap-1.5">
        {MILESTONES.map((m) => {
          const got = earned.has(m.weeks);
          const isNext = next?.weeks === m.weeks;
          return (
            <li
              key={m.weeks}
              title={`${m.name} · ${weeks(m.weeks)}`}
              className={`flex flex-col items-center gap-1 rounded-[12px] px-1 py-2 text-center ${
                got ? "bg-gold/25 text-gold-ink" : isNext ? "border border-gold/70 text-gold-ink" : "border border-dashed border-border text-muted"
              }`}
            >
              <Medal earned={got} />
              <span className="text-[12px] font-bold">{m.weeks}w</span>
              <span className="sr-only">{`${m.name}${got ? ", earned" : isNext ? ", next" : ""}`}</span>
            </li>
          );
        })}
      </ol>

      {/* Quick facts */}
      <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3.5">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0">
            <dt className="truncate text-[11px] text-muted">{f.label}</dt>
            <dd className="mt-0.5 truncate text-[14px] font-bold text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function StreakHelp() {
  return (
    <details className="mt-10 border-t border-border pt-4 text-muted">
      <summary className="min-h-7 cursor-pointer text-[13px] font-semibold">How does my streak work?</summary>
      <ul className="mt-2 mb-1 list-disc pl-5 text-[12.5px] leading-[1.7]">
        <li>Attend every class in a week and your streak goes up by 1.</li>
        <li>Cancelled classes and days with no class don’t count.</li>
        <li>Missed a class? When its recording is uploaded, watch all of it within 7 days and it counts as attended.</li>
        <li>If you don’t watch it in time, your streak goes back to 0. Your best streak is always kept.</li>
      </ul>
    </details>
  );
}
