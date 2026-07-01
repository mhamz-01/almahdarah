import { SkeletonBlock, SkeletonLine } from "@/components/ui/skeleton";

export function TrustSkeleton() {
  return (
    <div className="bg-navy">
      <div className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[108px]">
        <div className="max-w-[620px] space-y-3">
          <SkeletonLine className="w-36 bg-white/10" />
          <SkeletonLine className="h-10 w-full bg-white/10" />
        </div>
        <div className="mt-10 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[90px] bg-white/10" />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonBlock className="col-span-full h-[200px] bg-white/10" />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[180px] bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
