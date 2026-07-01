import { SkeletonLine } from "@/components/ui/skeleton";

export function DemoCtaSkeleton() {
  return (
    <div style={{ background: "linear-gradient(152deg, var(--primary) 0%, var(--primary-2) 100%)" }}>
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-4 px-7 py-16 sm:py-20 lg:py-[100px]">
        <SkeletonLine className="h-12 w-2/3 bg-white/15" />
        <SkeletonLine className="h-4 w-1/2 bg-white/15" />
        <SkeletonLine className="mt-4 h-14 w-48 rounded-full bg-white/15" />
      </div>
    </div>
  );
}
