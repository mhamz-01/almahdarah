import { SkeletonCircle, SkeletonLine } from "@/components/ui/skeleton";

export function FacultySkeleton() {
  return (
    <div className="bg-surface-2">
      <div className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[104px]">
        <div className="max-w-[620px] space-y-3">
          <SkeletonLine className="w-36" />
          <SkeletonLine className="h-9 w-full" />
        </div>
        <div className="mt-[42px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-[22px] border border-border bg-surface p-6"
            >
              <SkeletonCircle className="h-[98px] w-[98px]" />
              <SkeletonLine className="w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
