import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Dojah KYC/KYB widget webhook.
// SECURITY MODEL: we do NOT trust the webhook body. The webhook tells us a
// verification changed; we then call Dojah's API (authenticated) to fetch the
// AUTHORITATIVE result and write that. metadata.profile_type routes to the
// right table (kyc_profiles vs kyb_profiles).
//
// EVIDENCE PERSISTENCE: Dojah's image URLs (selfie, ID) expire in ~1 hour.
// For the durable due-diligence record (relied on by ROECNY/Source), we
// download the image at webhook time and re-host it in our private
// kya-documents bucket, storing the permanent storage PATH (not Dojah's URL).
// The bucket is private; views are served via short-lived signed URLs.

const DOJAH_BASE = process.env.DOJAH_BASE_URL || "https://sandbox.dojah.io";
const EVIDENCE_BUCKET = "kya-documents";

// Download an image from an (expiring) Dojah URL and re-host in our bucket.
// Returns the permanent storage path, or null on any failure (never throws —
// evidence re-hosting must not break the status update).
async function rehostImage(sourceUrl: string, storagePath: string): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      console.error("rehostImage: fetch failed", res.status, storagePath);
      return null;
    }
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuf = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);

    const { error } = await supabaseServer.storage
      .from(EVIDENCE_BUCKET)
      .upload(storagePath, bytes, { contentType, upsert: true });

    if (error) {
      console.error("rehostImage: upload failed", error.message, storagePath);
      return null;
    }
    return storagePath;
  } catch (e) {
    console.error("rehostImage: error", e);
    return null;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  let payload: any = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const data = payload.data || payload;
  const referenceId =
    payload.reference_id || data.reference_id || payload.referenceId || null;
  const metadata = payload.metadata || data.metadata || {};
  const userId = metadata.user_id || null;
  const profileType = (metadata.profile_type || "kyc").toLowerCase(); // "kyc" | "kyb"

  if (!referenceId) {
    return NextResponse.json({ received: true, actioned: false, reason: "No reference_id" }, { status: 202 });
  }
  if (!userId) {
    return NextResponse.json({ received: true, actioned: false, reason: "No user_id in metadata" }, { status: 202 });
  }

  // --- Fetch the AUTHORITATIVE result from Dojah ---
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

  /// --- Parse common fields ---
  // The live verification API wraps the result in an `entity` object;
  // sandbox sometimes returns it flat. Handle both.
  const entity = verification.entity || verification;
  const vStatus = (entity.verification_status || "").toLowerCase();
  const vData = entity.data || {};
  const dojahSelfieUrl = entity.selfie_url || vData?.selfie?.data?.selfie_url || null;
  const amlTriggered = entity.aml?.status === true;

  let mappedStatus = "pending";
  if (vStatus === "completed") mappedStatus = "approved";
  else if (vStatus === "failed") mappedStatus = "rejected";
  else if (vStatus === "ongoing" || vStatus === "pending") mappedStatus = "pending";
  else if (vStatus === "abandoned") mappedStatus = "pending";

  // --- Re-host the selfie to durable private storage (if present) ---
  let selfieStoragePath: string | null = null;
  if (dojahSelfieUrl) {
    selfieStoragePath = await rehostImage(
      dojahSelfieUrl,
      `verifications/${userId}/${referenceId}-selfie.jpg`
    );
  }

  // ========================= KYB BRANCH =========================
  if (profileType === "kyb") {
    const bizData = vData?.business_data || {};
    const bizId = vData?.business_id || {};
    const cacName = bizData.business_name || bizId.business_name || null;
    const cacNumber = bizData.business_number || bizId.business_number || null;

    const { error } = await supabaseServer
      .from("kyb_profiles")
      .update({
        kyb_status: mappedStatus,
        verification_provider: "dojah",
        provider_reference_id: referenceId,
        verification_reference: referenceId,
        verification_completed_at: new Date().toISOString(),
        provider_raw_response: verification,
        liveness_status: selfieStoragePath ? "completed" : null,
        selfie_url: selfieStoragePath,
        cac_verification_status: (cacName || cacNumber) ? "verified" : null,
        cac_verified_name: cacName,
        cac_verified_at: (cacName || cacNumber) ? new Date().toISOString() : null,
        aml_status: amlTriggered ? "screened" : null,
        aml_screened_at: amlTriggered ? new Date().toISOString() : null,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Dojah webhook KYB: DB update failed:", error.message);
      return NextResponse.json({ received: true, actioned: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ received: true, actioned: true, type: "kyb", status: mappedStatus });
  }

  // ========================= KYC BRANCH =========================
  const govData = vData?.government_data?.data || {};
  const bvnEntity = govData?.bvn?.entity || null;
  const ninEntity = govData?.nin?.entity || null;

  const bvnName = bvnEntity
    ? [bvnEntity.first_name, bvnEntity.middle_name, bvnEntity.last_name].filter(Boolean).join(" ")
    : null;
  const ninName = ninEntity
    ? [ninEntity.firstname, ninEntity.middlename, ninEntity.surname].filter(Boolean).join(" ")
    : null;

  const { error } = await supabaseServer
    .from("kyc_profiles")
    .update({
      kyc_status: mappedStatus,
      verification_provider: "dojah",
      provider_reference_id: referenceId,
      verification_reference: referenceId,
      verification_completed_at: new Date().toISOString(),
      provider_raw_response: verification,
      liveness_status: selfieStoragePath ? "completed" : null,
      selfie_url: selfieStoragePath,
      bvn_verification_status: bvnEntity ? "verified" : null,
      bvn_verified_name: bvnName,
      nin_verification_status: ninEntity ? "verified" : null,
      nin_verified_name: ninName,
      aml_status: amlTriggered ? "screened" : null,
      aml_screened_at: amlTriggered ? new Date().toISOString() : null,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Dojah webhook KYC: DB update failed:", error.message);
    return NextResponse.json({ received: true, actioned: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ received: true, actioned: true, type: "kyc", status: mappedStatus });
}