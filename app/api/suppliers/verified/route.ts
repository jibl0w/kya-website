import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: suppliers } = await supabaseServer
    .from("suppliers")
    .select("id, supplier_name, trade_name, country, primary_category, currencies_accepted, bank_details_status, beneficiary_currency")
    .eq("verification_status", "verified")
    .order("supplier_name", { ascending: true });

  // Do NOT expose the supplier's actual beneficiary account number to the customer.
  // Only whether details are on file, so the customer knows if payment can proceed.
  const safe = (suppliers || []).map((s) => ({
    id: s.id,
    supplier_name: s.supplier_name,
    trade_name: s.trade_name,
    country: s.country,
    primary_category: s.primary_category,
    currencies_accepted: s.currencies_accepted,
    has_bank_details: s.bank_details_status === "provided" || s.bank_details_status === "locked",
    beneficiary_currency: s.beneficiary_currency,
  }));

  return NextResponse.json({ suppliers: safe });
}