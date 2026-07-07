"use client";

import type { ArticleDetail } from "@/lib/types";
import { CheckGlyph } from "@/components/ui/check-glyph";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { useArticleReader } from "@/components/providers/article-reader-provider";

interface ArticleBodyProps {
  article: ArticleDetail;
}

export function ArticleBody({ article }: ArticleBodyProps) {
  const { fontSize } = useArticleReader();

  return (
    <article style={{ fontSize }} className="max-w-[700px] leading-[1.8] text-text">
      {article.body.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="mb-[1.3em] first:text-[1.05em] first:text-ink">
                {block.text}
              </p>
            );
          case "h2":
            return (
              <h2
                key={block.id}
                id={block.id}
                className="mt-[1.6em] mb-[0.6em] scroll-mt-28 font-display text-[1.35em] leading-[1.2] tracking-[-0.005em] text-ink uppercase"
              >
                {block.text}
              </h2>
            );
          case "quote":
            return (
              <div key={i} className="my-[1.8em] border-l-4 border-primary pl-[1.3em]">
                <p className="font-serif text-[1.2em] leading-[1.55] text-ink italic">{block.text}</p>
              </div>
            );
          case "list":
            return (
              <div key={i} className="mb-[1.3em] flex flex-col gap-[0.7em]">
                {block.items.map((item) => (
                  <div key={item} className="flex items-start gap-[0.7em]">
                    <CheckGlyph size={18} className="mt-[0.25em]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}

      <p className="mb-0 text-ink">{article.closingNote}</p>

      <div className="mt-[2.2em] flex items-center gap-3.5 rounded-2xl border border-border bg-surface-2 p-[1.3em]">
        <AvatarPlaceholder accent={article.accent} size={46} />
        <p className="m-0 text-[0.72em] text-text">
          <strong className="text-ink">{article.authorName}</strong> {article.authorBio}
        </p>
      </div>
    </article>
  );
}
