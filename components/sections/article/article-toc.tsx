"use client";

import { useArticleReader } from "@/components/providers/article-reader-provider";

interface TocItem {
  id: string;
  label: string;
}

interface ArticleTocProps {
  items: TocItem[];
}

export function ArticleToc({ items }: ArticleTocProps) {
  const { activeHeadingId, focus } = useArticleReader();

  if (focus) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 hidden flex-col gap-0.5 lg:flex"
    >
      <span className="mb-2.5 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
        On this page
      </span>
      {items.map((item) => {
        const active = activeHeadingId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`border-l-2 py-2 pl-3.5 text-[13px] leading-[1.4] font-semibold transition-colors duration-200 ${
              active ? "border-primary text-primary" : "border-border text-muted hover:text-primary"
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
