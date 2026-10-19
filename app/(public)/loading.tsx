import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SkeletonBlock, SkeletonLine } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <>
      <Header />
      <main>
        <div className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[104px]">
          <div className="max-w-[620px] space-y-4">
            <SkeletonLine className="w-40" />
            <SkeletonLine className="h-11 w-full" />
            <SkeletonLine className="h-11 w-3/4" />
          </div>
          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-[220px]" />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
