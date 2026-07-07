import { NextResponse } from "next/server";
import type { JoinCommunityFormState } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<JoinCommunityFormState>;

  if (!body.name?.trim() || !body.age?.trim() || !body.contact?.trim() || !body.message?.trim()) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  // TODO: persist to a real database. Dummy call shown below, commented out for now.
  // await db.communityRequests.create({ data: body });
  console.log("New community join request:", body);

  return NextResponse.json({ ok: true });
}
