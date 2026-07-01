import { SectionHeading } from "@/components/ui/section-heading";
import { BlogCard } from "@/components/cards/blog-card";
import { blogPosts } from "@/lib/data/blog";

export function Journal() {
  return (
    <section id="blog" className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[104px]">
      <div className="flex flex-wrap items-end justify-between gap-[18px]">
        <SectionHeading eyebrow="The Journal" title="Reflections & reading" />
        <a href="#blog" className="text-sm font-bold text-green transition-opacity hover:opacity-80">
          All articles →
        </a>
      </div>

      <div className="mt-[38px] grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <BlogCard key={post.title} {...post} />
        ))}
      </div>
    </section>
  );
}
