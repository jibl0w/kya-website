import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import crypto from "crypto";
import { computeNotificationPayloadHash } from "@/lib/payment-instruction";

// DEV-ONLY: simulates a bank/AD sending an authenticated notification to KYA.
// Generates a correctly-signed notification (mock secret) and ingests it,
// exactly as the real party would. Guarded so it cannot run in production.

function signNotification(parts: {
  fromParty: string;
  notificationType: string;
  transactionId: string;
  instructionId: string | null;
  payloadHash: string;
}): string {
  const secret =
    process.env["NOTIF_SECRET_" + parts.fromParty.toUpperCase()] ||
    process.env.NOTIF_SECRET_DEFAULT ||
    "dev-mock-notif-secret";
  const material = [
    parts.fromParty,
    parts.notificationType,
    parts.transactionId,
    parts.instructionId || "",
    parts.payloadHash,
  ].join("::");
  return crypto.createHmac("sha256", secret).update(material).digest("hex");
}

export async function POST(req: Request) {
  // Block in production environments.
  if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production." }, { status: 403 });
  }

  // Require a logged-in user (so randoms can't trigger mock notifications on dev).
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { notificationType, transactionId, instructionId, payload } = await req.json();

  if (!notificationType || !transactionId) {
    return NextResponse.json({ error: "Missing notificationType or transactionId." }, { status: 400 });
  }

  // Determine the from-party for this notification type.
  const partyForType: Record<string, string> = {
    ad_fx_authorised: "ad",
    source_payment_executed: "source_mfb",
    ad_payment_received: "ad",
    ad_fx_released_to_roecny: "ad",
    roecny_usd_received: "roecny",
    roecny_supplier_paid: "roecny",
  };
  const fromParty = partyForType[notificationType];
  if (!fromParty) {
    return NextResponse.json({ error: "Unknown notification type." }, { status: 400 });
  }

  const finalPayload = payload || { reference: "MOCK-" + Date.now() };
  const payloadHash = computeNotificationPayloadHash(finalPayload);

  const signature = signNotification({
    fromParty,
    notificationType,
    transactionId,
    instructionId: instructionId || null,
    payloadHash,
  });

  // Post to the real ingest endpoint, exactly as the bank would.
  const origin = new URL(req.url).origin;
  const ingestRes = await fetch(origin + "/api/bank-notifications/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromParty,
      notificationType,
      transactionId,
      instructionId: instructionId || null,
      payload: finalPayload,
      signature,
    }),
  });

  const ingestData = await ingestRes.json();
  return NextResponse.json({ mockSent: true, ingestStatus: ingestRes.status, ingestResult: ingestData });
}