import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const docKey = formData.get("docKey") as string;
  const accountType = formData.get("accountType") as string;
  const existingDocId = formData.get("existingDocId") as string | null;
  const version = parseInt(formData.get("version") as string) || 1;

  if (!file || !docKey) {
    return NextResponse.json({ error: "Missing file or docKey" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${docKey}_${Date.now()}.${fileExt}`;
  const fileBuffer = await file.arrayBuffer();

  const { error: storageError } = await supabaseServer.storage
    .from("kya-documents")
    .upload(fileName, fileBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { data: urlData } = supabaseServer.storage
    .from("kya-documents")
    .getPublicUrl(fileName);

  if (existingDocId && existingDocId !== "null") {
    await supabaseServer
      .from("documents")
      .update({
        file_url: urlData.publicUrl,
        file_name: file.name,
        verification_status: "pending",
        status: "pending",
        rejection_reason: null,
        uploaded_at: new Date().toISOString(),
        version,
      })
      .eq("id", existingDocId);
  } else {
    await supabaseServer
      .from("documents")
      .insert({
        user_id: userId,
        document_type: docKey,
        entity_type: accountType === "personal" ? "kyc" : "kyb",
        account_type: accountType,
        file_url: urlData.publicUrl,
        file_name: file.name,
        verification_status: "pending",
        status: "pending",
        version: 1,
      });
  }

  return NextResponse.json({ success: true, fileUrl: urlData.publicUrl });
}