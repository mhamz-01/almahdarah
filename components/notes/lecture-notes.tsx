import Markdown, { type Components } from "react-markdown";

// Renders lecture notes Markdown (AI-generated, admin-reviewed) in the site's
// type styles. react-markdown never renders raw HTML, so this is safe for
// model output. Used by the admin preview and the student course player.

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 border-b border-border pb-2 font-display text-[17px] tracking-[0.01em] text-ink uppercase first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="mt-5 mb-2 text-[15px] font-bold text-ink">{children}</h3>,
  p: ({ children }) => <p className="my-2.5 text-[14.5px] leading-[1.7] text-text">{children}</p>,
  ul: ({ children }) => <ul className="my-2.5 list-disc space-y-1.5 pl-5 text-[14.5px] leading-[1.65] text-text">{children}</ul>,
  ol: ({ children }) => (
    <ol className="my-2.5 list-decimal space-y-1.5 pl-5 text-[14.5px] leading-[1.65] text-text">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1 marker:text-muted [&>ol]:my-1.5 [&>ul]:my-1.5">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-primary pl-4 text-muted">{children}</blockquote>
  ),
  hr: () => <hr className="my-6 border-border" />,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
      {children}
    </a>
  ),
};

export function LectureNotes({ markdown }: { markdown: string }) {
  return (
    <div className="min-w-0 [&_h1]:mb-4 [&_h1]:font-display [&_h1]:text-[20px] [&_h1]:text-ink">
      <Markdown components={components}>{markdown}</Markdown>
    </div>
  );
}
