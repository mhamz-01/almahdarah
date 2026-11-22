import { Reveal } from "@/components/ui/reveal";
import { getPublishedReviews } from "@/lib/supabase";
import { ReviewsFan, type FanReview } from "./reviews-fan";

const MAX_CARDS = 14;
const MAX_CHARS = 210;

function clip(text: string) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= MAX_CHARS) return t;
  const cut = t.slice(0, MAX_CHARS);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:\s]+$/, "") + "…";
}

/** Approved reviews, shown as a hand of cards. Renders nothing until there are a few to show. */
export async function ReviewsSection() {
  const { data } = await getPublishedReviews();
  const good = (data ?? []).filter(
    (r) => r.rating >= 4 && r.review_text.trim(),
  );

  // short, readable reviews first; longer ones are trimmed to fit a card
  const short = good.filter(
    (r) => r.review_text.length >= 60 && r.review_text.length <= MAX_CHARS,
  );
  const rest = good.filter((r) => !short.includes(r));
  const picked = [...short, ...rest].slice(0, MAX_CARDS);
  if (picked.length < 3) return null;

  const average = good.reduce((t, r) => t + r.rating, 0) / good.length;

  const reviews: FanReview[] = picked.map((r) => ({
    id: r.id,
    name: r.name,
    place: [r.city, r.country].filter(Boolean).join(", "),
    rating: r.rating,
    role: r.reviewer_type === "parent" ? "Parent" : "Student",
    text: clip(r.review_text),
  }));

  return (
    <section
      id="voices"
      className="relative isolate overflow-hidden border-t border-border bg-surface"
    >
      <div className="mx-auto max-w-[1200px] px-5 pt-[clamp(72px,10vw,128px)] pb-[clamp(110px,12vw,160px)] sm:px-7">
        <div className="mx-auto max-w-[640px] text-center">
          <Reveal>
            <span className="block font-mono text-xs tracking-[0.1em] text-primary">
              FROM OUR STUDENTS & PARENTS
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-4 text-[clamp(30px,4.4vw,56px)] leading-[1.04] font-semibold tracking-[-0.04em] text-balance text-ink">
              Ask the ones who sat in the class.
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-paper px-4 py-2 text-[13.5px] text-text">
              <span aria-hidden className="tracking-[0.12em] text-gold">
                ★★★★★
              </span>
              <span>
                <b className="font-semibold text-ink">{average.toFixed(1)}</b>{" "}
                from {good.length} students &amp; parents
              </span>
            </div>
          </Reveal>
        </div>

        <div className="mt-[clamp(40px,6vw,72px)]">
          <ReviewsFan reviews={reviews} />
        </div>
      </div>
    </section>
  );
}
