import { SkeletonBlock, SkeletonLine } from "@/components/ui/skeleton";

export function PaidCoursesSkeleton() {
  return (
    <div className="bg-surface-2">
      <div className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[104px]">
        <div className="max-w-[600px] space-y-3">
          <SkeletonLine className="w-40" />
          <SkeletonLine className="h-9 w-full" />
        </div>
        <div className="mt-[42px] grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[360px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
