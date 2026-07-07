import type { ArticleDetail } from "@/lib/types";
import { Eyebrow } from "@/components/ui/eyebrow";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";

interface ArticleHeaderProps {
  article: ArticleDetail;
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  return (
    <div className="mx-auto max-w-[760px] px-6 pt-9 sm:pt-14">
      <Eyebrow className="text-primary-2" lineClassName="bg-primary-2">
        {article.tag}
      </Eyebrow>

      <h1 className="mt-[18px] font-display text-[clamp(30px,4.4vw,50px)] leading-[1.02] tracking-[-0.01em] text-ink uppercase text-balance">
        {article.title}
      </h1>

      <p className="mt-[18px] max-w-[56ch] font-serif text-[clamp(17px,1.8vw,21px)] leading-[1.5] text-text italic">
        {article.subtitle}
      </p>

      <div className="mt-7 flex items-center gap-3 border-b border-border pb-7">
        <AvatarPlaceholder accent={article.accent} size={44} />
        <div className="flex flex-wrap items-center gap-2 text-[13.5px] text-muted">
          <span className="font-bold text-ink">{article.authorName}</span>
          <span>·</span>
          <span>{article.authorRole}</span>
          <span>·</span>
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </div>
  );
}
