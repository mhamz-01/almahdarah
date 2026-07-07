import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { ArticleTopBar } from "@/components/layout/article-top-bar";
import { ReadingProgressBar } from "@/components/layout/reading-progress-bar";
import { ArticleReaderProvider } from "@/components/providers/article-reader-provider";
import { ArticleHeader } from "@/components/sections/article/article-header";
import { ArticleCover } from "@/components/sections/article/article-cover";
import { ArticleToc } from "@/components/sections/article/article-toc";
import { ArticleBody } from "@/components/sections/article/article-body";
import { ArticleCta } from "@/components/sections/article/article-cta";
import { KeepReading } from "@/components/sections/article/keep-reading";
import { getAllArticleSlugs, getArticle } from "@/lib/data/articles";
import type { ArticleBlock } from "@/lib/types";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) return {};

  return {
    title: `${article.title} | Al-Mahdrah Journal`,
    description: article.subtitle,
  };
}

function getTocItems(body: ArticleBlock[]) {
  return body
    .filter((block): block is Extract<ArticleBlock, { type: "h2" }> => block.type === "h2")
    .map((block) => ({ id: block.id, label: block.text }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) notFound();

  const tocItems = getTocItems(article.body);

  return (
    <ArticleReaderProvider headingIds={tocItems.map((item) => item.id)}>
      <ReadingProgressBar />
      <ArticleTopBar />
      <main>
        <ArticleHeader article={article} />
        <ArticleCover glyph={article.coverGlyph} accent={article.accent} />

        <div className="mx-auto grid max-w-[1020px] grid-cols-1 gap-12 px-6 py-14 sm:py-16 lg:grid-cols-[200px_minmax(0,1fr)] lg:py-[56px]">
          <ArticleToc items={tocItems} />
          <ArticleBody article={article} />
        </div>

        <ArticleCta />
        <KeepReading currentSlug={article.slug} />
      </main>
      <Footer />
    </ArticleReaderProvider>
  );
}
