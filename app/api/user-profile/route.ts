import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { data: kycProfile } = await supabaseServer
    .from("kyc_profiles")
    .select("id, first_name, last_name")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: kybProfile } = await supabaseServer
    .from("kyb_profiles")
    .select("id, company_name")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: documents } = await supabaseServer
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });

  const accountType = kycProfile ? "personal" : kybProfile ? "business" : null;

  return NextResponse.json({
    accountType,
    kycProfile,
    kybProfile,
    documents: documents || [],
  });
}