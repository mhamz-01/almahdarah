import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ReviewsExplorer } from "@/components/reviews/reviews-explorer";
import { getPublishedReviews } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviews | Al-Mahdrah Islamic Academy",
  description:
    "Real experiences from families and learners across the world, shared in their own words.",
};

export default async function ReviewsPage() {
  const { data, error } = await getPublishedReviews();

  return (
    <>
      <Header />
      <main>
        <ReviewsExplorer reviews={data ?? []} loadError={error?.message ?? null} />
      </main>
      <Footer />
    </>
  );
}
