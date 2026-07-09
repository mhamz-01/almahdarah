import { NextResponse } from "next/server";
import type { ReviewFormState } from "@/lib/types";
import { insertReview } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ReviewFormState>;

  const rating = Number(body.rating);

  if (
    (body.reviewerType !== "parent" && body.reviewerType !== "student") ||
    !body.name?.trim() ||
    !body.country?.trim() ||
    !body.city?.trim() ||
    !body.reviewText?.trim() ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    await insertReview({
      reviewer_type: body.reviewerType,
      name: body.name.trim(),
      country: body.country.trim(),
      city: body.city.trim(),
      rating,
      review_text: body.reviewText.trim(),
    });
  } catch (error) {
    console.error("Failed to save review:", error);
    return NextResponse.json({ ok: false, error: "Failed to save review" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
