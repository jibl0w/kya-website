import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET all documents
export async function GET() {
  const { data, error } = await supabaseServer
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ documents: data || [] });
}

// UPDATE document status
export async function PATCH(req: Request) {
  const { id, status } = await req.json();

  if (!id || !status) {
    return NextResponse.json(
      { error: "Missing id or status" },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from("documents")
    .update({ verification_status: status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}