import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const docKey = formData.get("docKey") as string;
  const transactionId = formData.get("transactionId") as string;
  const existingDocId = formData.get("existingDocId") as string;
  const version = parseInt(formData.get("version") as string) || 1;

  if (!file || !docKey || !transactionId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = userId + "/transactions/" + transactionId + "/" + docKey + "_" + Date.now() + "." + fileExt;
  const fileBuffer = await file.arrayBuffer();

  const { error: storageError } = await supabaseServer.storage
    .from("kya-documents")
    .upload(fileName, fileBuffer, { contentType: file.type, upsert: true });

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { data: urlData } = supabaseServer.storage
    .from("kya-documents")
    .getPublicUrl(fileName);

  if (existingDocId && existingDocId !== "null") {
    await supabaseServer
      .from("transaction_documents")
      .update({
        file_url: urlData.publicUrl,
        file_name: file.name,
        status: "pending",
        rejection_reason: null,
        uploaded_at: new Date().toISOString(),
        version,
      })
      .eq("id", existingDocId);
  } else {
    await supabaseServer
      .from("transaction_documents")
      .insert({
        transaction_id: transactionId,
        user_id: userId,
        document_type: docKey,
        file_url: urlData.publicUrl,
        file_name: file.name,
        status: "pending",
        version: 1,
      });
  }

  return NextResponse.json({ success: true });
}