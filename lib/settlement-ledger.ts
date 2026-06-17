// ============================================================
// KYA Settlement Ledger — append-only event recorder.
// Record-keeping only; KYA never moves funds. Each call appends one
// immutable event to the transaction's money-journey timeline.
// ============================================================

import { supabaseServer } from "@/lib/supabase-server";

export type LedgerEventType =
  | "instruction_created"
  | "otp_verified"
  | "signed"
  | "transmitted"
  | "roecny_confirmed"
  | "customer_confirmed"
  | "reconciled"
  | "settled"
  | "rejected"
  | "failed";

export async function recordLedgerEvent(params: {
  transactionId: string;
  instructionId?: string | null;
  leg?: "source_ngn" | "roecny_usd" | null;
  eventType: LedgerEventType;
  amount?: number | null;
  currency?: string | null;
  evidenceRef?: string | null;
  detail?: Record<string, unknown> | null;
}) {
  try {
    await supabaseServer.from("settlement_ledger").insert({
      transaction_id: params.transactionId,
      instruction_id: params.instructionId || null,
      leg: params.leg || null,
      event_type: params.eventType,
      amount: params.amount ?? null,
      currency: params.currency || null,
      evidence_ref: params.evidenceRef || null,
      detail: params.detail || null,
    });
  } catch (err) {
    // Ledger writes must never break the main flow; log and continue.
    console.error("Ledger write failed:", params.eventType, err);
  }
}