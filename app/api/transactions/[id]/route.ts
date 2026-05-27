import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: transaction } = await supabaseServer
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: steps } = await supabaseServer
    .from("transaction_steps")
    .select("*")
    .eq("transaction_id", id)
    .order("step_number", { ascending: true });

  const { data: tradeDocs } = await supabaseServer
    .from("transaction_documents")
    .select("*")
    .eq("transaction_id", id)
    .order("uploaded_at", { ascending: false });

  return NextResponse.json({
    transaction,
    steps: steps || [],
    tradeDocs: tradeDocs || [],
  });
}