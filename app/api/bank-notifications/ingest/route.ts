import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  verifyNotificationSignature,
  computeNotificationPayloadHash,
} from "@/lib/payment-instruction";
import { recordLedgerEvent } from "@/lib/settlement-ledger";

// Inbound endpoint for authenticated notifications from Source / AD / ROECNY.
// Machine-to-machine: authentication is via signature, NOT a logged-in session.
// Banks/AD never log into KYA. Signature verification is mock (shared secret)
// for now; real public-key verification slots in at integration.

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

  let actioned = false;

  // ---- ROECNY: supplier paid (ROECNY leg confirmation) ----
  if (notificationType === "roecny_supplier_paid" && instructionId) {
    const { data: instruction } = await supabaseServer
      .from("payment_instructions")
      .select("id, instruction_id, status")
      .eq("instruction_id", instructionId)
      .maybeSingle();

    if (instruction && ["transmitted", "acknowledged", "executed", "confirmation_pending"].includes(instruction.status)) {
      await supabaseServer.from("payment_confirmations").insert({
        instruction_id: instructionId,
        source: "bank_notification",
        bank: "roecny",
        confirmation_reference: payload?.reference || null,
        signature_verified: true,
        reconciliation_status: "pending",
      });

      await supabaseServer
        .from("payment_instructions")
        .update({ status: "confirmation_pending" })
        .eq("id", instruction.id);

      await recordLedgerEvent({
        transactionId,
        instructionId,
        leg: "roecny_usd",
        eventType: "roecny_confirmed",
        evidenceRef: payload?.reference || notif.id,
      });

      actioned = true;
    }
  }

  // ---- AD: FX authorised (freezes the Source-leg nominated account) ----
  if (notificationType === "ad_fx_authorised") {
    const p = payload || {};
    if (!p.nominatedAccount || !p.nominatedName) {
      return NextResponse.json(
        { received: true, actioned: false, reason: "ad_fx_authorised missing nominated account details." },
        { status: 202 }
      );
    }

    await supabaseServer
      .from("transactions")
      .update({
        ad_nominated_name: p.nominatedName,
        ad_nominated_account: p.nominatedAccount,
        ad_nominated_bank: p.nominatedBank || null,
        ad_fx_authorised_at: new Date().toISOString(),
        ad_fx_amount_ngn: p.amountNgn || null,
        ad_fx_reference: p.fxReference || null,
        source_leg_status: "fx_authorised",
      })
      .eq("id", transactionId);

    await recordLedgerEvent({
      transactionId,
      leg: "source_ngn",
      eventType: "ad_fx_authorised",
      evidenceRef: p.fxReference || null,
      detail: { nominatedBank: p.nominatedBank || null },
    });

    actioned = true;
  }

  // ---- Source MFB: NGN payment executed (Source leg confirmation) ----
  if (notificationType === "source_payment_executed" && instructionId) {
    const { data: instruction } = await supabaseServer
      .from("payment_instructions")
      .select("id, instruction_id, status")
      .eq("instruction_id", instructionId)
      .maybeSingle();

    if (instruction && ["transmitted", "acknowledged", "executed", "confirmation_pending"].includes(instruction.status)) {
      await supabaseServer.from("payment_confirmations").insert({
        instruction_id: instructionId,
        source: "bank_notification",
        bank: "source_mfb",
        confirmation_reference: payload?.reference || null,
        signature_verified: true,
        reconciliation_status: "pending",
      });

      await supabaseServer
        .from("payment_instructions")
        .update({ status: "confirmation_pending" })
        .eq("id", instruction.id);

      await supabaseServer
        .from("transactions")
        .update({ source_leg_status: "payment_executed" })
        .eq("id", transactionId);

      await recordLedgerEvent({
        transactionId,
        instructionId,
        leg: "source_ngn",
        eventType: "source_payment_executed",
        evidenceRef: payload?.reference || notif.id,
      });

      actioned = true;
    }
  }

  // ---- AD: payment received ----
  if (notificationType === "ad_payment_received") {
    await supabaseServer
      .from("transactions")
      .update({ source_leg_status: "ad_confirmed" })
      .eq("id", transactionId);

    await recordLedgerEvent({
      transactionId,
      leg: "source_ngn",
      eventType: "ad_payment_received",
      evidenceRef: payload?.reference || notif.id,
    });
    actioned = true;
  }

  // ---- AD: FX released to ROECNY ----
  if (notificationType === "ad_fx_released_to_roecny") {
    await supabaseServer
      .from("transactions")
      .update({ source_leg_status: "fx_released" })
      .eq("id", transactionId);

    await recordLedgerEvent({
      transactionId,
      leg: "source_ngn",
      eventType: "ad_fx_released_to_roecny",
      evidenceRef: payload?.reference || notif.id,
    });
    actioned = true;
  }

  // ---- ROECNY: USD received (gates the ROECNY/supplier leg) ----
  if (notificationType === "roecny_usd_received") {
    await supabaseServer
      .from("transactions")
      .update({ source_leg_status: "usd_received" })
      .eq("id", transactionId);

    await recordLedgerEvent({
      transactionId,
      leg: "source_ngn",
      eventType: "roecny_usd_received",
      evidenceRef: payload?.reference || notif.id,
    });
    actioned = true;
  }

  return NextResponse.json({ received: true, actioned, notificationId: notif.id });
}