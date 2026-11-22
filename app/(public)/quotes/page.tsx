import type { Metadata } from "next";
import { V2Page } from "@/components/home/v2-page";
import { WallOfQuotes } from "@/components/quotes/wall-of-quotes";
import { getPublishedQuotes } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wall of Quotes | Al-Mahdrah Islamic Academy",
  description:
    "Passages our teachers read aloud in class, and quotes they share with our communities — catalogued by theme.",
};

export default async function QuotesPage() {
  const { data, error } = await getPublishedQuotes();

  return (
    <V2Page>
      <WallOfQuotes quotes={data ?? []} loadError={error?.message ?? null} />
    </V2Page>
  );
}
