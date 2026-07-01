import { SkeletonBlock, SkeletonLine } from "@/components/ui/skeleton";

export function FreeCoursesSkeleton() {
  return (
    <div className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[104px]">
      <div className="max-w-[620px] space-y-3">
        <SkeletonLine className="w-32" />
        <SkeletonLine className="h-9 w-full" />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[240px]" />
        ))}
      </div>
    </div>
  );
}
