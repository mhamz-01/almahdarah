import type { Metadata } from "next";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { dsFontVariables } from "@/lib/fonts-v2";

export const metadata: Metadata = {
  title: "Student Portal Feedback | Al-Mahdrah Islamic Academy",
  description: "Quick, anonymous feedback to help us improve the Al-Mahdrah student portal.",
};

// Uses the v2 design system (tokens scoped to [data-ds="v2"], see app/globals.css).
export default function FeedbackPage() {
  return (
    <div data-ds="v2" className={`${dsFontVariables} min-h-screen`}>
      <FeedbackForm />
    </div>
  );
}
