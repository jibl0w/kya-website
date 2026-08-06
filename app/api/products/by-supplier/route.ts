import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get("supplierId");
  if (!supplierId) return NextResponse.json({ products: [] });

  const { data: products } = await supabaseServer
    .from("products")
    .select("id, product_name, model_number, category, pricing, moq")
    .eq("supplier_id", supplierId)
    .eq("status", "active")
    .order("product_name", { ascending: true });

  return NextResponse.json({ products: products || [] });
}