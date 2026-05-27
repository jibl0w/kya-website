import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const entityType = type.startsWith("kyc")
      ? "kyc"
      : type.startsWith("kyb")
      ? "kyb"
      : "trade";

    const filePath = `${userId}/${entityType}/${type}/${Date.now()}-${file.name}`;

    // upload
    const { error: uploadError } = await supabaseServer.storage
      .from("kya-documents")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // delete old record
    await supabaseServer
      .from("documents")
      .delete()
      .eq("user_id", userId)
      .eq("document_type", type);

    // insert new
    const { error: dbError } = await supabaseServer.from("documents").insert({
      user_id: userId,
      document_type: type,
      entity_type: entityType,
      file_url: filePath,
      file_name: file.name,
      verification_status: "pending",
    });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE DOCUMENT
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("id");

    if (!userId || !docId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("documents")
      .delete()
      .eq("id", docId)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}