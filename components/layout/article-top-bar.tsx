"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useArticleReader } from "@/components/providers/article-reader-provider";

export function ArticleTopBar() {
  const { increaseFont, decreaseFont, focus, toggleFocus } = useArticleReader();

  return (
    <header className="sticky top-0 z-[80] border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-6 py-[13px]">
        <Link
          href="/#blog"
          className="flex items-center gap-2 text-[13.5px] font-bold text-text transition-colors hover:text-primary"
        >
          <span className="text-base leading-none">←</span>
          <span className="hidden sm:inline">Journal</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-surface p-1">
            <button
              type="button"
              onClick={decreaseFont}
              aria-label="Decrease text size"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-xs font-bold text-text transition-colors hover:bg-surface-2"
            >
              A−
            </button>
            <button
              type="button"
              onClick={increaseFont}
              aria-label="Increase text size"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[15px] font-bold text-text transition-colors hover:bg-surface-2"
            >
              A+
            </button>
          </div>

          <button
            type="button"
            onClick={toggleFocus}
            aria-pressed={focus}
            className={`inline-flex h-[38px] items-center gap-[7px] rounded-full border border-border px-3.5 text-[13px] font-bold transition-colors duration-200 ${
              focus ? "bg-primary text-white" : "bg-surface text-text hover:border-border-strong"
            }`}
          >
            <span className="h-[7px] w-[7px] rounded-full bg-current" />
            <span className="hidden sm:inline">{focus ? "Exit focus" : "Focus mode"}</span>
          </button>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
