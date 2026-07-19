import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/booking-flow";
import { getPublishedReviews } from "@/lib/supabase";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Book a Free Demo | Al-Mahdrah Islamic Academy",
  description:
    "Book a free, no-obligation demo class with a qualified Al-Mahdrah teacher — two minutes to book, thirty minutes to meet.",
};

export default async function BookADemoPage() {
  const { data } = await getPublishedReviews();
  const featuredReview = data?.[0] ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Suspense fallback={null}>
        <BookingFlow featuredReview={featuredReview} />
      </Suspense>
    </div>
  );
}
