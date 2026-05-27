import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  notifyCustomerDocumentApproved,
  notifyCustomerDocumentRejected,
  notifyCustomerAccountVerified,
} from "@/lib/notifications";

const ADMIN_IDS = process.env.ADMIN_USER_IDS?.split(",") || [];

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId || !ADMIN_IDS.includes(userId)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { documentId, action, rejectionReason } = await req.json();
  if (!documentId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: doc } = await supabaseServer
    .from("documents")
    .select("user_id, document_type, account_type")
    .eq("id", documentId)
    .single();

  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const newStatus = action === "approve" ? "approved" : "rejected";

  const { error } = await supabaseServer
    .from("documents")
    .update({
      status: newStatus,
      verification_status: newStatus,
      rejection_reason: action === "reject" ? rejectionReason : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
    })
    .eq("id", documentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get customer email and name from Clerk
  try {
    const clerkRes = await fetch(
      "https://api.clerk.com/v1/users/" + doc.user_id,
      { headers: { Authorization: "Bearer " + process.env.CLERK_SECRET_KEY } }
    );
    const clerkUser = await clerkRes.json();
    const customerEmail = clerkUser.email_addresses?.[0]?.email_address;
    const customerName = (clerkUser.first_name || "") + " " + (clerkUser.last_name || "");

    if (customerEmail) {
      if (action === "approve") {
        await notifyCustomerDocumentApproved({
          customerEmail,
          customerName: customerName.trim() || "Customer",
          documentType: doc.document_type,
        });

        // Check if all documents are now approved
        const { data: allDocs } = await supabaseServer
          .from("documents")
          .select("status")
          .eq("user_id", doc.user_id);

        const required = doc.account_type === "personal" ? 5 : 5;
        const approved = (allDocs || []).filter(d => d.status === "approved").length;

        if (approved >= required) {
          await notifyCustomerAccountVerified({
            customerEmail,
            customerName: customerName.trim() || "Customer",
          });
        }
      }

      if (action === "reject") {
        await notifyCustomerDocumentRejected({
          customerEmail,
          customerName: customerName.trim() || "Customer",
          documentType: doc.document_type,
          rejectionReason: rejectionReason || "Document did not meet requirements",
        });
      }
    }
  } catch (err) {
    console.error("Notification error:", err);
  }

  return NextResponse.json({ success: true });
}