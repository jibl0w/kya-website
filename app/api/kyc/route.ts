import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const {
    title,
    first_name,
    last_name,
    email,
    phone,
    dob,
    nationality,
    address,
    id_type,
    id_number,
    source_of_funds,
    is_joint_account,
    joint_full_name,
  } = body;

  if (!first_name || !last_name || !email || !dob || !nationality) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: existing } = await supabaseServer
    .from("kyc_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseServer
      .from("kyc_profiles")
      .update({
        title,
        first_name,
        last_name,
        email,
        phone,
        dob,
        nationality,
        address,
        id_type,
        id_number,
        kyc_status: "pending",
      })
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseServer
      .from("kyc_profiles")
      .insert({
        user_id: userId,
        title,
        first_name,
        last_name,
        email,
        phone,
        dob,
        nationality,
        address,
        id_type,
        id_number,
        kyc_status: "pending",
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}