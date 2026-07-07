import Image from "next/image";
import Link from "next/link";

interface BookingHeaderProps {
  step: 1 | 2;
  scheduled: boolean;
}

const STEP_LABELS = ["Details", "Time", "Confirmed"] as const;

export function BookingHeader({ step, scheduled }: BookingHeaderProps) {
  const currentStepNumber = scheduled ? 3 : step;

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="Al-Mahdrah home" className="flex items-center gap-2.5">
          <Image
            src="/assets/almahdrah-logo.png"
            alt="Al-Mahdrah"
            width={32}
            height={32}
            className="h-8 w-auto [filter:var(--logo-filter)]"
          />
          <span className="font-display text-sm tracking-[0.01em] text-ink">AL-MAHDRAH</span>
        </Link>

        <div className="flex items-center gap-2">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = currentStepNumber > n;
            const active = currentStepNumber === n;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-[7px]">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${
                      done
                        ? "border-transparent bg-green text-white"
                        : active
                          ? "border-transparent bg-primary text-white"
                          : "border-border-strong bg-surface text-muted"
                    }`}
                  >
                    {done ? "✓" : n}
                  </span>
                  <span className={`hidden text-[12.5px] font-bold sm:inline ${active ? "text-ink" : "text-muted"}`}>
                    {label}
                  </span>
                </div>
                {n < STEP_LABELS.length && (
                  <span className={`h-[1.5px] w-[22px] transition-colors duration-300 ${done ? "bg-green" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        <Link
          href="/"
          aria-label="Close and return home"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-[15px] font-semibold text-muted transition-colors hover:border-border-strong hover:text-ink"
        >
          ✕
        </Link>
      </div>
    </header>
  );
}
