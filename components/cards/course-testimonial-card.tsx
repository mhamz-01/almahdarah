import type { CourseTestimonial } from "@/lib/types";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { StarRating } from "@/components/ui/star-rating";

export function CourseTestimonialCard({ quote, name, role, accent }: CourseTestimonial) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-7 shadow-[var(--shadow-sm)]">
      <StarRating className="text-sm" />
      <p className="mt-3.5 font-serif text-[17px] leading-[1.55] text-ink italic">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <AvatarPlaceholder accent={accent} size={42} />
        <div>
          <div className="text-sm font-bold text-ink">{name}</div>
          <div className="text-[12.5px] text-muted">{role}</div>
        </div>
      </div>
    </div>
  );
}
