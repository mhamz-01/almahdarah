import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/booking-flow";

export const metadata: Metadata = {
  title: "Book a Free Demo | Al-Mahdrah Islamic Academy",
  description:
    "Book a free, no-obligation demo class with a qualified Al-Mahdrah teacher — two minutes to book, thirty minutes to meet.",
};

export default function BookADemoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Suspense fallback={null}>
        <BookingFlow />
      </Suspense>
    </div>
  );
}
