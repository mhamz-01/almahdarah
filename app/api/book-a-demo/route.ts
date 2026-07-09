import { NextResponse } from "next/server";
import type { BookingFormState } from "@/lib/types";
import { insertLead } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<BookingFormState>;

  if (!body.name?.trim() || !body.phone?.trim() || !body.email?.trim() || !body.country || !body.ageGroup) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    await insertLead({
      source: "demo_booking",
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email.trim(),
      details: body,
    });
  } catch (error) {
    console.error("Failed to save demo booking request:", error);
    return NextResponse.json({ ok: false, error: "Failed to save request" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
