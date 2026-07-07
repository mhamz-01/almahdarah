import { SkeletonBlock, SkeletonLine } from "@/components/ui/skeleton";

interface CourseSectionSkeletonProps {
  rows?: number;
  bordered?: boolean;
}

export function CourseSectionSkeleton({ rows = 3, bordered = false }: CourseSectionSkeletonProps) {
  return (
    <div className={bordered ? "border-y border-border bg-surface-2" : ""}>
      <div className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[96px]">
        <div className="max-w-[600px] space-y-3">
          <SkeletonLine className="w-40" />
          <SkeletonLine className="h-9 w-full" />
        </div>
        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[110px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
