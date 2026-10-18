// Round tick used by every personal-task row. Must sit inside a `group/check` element.
export function TaskTick({ checked, busy, size = 22 }: { checked: boolean; busy: boolean; size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`flex items-center justify-center rounded-full border-2 transition-colors ${
        checked ? "border-green bg-green text-white" : "border-border-strong bg-bg group-hover/check:border-green"
      } ${busy ? "opacity-50" : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-[62%] w-[62%] ${checked ? "opacity-100" : "opacity-0 group-hover/check:opacity-40"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
