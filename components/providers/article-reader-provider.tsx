"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const FONT_SIZES = [17, 19, 21, 23] as const;

interface ArticleReaderState {
  fontSize: number;
  increaseFont: () => void;
  decreaseFont: () => void;
  focus: boolean;
  toggleFocus: () => void;
  activeHeadingId: string | null;
}

const ArticleReaderContext = createContext<ArticleReaderState | null>(null);

interface ArticleReaderProviderProps {
  headingIds: string[];
  children: ReactNode;
}

export function ArticleReaderProvider({ headingIds, children }: ArticleReaderProviderProps) {
  const [fontStep, setFontStep] = useState(1);
  const [focus, setFocus] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(headingIds[0] ?? null);

  useEffect(() => {
    if (headingIds.length === 0) return;

    const onScroll = () => {
      let current = headingIds[0];
      for (const id of headingIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - 140 <= 0) current = id;
      }
      setActiveHeadingId((prev) => (prev === current ? prev : current));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headingIds]);

  const value: ArticleReaderState = {
    fontSize: FONT_SIZES[fontStep],
    increaseFont: () => setFontStep((s) => Math.min(FONT_SIZES.length - 1, s + 1)),
    decreaseFont: () => setFontStep((s) => Math.max(0, s - 1)),
    focus,
    toggleFocus: () => setFocus((f) => !f),
    activeHeadingId,
  };

  return <ArticleReaderContext.Provider value={value}>{children}</ArticleReaderContext.Provider>;
}

export function useArticleReader() {
  const ctx = useContext(ArticleReaderContext);
  if (!ctx) throw new Error("useArticleReader must be used within an ArticleReaderProvider");
  return ctx;
}
