import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CourseSectionSkeleton } from "@/components/skeletons/course-section-skeleton";
import { SkeletonCircle, SkeletonLine } from "@/components/ui/skeleton";

export default function FacultyLoading() {
  return (
    <>
      <Header />
      <main>
        <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-4 px-7 pt-14 pb-10 text-center">
          <SkeletonCircle className="h-[112px] w-[112px]" />
          <SkeletonLine className="h-8 w-64" />
          <SkeletonLine className="w-40" />
          <SkeletonLine className="h-3.5 w-full max-w-[52ch]" />
        </div>

        <CourseSectionSkeleton rows={4} bordered />
        <CourseSectionSkeleton rows={3} />
      </main>
      <Footer />
    </>
  );
}
