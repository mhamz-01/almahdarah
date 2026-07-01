import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  lineClassName?: string;
}

export function Eyebrow({ children, className = "", lineClassName = "" }: EyebrowProps) {
  return (
    <span
      className={`inline-flex items-center gap-[9px] text-[12.5px] font-bold uppercase tracking-[0.2em] ${className}`}
    >
      <span className={`inline-block h-[2px] w-[22px] ${lineClassName}`} />
      {children}
    </span>
  );
}
