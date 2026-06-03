import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { notifyCustomerKybSubmitted, notifyAdminKybSubmitted } from "@/lib/notifications";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const {
    company_name, cac_number, tin, business_type, registered_address,
    company_email, representative_title, representative_name,
    representative_email, representative_phone,
  } = body;

  if (!company_name || !cac_number || !registered_address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: existing } = await supabaseServer
    .from("kyb_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseServer
      .from("kyb_profiles")
      .update({ company_name, cac_number, tin, business_type, registered_address, company_email, representative_title, representative_name, representative_email, representative_phone, kyb_status: "pending" })
      .eq("user_id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseServer
      .from("kyb_profiles")
      .insert({ user_id: userId, company_name, cac_number, tin, business_type, registered_address, company_email, representative_title, representative_name, representative_email, representative_phone, kyb_status: "pending" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const email = representative_email || company_email || "";
    const name = ((representative_title || "") + " " + (representative_name || "")).trim();
    await notifyCustomerKybSubmitted({ customerEmail: email, customerName: name, companyName: company_name });
    await notifyAdminKybSubmitted({ customerName: name, companyName: company_name, customerEmail: email });
  } catch (err) {
    console.error("Notification error:", err);
  }

  return NextResponse.json({ success: true });
}