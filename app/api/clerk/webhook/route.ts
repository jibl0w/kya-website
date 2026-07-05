import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";
import { notifyAdminAccountDeleted } from "@/lib/notifications";

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Get the raw body and Svix headers for signature verification.
  const payload = await request.text();
  const headerList = await headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // Verify the signature.
  let evt: any;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Handle user.deleted.
  if (evt.type === "user.deleted") {
    const userId = evt.data.id as string;

    // Fetch profiles to get customer details for the notification.
    const [{ data: kyc }, { data: kyb }] = await Promise.all([
      supabaseServer.from("kyc_profiles").select("first_name, last_name, email").eq("user_id", userId).maybeSingle(),
      supabaseServer.from("kyb_profiles").select("company_name, company_email").eq("user_id", userId).maybeSingle(),
    ]);

    const now = new Date().toISOString();

    // Soft-delete both profile types (records retained for AML; marked closed).
    await Promise.all([
      supabaseServer.from("kyc_profiles").update({ account_status: "deleted", deleted_at: now }).eq("user_id", userId),
      supabaseServer.from("kyb_profiles").update({ account_status: "deleted", deleted_at: now }).eq("user_id", userId),
    ]);

    // Notify staff.
    try {
      const customerName = kyc
        ? ((kyc.first_name || "") + " " + (kyc.last_name || "")).trim()
        : kyb?.company_name || "Unknown";
      const customerEmail = kyc?.email || kyb?.company_email || "Unknown";
      await notifyAdminAccountDeleted({ userId, customerName, customerEmail });
    } catch (err) {
      console.error("Account-deleted notification error:", err);
    }
  }

  return NextResponse.json({ received: true });
}