import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  generateInstructionId,
  computeInstructionHash,
} from "@/lib/payment-instruction";
import { recordLedgerEvent } from "@/lib/settlement-ledger";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { transactionId, amount } = await req.json();

  if (!transactionId || !amount) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 });
  }

  // Load the transaction; confirm ownership.
  const { data: transaction } = await supabaseServer
    .from("transactions")
    .select("id, user_id, transaction_ref, lc_number, form_m_number, source_leg_status, ad_nominated_name, ad_nominated_account, ad_nominated_bank, ad_fx_reference")
    .eq("id", transactionId)
    .maybeSingle();

  if (!transaction) return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  if (transaction.user_id !== userId) {
    return NextResponse.json({ error: "You are not authorised to act on this transaction." }, { status: 403 });
  }

  // GATE: the Source payment can only be initiated AFTER the AD has authorised
  // the FX and nominated the account. The nominated account must be frozen.
  if (!transaction.ad_nominated_account || !transaction.ad_nominated_name) {
    return NextResponse.json(
      { error: "The authorised destination account is not yet available. The Source payment can only be made after the AD authorises the FX." },
      { status: 400 }
    );
  }
  if (!["fx_authorised"].includes(transaction.source_leg_status)) {
    // Already initiated or further along — block duplicate initiation.
    if (transaction.source_leg_status === "awaiting_ad_authorisation") {
      return NextResponse.json({ error: "FX has not been authorised yet." }, { status: 400 });
    }
    return NextResponse.json({ error: "A Source payment has already been initiated for this transaction." }, { status: 409 });
  }

  // Prevent duplicate active Source instructions.
  const { data: existingList } = await supabaseServer
    .from("payment_instructions")
    .select("id, status")
    .eq("transaction_id", transactionId)
    .eq("leg", "source_ngn");

  const activeExisting = (existingList || []).find(
    (pi) => !["rejected", "failed", "expired"].includes(pi.status)
  );
  if (activeExisting) {
    return NextResponse.json({ error: "An active Source payment instruction already exists." }, { status: 409 });
  }

  // Build the frozen instruction — beneficiary = the AD-nominated account.
  const instructionId = generateInstructionId();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const instructionHash = computeInstructionHash({
    instructionId,
    transactionId,
    leg: "source_ngn",
    beneficiaryAccount: transaction.ad_nominated_account,
    amount,
    currency: "NGN",
    lcReference: transaction.lc_number || null,
  });

  const { data: instruction, error } = await supabaseServer
    .from("payment_instructions")
    .insert({
      instruction_id: instructionId,
      transaction_id: transactionId,
      user_id: userId,
      leg: "source_ngn",
      beneficiary_type: "ad_nominated_account",
      beneficiary_name: transaction.ad_nominated_name,
      beneficiary_account: transaction.ad_nominated_account,
      beneficiary_bank: transaction.ad_nominated_bank,
      beneficiary_frozen_at: new Date().toISOString(),
      amount,
      currency: "NGN",
      lc_reference: transaction.lc_number || null,
      form_m_reference: transaction.form_m_number || null,
      status: "otp_pending",
      instruction_hash: instructionHash,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark the transaction's Source leg as payment_initiated.
  await supabaseServer
    .from("transactions")
    .update({ source_leg_status: "payment_initiated" })
    .eq("id", transactionId);

  await recordLedgerEvent({
    transactionId,
    instructionId: instruction.instruction_id,
    leg: "source_ngn",
    eventType: "instruction_created",
    amount,
    currency: "NGN",
    detail: { beneficiaryName: transaction.ad_nominated_name, fxReference: transaction.ad_fx_reference },
  });

  return NextResponse.json({
    success: true,
    instructionId: instruction.instruction_id,
    beneficiary: {
      name: transaction.ad_nominated_name,
      bank: transaction.ad_nominated_bank,
      accountMasked: "••••" + String(transaction.ad_nominated_account).slice(-4),
    },
    amount,
    currency: "NGN",
    expiresAt,
  });
}