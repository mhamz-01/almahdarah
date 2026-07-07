import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { BlogCard } from "@/components/cards/blog-card";
import { blogPosts } from "@/lib/data/blog";

export function Journal() {
  return (
    <section id="blog" className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[104px]">
      <div className="flex flex-wrap items-end justify-between gap-[18px]">
        <Reveal>
          <SectionHeading eyebrow="The Journal" title="Reflections & reading" />
        </Reveal>
        <Reveal delay={90}>
          <a
            href="#blog"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-green transition-opacity hover:opacity-80"
          >
            All articles
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </a>
        </Reveal>
      </div>

      <div className="mt-[38px] grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post, i) => (
          <Reveal key={post.title} delay={i * 80}>
            <BlogCard {...post} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
