import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CourseSectionSkeleton } from "@/components/skeletons/course-section-skeleton";
import { SkeletonBlock, SkeletonLine } from "@/components/ui/skeleton";

export default function CourseLoading() {
  return (
    <>
      <Header />
      <main>
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-10 px-7 pt-10 pb-16 lg:grid-cols-2 lg:gap-16 lg:pb-[68px]">
          <div className="space-y-4">
            <SkeletonLine className="w-32" />
            <SkeletonLine className="h-12 w-full" />
            <SkeletonLine className="h-4 w-5/6" />
            <SkeletonLine className="h-4 w-2/3" />
            <SkeletonLine className="mt-3 h-11 w-48 rounded-full" />
          </div>
          <SkeletonBlock className="h-[360px]" />
        </div>

        <CourseSectionSkeleton rows={4} bordered />
        <CourseSectionSkeleton rows={3} />
      </main>
      <Footer />
    </>
  );
}
