import type { Metadata } from "next";
import { V2Page } from "@/components/home/v2-page";
import { ReviewForm } from "@/components/reviews/review-form";

export const metadata: Metadata = {
  title: "Share Your Review | Al-Mahdrah Islamic Academy",
  description: "Tell us about your experience with Al-Mahdrah Islamic Academy.",
};

export default function ReviewPage() {
  return (
    <V2Page>
      <ReviewForm />
    </V2Page>
  );
}
