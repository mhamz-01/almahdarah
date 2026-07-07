import type { AccentToken } from "@/lib/types";
import { CoverPlaceholder } from "@/components/ui/cover-placeholder";

interface ArticleCoverProps {
  glyph: string;
  accent: AccentToken;
}

export function ArticleCover({ glyph, accent }: ArticleCoverProps) {
  return (
    <div className="mx-auto max-w-[900px] px-6 pt-7">
      <div className="relative h-[clamp(160px,26vw,260px)] overflow-hidden rounded-[22px] shadow-[var(--shadow-md)]">
        <CoverPlaceholder accent={accent} className="h-full" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-5 -bottom-4 font-display text-[clamp(90px,14vw,150px)] leading-none text-white/[0.16]"
        >
          {glyph}
        </span>
      </div>
    </div>
  );
}
