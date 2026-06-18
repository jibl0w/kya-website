import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import crypto from "crypto";

// Dojah sends verification results here. Authentication is via the
// x-dojah-signature header = HMAC-SHA256(rawBody, DOJAH_PRIVATE_KEY).
// We verify before trusting anything. This is the SERVER-SIDE source of
// truth for KYC status — never the widget's client callback.

export async function POST(req: Request) {
  // Read the RAW body (required for HMAC — must match exact bytes Dojah signed).
  const rawBody = await req.text();

  // Verify signature.
  const signature = req.headers.get("x-dojah-signature") || "";
  const secret = process.env.DOJAH_PRIVATE_KEY || "";
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  let signatureValid = false;
  try {
    signatureValid =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    signatureValid = false;
  }

  // Parse the payload (even if signature failed, for logging).
  let payload: any = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!signatureValid) {
    console.error("Dojah webhook: signature verification FAILED");
    // Record nothing actionable; reject.
    return NextResponse.json({ received: true, actioned: false, reason: "Invalid signature" }, { status: 202 });
  }

  // --- Extract the key fields from Dojah's payload ---
  // The structure mirrors the widget success response. Dojah wraps verification
  // data; we read defensively since shape varies by flow.
  const data = payload.data || payload;
  const referenceId = payload.reference_id || data.reference_id || null;
  const verificationStatus = (payload.verification_status || data.verification_status || "").toLowerCase();
  const metadata = payload.metadata || data.metadata || {};
  const userId = metadata.user_id || null;

  // Pull individual check results (defensive — may be absent depending on flow).
  const selfieUrl = payload.selfie_url || data?.selfie?.data?.selfie_url || null;
  const govData = data?.government_data?.data || {};
  const bvnEntity = govData?.bvn?.entity || null;
  const ninEntity = govData?.nin?.entity || null;
  const amlStatus = payload.aml?.status === true ? "hit" : (payload.aml ? "clear" : null);

  // Map Dojah status -> our kyc_status.
  // Completed = passed all checks; Failed = completed but failed; Pending/Ongoing = review.
  let kycStatus = "pending";
  if (verificationStatus === "completed") kycStatus = "approved";
  else if (verificationStatus === "failed") kycStatus = "rejected";
  else if (verificationStatus === "pending" || verificationStatus === "ongoing") kycStatus = "pending";
  else if (verificationStatus === "abandoned") kycStatus = "pending";

  if (!userId) {
    // Can't match to a customer without our metadata user_id. Record + stop.
    console.error("Dojah webhook: no metadata.user_id; reference:", referenceId);
    return NextResponse.json({ received: true, actioned: false, reason: "No user_id in metadata" }, { status: 202 });
  }

  // --- Update the customer's KYC profile (server-confirmed source of truth) ---
  const { error } = await supabaseServer
    .from("kyc_profiles")
    .update({
      kyc_status: kycStatus,
      verification_provider: "dojah",
      provider_reference_id: referenceId,
      verification_reference: referenceId,
      verification_completed_at: new Date().toISOString(),
      provider_raw_response: payload,
      liveness_status: selfieUrl ? "completed" : null,
      selfie_url: selfieUrl,
      bvn_verification_status: bvnEntity ? "verified" : null,
      bvn_verified_name: bvnEntity ? [bvnEntity.first_name, bvnEntity.last_name].filter(Boolean).join(" ") : null,
      nin_verification_status: ninEntity ? "verified" : null,
      aml_status: amlStatus,
      aml_screened_at: amlStatus ? new Date().toISOString() : null,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Dojah webhook: DB update failed:", error.message);
    return NextResponse.json({ received: true, actioned: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, actioned: true, status: kycStatus });
}