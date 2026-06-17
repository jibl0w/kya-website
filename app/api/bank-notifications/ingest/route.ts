import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  verifyNotificationSignature,
  computeNotificationPayloadHash,
} from "@/lib/payment-instruction";

// Inbound endpoint for authenticated notifications from Source / AD / ROECNY.
// NOTE: this is a machine-to-machine endpoint (no Clerk user). Authentication
// is via the signature on the notification, NOT a logged-in session. Banks/AD
// never log into KYA. For now signature verification is mock (shared secret);
// real public-key verification slots in at integration.

const VALID_TYPES = [
  "ad_fx_authorised",
  "source_payment_executed",
  "ad_payment_received",
  "ad_fx_released_to_roecny",
  "roecny_usd_received",
  "roecny_supplier_paid",
];
const VALID_PARTIES = ["source_mfb", "ad", "roecny"];

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { fromParty, notificationType, transactionId, instructionId, payload, signature } = body;

  // --- Validate shape ---
  if (!fromParty || !notificationType || !transactionId || !signature) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!VALID_PARTIES.includes(fromParty)) {
    return NextResponse.json({ error: "Unknown party." }, { status: 400 });
  }
  if (!VALID_TYPES.includes(notificationType)) {
    return NextResponse.json({ error: "Unknown notification type." }, { status: 400 });
  }

  // --- Verify the signature (anti-spoof) ---
  const payloadHash = computeNotificationPayloadHash(payload);
  const signatureValid = verifyNotificationSignature({
    fromParty,
    notificationType,
    transactionId,
    instructionId: instructionId || null,
    payloadHash,
    signature,
  });

  // Record the notification regardless (with its verification result) for audit.
  const { data: notif, error: notifErr } = await supabaseServer
    .from("bank_notifications")
    .insert({
      notification_type: notificationType,
      from_party: fromParty,
      transaction_id: transactionId,
      payload: payload || {},
      signature_verified: signatureValid,
      ingested_note: signatureValid ? "verified" : "SIGNATURE FAILED — not actioned",
    })
    .select()
    .single();

  if (notifErr) {
    return NextResponse.json({ error: notifErr.message }, { status: 500 });
  }

  // If the signature is invalid, record but DO NOT act on it.
  if (!signatureValid) {
    return NextResponse.json(
      { received: true, actioned: false, reason: "Signature verification failed." },
      { status: 202 }
    );
  }

  // --- Act on the notification (ROECNY leg for now) ---
  let actioned = false;

  if (notificationType === "roecny_supplier_paid" && instructionId) {
    // ROECNY confirms it paid the supplier. Record a bank confirmation and
    // move the instruction toward reconciliation.
    const { data: instruction } = await supabaseServer
      .from("payment_instructions")
      .select("id, instruction_id, status")
      .eq("instruction_id", instructionId)
      .maybeSingle();

    if (instruction && ["transmitted", "acknowledged", "executed", "confirmation_pending"].includes(instruction.status)) {
      // Insert the bank-notification confirmation (one of the two reconciliation sources).
      await supabaseServer.from("payment_confirmations").insert({
        instruction_id: instructionId,
        source: "bank_notification",
        bank: "roecny",
        confirmation_reference: payload?.reference || null,
        signature_verified: true,
        reconciliation_status: "pending",
      });

      // Advance instruction: executed -> confirmation_pending (awaiting reconciliation).
      await supabaseServer
        .from("payment_instructions")
        .update({ status: "confirmation_pending" })
        .eq("id", instruction.id);

      actioned = true;
    }
  }

  // (Other ROECNY-relevant types like roecny_usd_received will gate the
  //  customer's ability to initiate the supplier payment — wired with the
  //  stage-gating later.)

  return NextResponse.json({ received: true, actioned, notificationId: notif.id });
}