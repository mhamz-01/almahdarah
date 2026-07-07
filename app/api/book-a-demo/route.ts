import { NextResponse } from "next/server";
import type { BookingFormState } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<BookingFormState>;

  if (!body.name?.trim() || !body.phone?.trim() || !body.email?.trim() || !body.country || !body.ageGroup) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  // TODO: persist to a real database. Logging as a stand-in for now.
  console.log("New demo booking request:", body);

  return NextResponse.json({ ok: true });
}
