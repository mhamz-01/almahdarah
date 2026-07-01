import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";

interface SectionHeadingProps {
  eyebrow: string;
  eyebrowClassName?: string;
  eyebrowLineClassName?: string;
  title: ReactNode;
  titleClassName?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  eyebrowClassName = "text-green",
  eyebrowLineClassName = "bg-green",
  title,
  titleClassName = "text-ink",
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <Eyebrow className={eyebrowClassName} lineClassName={eyebrowLineClassName}>
        {eyebrow}
      </Eyebrow>
      <h2
        className={`mt-4 font-display uppercase leading-[0.96] tracking-[-0.01em] text-[clamp(30px,3.8vw,50px)] ${titleClassName}`}
      >
        {title}
      </h2>
    </div>
  );
}
