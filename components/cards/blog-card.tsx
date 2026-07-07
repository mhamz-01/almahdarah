import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { CoverPlaceholder } from "@/components/ui/cover-placeholder";

export function BlogCard({ slug, tag, title, excerpt, readTime, accent }: BlogPost) {
  return (
    <Link
      href={`/journal/${slug}`}
      className="group flex flex-col overflow-hidden rounded-[22px] border border-border bg-surface shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
    >
      <div className="overflow-hidden">
        <CoverPlaceholder
          accent={accent}
          className="h-[172px] transition-transform duration-300 ease-out group-hover:scale-[1.06]"
        />
      </div>
      <div className="flex flex-col gap-2.5 p-6">
        <span className="text-[11.5px] font-bold tracking-[0.08em] text-green uppercase">
          {tag}
        </span>
        <h3 className="text-[19px] leading-[1.25] font-bold text-ink">{title}</h3>
        <p className="text-sm text-text">{excerpt}</p>
        <span className="mt-1 text-[12.5px] text-muted">{readTime}</span>
      </div>
    </Link>
  );
}
