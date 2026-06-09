import { supabaseServer } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SuppliersMarketplace from "./SuppliersMarketplace";

export default async function SuppliersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: suppliers } = await supabaseServer
    .from("suppliers")
    .select("id, supplier_name, trade_name, country, city, primary_category, products_offered, minimum_order_value, lead_time_days, payment_terms, currencies_accepted, verification_status, verified_at, contact_person, contact_email, contact_phone, website, year_established")
    .eq("verification_status", "verified")
    .order("supplier_name", { ascending: true });

  return (
    <SuppliersMarketplace suppliers={suppliers || []} />
  );
}