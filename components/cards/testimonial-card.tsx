import type { Testimonial } from "@/lib/types";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { StarRating } from "@/components/ui/star-rating";

export function TestimonialCard({ quote, name, role, accent, featured }: Testimonial) {
  if (featured) {
    return (
      <div
        className="col-span-full flex flex-wrap items-center gap-7 rounded-3xl p-7 shadow-[var(--shadow-lg)] sm:p-11"
        style={{ background: "linear-gradient(150deg, var(--primary), var(--primary-2))" }}
      >
        <div className="min-w-[260px] flex-1">
          <StarRating className="text-gold text-lg" />
          <p className="mt-3.5 line-clamp-4 font-serif text-[clamp(20px,2.2vw,28px)] leading-[1.4] text-white italic">
            &ldquo;{quote}&rdquo;
          </p>
          <div className="mt-[22px] flex items-center gap-3.5">
            <AvatarPlaceholder accent={accent} size={50} className="border-2 border-white/35" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold text-white">{name}</div>
              <div className="truncate text-[13px] text-white/78">{role}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-white/14 bg-white/[0.07] p-[26px]">
      <StarRating className="text-sm" />
      <p className="mt-3 line-clamp-5 flex-1 text-[14.5px] leading-[1.6] text-white/92">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-5 flex items-center gap-3 border-t border-white/12 pt-[18px]">
        <AvatarPlaceholder accent={accent} size={42} />
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white">{name}</div>
          <div className="truncate text-[12.5px] text-white/70">{role}</div>
        </div>
      </div>
    </div>
  );
}
