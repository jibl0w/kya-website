import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { docKey, fileUrl, fileName, accountType, existingDocId, version } = await req.json();

  if (existingDocId) {
    const { error } = await supabaseServer
      .from("documents")
      .update({
        file_url: fileUrl,
        file_name: fileName,
        verification_status: "pending",
        status: "pending",
        rejection_reason: null,
        uploaded_at: new Date().toISOString(),
        version,
      })
      .eq("id", existingDocId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseServer
      .from("documents")
      .insert({
        user_id: userId,
        document_type: docKey,
        entity_type: accountType === "personal" ? "kyc" : "kyb",
        account_type: accountType,
        file_url: fileUrl,
        file_name: fileName,
        verification_status: "pending",
        status: "pending",
        version: 1,
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}