import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const eddRequestId = formData.get("eddRequestId") as string;
  const documentType = formData.get("documentType") as string;

  if (!file || !eddRequestId || !documentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify the EDD request belongs to this user
  const { data: eddRequest } = await supabaseServer
    .from("edd_requests")
    .select("id, status, user_id")
    .eq("id", eddRequestId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!eddRequest) {
    return NextResponse.json({ error: "EDD request not found" }, { status: 404 });
  }

  if (!["pending", "in_progress"].includes(eddRequest.status)) {
    return NextResponse.json({ error: "This EDD request is no longer accepting documents" }, { status: 400 });
  }

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = "edd/" + userId + "/" + eddRequestId + "_" + documentType.replace(/\s+/g, "_") + "_" + Date.now() + "." + fileExt;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: storageError } = await supabaseServer.storage
      .from("kya-documents")
      .upload(fileName, buffer, { contentType: file.type, upsert: true });

    if (storageError) throw new Error(storageError.message);

    const { data: urlData } = supabaseServer.storage
      .from("kya-documents")
      .getPublicUrl(fileName);

    const fileUrl = urlData.publicUrl;

    // Check if document already exists for this request and type
    const { data: existing } = await supabaseServer
      .from("edd_documents")
      .select("id")
      .eq("edd_request_id", eddRequestId)
      .eq("document_type", documentType)
      .eq("user_id", userId)
      .maybeSingle();

    let docId: string;

    if (existing) {
      const { data, error } = await supabaseServer
        .from("edd_documents")
        .update({
          file_url: fileUrl,
          file_name: file.name,
          status: "pending",
          rejection_reason: null,
          uploaded_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      docId = data.id;
    } else {
      const { data, error } = await supabaseServer
        .from("edd_documents")
        .insert({
          edd_request_id: eddRequestId,
          user_id: userId,
          document_type: documentType,
          file_url: fileUrl,
          file_name: file.name,
          status: "pending",
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      docId = data.id;
    }

    // Update EDD request status to in_progress
    await supabaseServer
      .from("edd_requests")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", eddRequestId)
      .eq("status", "pending");

    // Notify admin
    try {
      const clerkRes = await fetch(
        "https://api.clerk.com/v1/users/" + userId,
        { headers: { Authorization: "Bearer " + process.env.CLERK_SECRET_KEY } }
      );
      const clerkUser = await clerkRes.json();
      const customerName = ((clerkUser.first_name || "") + " " + (clerkUser.last_name || "")).trim() || "Customer";

      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "info@kya.com.ng",
        to: process.env.ADMIN_EMAIL || "",
        subject: "KYA Staff — EDD Document Uploaded",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#080C14;color:#E8E0D0;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1A2540,#0D1420);padding:36px 40px;border-bottom:2px solid #C9A84C;">
              <h1 style="margin:0;font-size:28px;font-weight:900;color:#E8E0D0;font-family:Georgia,serif;">KY<span style="color:#C9A84C;">A</span></h1>
              <p style="margin:4px 0 0;font-size:11px;color:#4A5568;text-transform:uppercase;letter-spacing:0.15em;">EDD Document Uploaded</p>
            </div>
            <div style="padding:40px;">
              <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">A customer has uploaded an EDD document for review.</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;margin:20px 0;border:1px solid rgba(255,255,255,0.06);">
                <tr><td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;color:#4A5568;width:160px;font-weight:700;text-transform:uppercase;background:#080C14;">Customer</td><td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;color:#E8E0D0;background:#080C14;">${customerName}</td></tr>
                <tr><td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;color:#4A5568;font-weight:700;text-transform:uppercase;background:#080C14;">Document</td><td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;color:#C9A84C;background:#080C14;">${documentType}</td></tr>
              </table>
              <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr><td style="background:#C9A84C;border-radius:8px;"><a href="https://staff.kya.ng/customers" style="display:inline-block;background:#C9A84C;color:#080C14;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;text-transform:uppercase;">Review EDD &rarr;</a></td></tr>
              </table>
            </div>
            <div style="background:linear-gradient(135deg,#0D1420,#080C14);padding:28px 40px;border-top:1px solid rgba(201,168,76,0.2);">
              <p style="margin:0;font-size:11px;color:#4A5568;">KYA Digital Services Ltd &middot; CBN AML 2025 Compliance</p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("Notification error:", err);
    }

    return NextResponse.json({ success: true, id: docId, fileUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("EDD upload error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}