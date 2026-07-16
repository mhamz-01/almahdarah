import Image from "next/image";

const expectations = [
  { icon: "⏱", label: "30-minute live session" },
  { icon: "🎓", label: "A qualified, vetted teacher" },
  { icon: "💳", label: "Completely free, no card needed" },
  { icon: "🚫", label: "Zero obligation to continue" },
];

export function BookingTrustPanel() {
  return (
    <aside className="sticky top-6 hidden flex-col gap-4 lg:flex">
      <div className="rounded-[20px] border border-border bg-surface p-[22px] shadow-[var(--shadow-sm)]">
        <div className="mb-3.5 text-xs font-bold tracking-[0.1em] text-muted uppercase">What to expect</div>
        <div className="flex flex-col gap-[13px]">
          {expectations.map((item) => (
            <div key={item.label} className="flex items-center gap-[11px]">
              <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-mint text-sm text-primary-2">
                {item.icon}
              </span>
              <span className="text-[13.5px] text-text">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[20px] bg-navy p-[22px] text-white">
        <Image
          src="/assets/almahdrah-logo.png"
          alt=""
          width={110}
          height={110}
          loading="lazy"
          className="pointer-events-none absolute -right-6 -bottom-6 w-[110px] opacity-[0.08] invert"
        />
        <span className="text-[13px] tracking-[2px] text-gold">★★★★★</span>
        <p className="relative mt-2.5 font-serif text-[14.5px] leading-[1.55] italic">
          &ldquo;The demo made it completely risk-free to begin — my children look forward to every class
          now.&rdquo;
        </p>
        <div className="relative mt-3 text-xs text-white/70">— Umm Abdullah, homeschooling parent</div>
      </div>

      <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3.5">
        <span className="h-2 w-2 flex-none rounded-full bg-green" />
        <span className="text-[12.5px] text-text">50+ students taught across 2+ countries</span>
      </div>
    </aside>
  );
}
