import { Footer } from "@/components/layout/footer";
import { SkeletonBlock, SkeletonLine } from "@/components/ui/skeleton";

export default function ArticleLoading() {
  return (
    <>
      <div className="sticky top-0 z-50 border-b border-border bg-bg/85 px-7 py-[13px] backdrop-blur-md">
        <div className="mx-auto max-w-[1020px]">
          <SkeletonLine className="w-24" />
        </div>
      </div>
      <main>
        <div className="mx-auto max-w-[820px] space-y-4 px-6 pt-14 pb-8 text-center">
          <SkeletonLine className="mx-auto w-32" />
          <SkeletonLine className="mx-auto h-10 w-full" />
          <SkeletonLine className="mx-auto h-10 w-3/4" />
          <SkeletonLine className="mx-auto h-4 w-1/2" />
        </div>
        <div className="mx-auto max-w-[1020px] px-6">
          <SkeletonBlock className="h-[280px]" />
        </div>
        <div className="mx-auto grid max-w-[1020px] grid-cols-1 gap-12 px-6 py-14 lg:grid-cols-[200px_minmax(0,1fr)]">
          <div className="hidden space-y-2.5 lg:block">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonLine key={i} className="w-full" />
            ))}
          </div>
          <div className="space-y-3.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonLine key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
