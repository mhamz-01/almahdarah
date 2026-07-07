import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { BlogCard } from "@/components/cards/blog-card";
import { blogPosts } from "@/lib/data/blog";

interface KeepReadingProps {
  currentSlug: string;
}

export function KeepReading({ currentSlug }: KeepReadingProps) {
  const related = blogPosts.filter((post) => post.slug !== currentSlug);

  return (
    <section className="mx-auto max-w-[1160px] px-6 py-16 sm:py-20">
      <Eyebrow className="text-muted" lineClassName="bg-muted">
        Keep reading
      </Eyebrow>
      <div className="mt-[22px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <BlogCard key={post.slug} {...post} />
        ))}
        <Link
          href="/#blog"
          className="group flex flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-border-strong p-6 text-center transition-colors duration-200 hover:border-primary"
        >
          <span className="font-display text-lg text-ink uppercase">All articles</span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            View the full Journal
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
