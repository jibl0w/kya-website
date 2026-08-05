import { supabaseServer } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProductsMarketplace from "./ProductsMarketplace";

export default async function MarketplacePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: products } = await supabaseServer
    .from("products")
    .select("id, product_name, category, keywords, model_number, description, specifications, assembly_options, pricing, moq, lead_time, certifications, country_of_origin, warranty, media_link, status, supplier_id, suppliers(id, supplier_name, country, verification_status)")
    .eq("status", "active")
    .order("product_name", { ascending: true });

  // Supabase returns the joined supplier as an array; flatten to a single object,
  // and only show products whose supplier is verified.
  const visibleProducts = (products || [])
    .map((p: any) => ({
      ...p,
      suppliers: Array.isArray(p.suppliers) ? p.suppliers[0] : p.suppliers,
    }))
    .filter((p: any) => p.suppliers && p.suppliers.verification_status === "verified");

  return <ProductsMarketplace products={visibleProducts as any} />;
}