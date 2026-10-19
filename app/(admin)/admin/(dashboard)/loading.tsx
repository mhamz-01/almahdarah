import { SkeletonBlock, SkeletonLine } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2.5">
        <SkeletonLine className="h-9 w-28 rounded-full" />
        <SkeletonLine className="h-9 w-28 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[86px]" />
        ))}
      </div>
      <SkeletonBlock className="h-[420px]" />
    </div>
  );
}
