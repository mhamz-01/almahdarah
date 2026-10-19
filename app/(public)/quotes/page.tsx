import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
    <>
      <Header />
      <main>
        <WallOfQuotes quotes={data ?? []} loadError={error?.message ?? null} />
      </main>
      <Footer />
    </>
  );
}
