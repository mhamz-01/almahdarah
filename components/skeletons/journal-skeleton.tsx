import { SkeletonBlock, SkeletonLine } from "@/components/ui/skeleton";

export function JournalSkeleton() {
  return (
    <div className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[104px]">
      <SkeletonLine className="w-40" />
      <div className="mt-[38px] grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[340px]" />
        ))}
      </div>
    </div>
  );
}
