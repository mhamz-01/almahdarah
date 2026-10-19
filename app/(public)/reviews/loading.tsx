import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SkeletonBlock, SkeletonCircle, SkeletonLine } from "@/components/ui/skeleton";

export default function ReviewsLoading() {
  return (
    <>
      <Header />
      <main className="bg-bg">
        <div className="mx-auto max-w-[1160px] px-7 pt-12 pb-9 sm:pt-16 lg:pt-[68px]">
          <div className="max-w-[560px] space-y-4">
            <SkeletonLine className="w-44" />
            <SkeletonLine className="h-9 w-full" />
            <SkeletonLine className="h-4 w-2/3" />
          </div>
          <div className="mt-9 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-[86px]" />
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-[1160px] px-7 pb-20">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-surface p-[26px]">
                <SkeletonLine className="w-24" />
                <SkeletonLine className="h-3.5 w-full" />
                <SkeletonLine className="h-3.5 w-5/6" />
                <SkeletonLine className="h-3.5 w-2/3" />
                <div className="mt-2 flex items-center gap-3 border-t border-border pt-4">
                  <SkeletonCircle className="h-10 w-10" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonLine className="w-24" />
                    <SkeletonLine className="w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
