import { SkeletonBlock, SkeletonLine } from "@/components/ui/skeleton";

export function VisionSkeleton() {
  return (
    <div className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[110px]">
      <div className="max-w-[780px] space-y-3">
        <SkeletonLine className="w-32" />
        <SkeletonLine className="h-8 w-full" />
        <SkeletonLine className="h-8 w-2/3" />
      </div>
      <div className="mt-12 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[190px]" />
        ))}
      </div>
    </div>
  );
}
