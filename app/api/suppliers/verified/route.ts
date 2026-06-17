import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: suppliers } = await supabaseServer
    .from("suppliers")
    .select("id, supplier_name, trade_name, country, primary_category, currencies_accepted, usd_details_status, rmb_details_status")
    .eq("verification_status", "verified")
    .order("supplier_name", { ascending: true });

  // Never expose actual account numbers to the customer — only whether
  // beneficiary details are on file, per currency.
  const safe = (suppliers || []).map((s) => ({
    id: s.id,
    supplier_name: s.supplier_name,
    trade_name: s.trade_name,
    country: s.country,
    primary_category: s.primary_category,
    currencies_accepted: s.currencies_accepted,
    has_usd_details: s.usd_details_status === "provided" || s.usd_details_status === "locked",
    has_rmb_details: s.rmb_details_status === "provided" || s.rmb_details_status === "locked",
  }));

  return NextResponse.json({ suppliers: safe });
}