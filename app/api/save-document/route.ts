import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  notifyCustomerDocumentUploaded,
  notifyAdminDocumentUploaded,
} from "@/lib/notifications";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const docKey = formData.get("docKey") as string;
  const accountType = formData.get("accountType") as string;
  const version = parseInt(formData.get("version") as string) || 1;
  const existingDocId = formData.get("existingDocId") as string | null;

  if (!file || !docKey) {
    return NextResponse.json({ error: "Missing file or document type" }, { status: 400 });
  }

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = userId + "/" + docKey + "_" + Date.now() + "." + fileExt;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: storageError } = await supabaseServer.storage
      .from("kya-documents")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (storageError) throw new Error(storageError.message);

    // Store the file PATH (not a public URL). Signed URLs are generated on-demand at display time.
    const fileUrl = fileName;

    if (existingDocId) {
      const { error } = await supabaseServer
        .from("documents")
        .update({
          file_url: fileUrl,
          file_name: file.name,
          status: "pending",
          verification_status: "pending",
          rejection_reason: null,
          uploaded_at: new Date().toISOString(),
          version,
        })
        .eq("id", existingDocId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseServer
        .from("documents")
        .insert({
          user_id: userId,
          document_type: docKey,
          file_url: fileUrl,
          file_name: file.name,
          account_type: accountType,
          status: "pending",
          verification_status: "pending",
          uploaded_at: new Date().toISOString(),
          version,
        });
      if (error) throw new Error(error.message);
    }

    try {
      const clerkRes = await fetch(
        "https://api.clerk.com/v1/users/" + userId,
        { headers: { Authorization: "Bearer " + process.env.CLERK_SECRET_KEY } }
      );
      const clerkUser = await clerkRes.json();
      const customerEmail = clerkUser.email_addresses?.[0]?.email_address;
      const customerName = ((clerkUser.first_name || "") + " " + (clerkUser.last_name || "")).trim() || "Customer";

      if (customerEmail) {
        await notifyCustomerDocumentUploaded({
          customerEmail,
          customerName,
          documentType: docKey,
        });
      }

      await notifyAdminDocumentUploaded({
        customerName,
        documentType: docKey,
        accountType,
      });
    } catch (err) {
      console.error("Notification error:", err);
    }

    return NextResponse.json({ success: true, fileUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("Upload error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}