import { NextResponse } from "next/server";
import type { JoinCommunityFormState } from "@/lib/types";
import { insertLead } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<JoinCommunityFormState>;

  if (!body.name?.trim() || !body.age?.trim() || !body.contact?.trim() || !body.message?.trim()) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    await insertLead({
      source: "free_course",
      name: body.name.trim(),
      phone: body.contact.trim(),
      details: body,
    });
  } catch (error) {
    console.error("Failed to save community join request:", error);
    return NextResponse.json({ ok: false, error: "Failed to save request" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
