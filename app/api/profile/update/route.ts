import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const { accountType } = body;

  if (accountType === "personal") {
    // Whitelist: only phone and address may be edited on KYC.
    const update: Record<string, string> = {};
    if (typeof body.phone === "string") update.phone = body.phone;
    if (typeof body.address === "string") update.address = body.address;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("kyc_profiles")
      .update(update)
      .eq("user_id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  }

  if (accountType === "business") {
    // Whitelist: only representative_phone and company_email may be edited on KYB.
    const update: Record<string, string> = {};
    if (typeof body.representative_phone === "string") update.representative_phone = body.representative_phone;
    if (typeof body.company_email === "string") update.company_email = body.company_email;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("kyb_profiles")
      .update(update)
      .eq("user_id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
}