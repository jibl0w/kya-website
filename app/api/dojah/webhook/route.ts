import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Dojah KYC widget webhook.
// SECURITY MODEL: we do NOT trust the webhook body. The webhook only tells us
// "a verification with this reference_id changed." We then call Dojah's API
// (authenticated with our secret) to fetch the AUTHORITATIVE result, and write
// that. Even a spoofed webhook can't fake a result, because we independently
// confirm with Dojah. This is Dojah's own recommended pattern.

const DOJAH_BASE = process.env.DOJAH_BASE_URL || "https://sandbox.dojah.io";

export async function POST(req: Request) {
  const rawBody = await req.text();

  let payload: any = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Extract reference_id and our metadata.user_id from the webhook (untrusted).
  const data = payload.data || payload;
  const referenceId =
    payload.reference_id || data.reference_id || payload.referenceId || null;
  const metadata = payload.metadata || data.metadata || {};
  const userId = metadata.user_id || null;

  if (!referenceId) {
    return NextResponse.json({ received: true, actioned: false, reason: "No reference_id" }, { status: 202 });
  }
  if (!userId) {
    return NextResponse.json({ received: true, actioned: false, reason: "No user_id in metadata" }, { status: 202 });
  }

  // --- Fetch the AUTHORITATIVE result from Dojah (this is the trust anchor) ---
  let verification: any = null;
  try {
    const res = await fetch(
      DOJAH_BASE + "/api/v1/kyc/verification?reference_id=" + encodeURIComponent(referenceId),
      {
        method: "GET",
        headers: {
          "AppId": process.env.DOJAH_APP_ID || "",
          "Authorization": process.env.DOJAH_PRIVATE_KEY || "",
          "Content-Type": "application/json",
        },
      }
    );
    verification = await res.json();
    if (!res.ok) {
      console.error("Dojah verification fetch failed:", res.status, JSON.stringify(verification).slice(0, 300));
      return NextResponse.json({ received: true, actioned: false, reason: "Dojah fetch failed" }, { status: 202 });
    }
  } catch (e) {
    console.error("Dojah verification fetch error:", e);
    return NextResponse.json({ received: true, actioned: false, reason: "Fetch error" }, { status: 202 });
  }

  // --- Parse the authoritative result ---
  const vStatus = (verification.verification_status || "").toLowerCase();
  const vData = verification.data || {};
  const selfieUrl = verification.selfie_url || vData?.selfie?.data?.selfie_url || null;
  const govData = vData?.government_data?.data || {};
  const bvnEntity = govData?.bvn?.entity || null;
  const ninEntity = govData?.nin?.entity || null;
  const amlTriggered = verification.aml?.status === true;

  // Map Dojah status -> our kyc_status.
  let kycStatus = "pending";
  if (vStatus === "completed") kycStatus = "approved";
  else if (vStatus === "failed") kycStatus = "rejected";
  else if (vStatus === "ongoing" || vStatus === "pending") kycStatus = "pending";
  else if (vStatus === "abandoned") kycStatus = "pending";

  const bvnName = bvnEntity
    ? [bvnEntity.first_name, bvnEntity.middle_name, bvnEntity.last_name].filter(Boolean).join(" ")
    : null;
  const ninName = ninEntity
    ? [ninEntity.firstname, ninEntity.middlename, ninEntity.surname].filter(Boolean).join(" ")
    : null;

  // --- Write the server-confirmed result to the KYC profile ---
  const { error } = await supabaseServer
    .from("kyc_profiles")
    .update({
      kyc_status: kycStatus,
      verification_provider: "dojah",
      provider_reference_id: referenceId,
      verification_reference: referenceId,
      verification_completed_at: new Date().toISOString(),
      provider_raw_response: verification,
      liveness_status: selfieUrl ? "completed" : null,
      selfie_url: selfieUrl,
      bvn_verification_status: bvnEntity ? "verified" : null,
      bvn_verified_name: bvnName,
      nin_verification_status: ninEntity ? "verified" : null,
      nin_verified_name: ninName,
      aml_status: amlTriggered ? "screened" : null,
      aml_screened_at: amlTriggered ? new Date().toISOString() : null,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Dojah webhook: DB update failed:", error.message);
    return NextResponse.json({ received: true, actioned: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, actioned: true, status: kycStatus });
}