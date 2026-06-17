import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { signInstruction } from "@/lib/payment-instruction";
import { recordLedgerEvent } from "@/lib/settlement-ledger";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { instructionId } = await req.json();
  if (!instructionId) return NextResponse.json({ error: "Missing instruction." }, { status: 400 });

  const { data: instruction } = await supabaseServer
    .from("payment_instructions")
    .select("id, instruction_id, user_id, status, instruction_hash, otp_attestation_hash, expires_at, transaction_id, leg, amount, currency, beneficiary_name, beneficiary_account, beneficiary_bank")
    .eq("instruction_id", instructionId)
    .maybeSingle();

  if (!instruction) return NextResponse.json({ error: "Instruction not found." }, { status: 404 });
  if (instruction.user_id !== userId) return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  if (instruction.status !== "otp_verified") {
    return NextResponse.json({ error: "This instruction must be authorised before it can be sent." }, { status: 400 });
  }
  if (new Date(instruction.expires_at) < new Date()) {
    return NextResponse.json({ error: "This instruction has expired. Please start again." }, { status: 400 });
  }

  // --- Sign (mock key) ---
  const signature = signInstruction({
    instructionId: instruction.instruction_id,
    instructionHash: instruction.instruction_hash || "",
    otpAttestationHash: instruction.otp_attestation_hash || "",
  });

  const { error: signErr } = await supabaseServer
    .from("payment_instructions")
    .update({ status: "signed", signature })
    .eq("id", instruction.id);

  if (signErr) return NextResponse.json({ error: signErr.message }, { status: 500 });

  await recordLedgerEvent({
    transactionId: instruction.transaction_id,
    instructionId: instruction.instruction_id,
    leg: instruction.leg,
    eventType: "signed",
    evidenceRef: signature.slice(0, 16),
  });

  // --- Mock transmission ---
  const transmittedAt = new Date().toISOString();

  const { error: txErr } = await supabaseServer
    .from("payment_instructions")
    .update({ status: "transmitted", transmitted_at: transmittedAt })
    .eq("id", instruction.id);

  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });

  await recordLedgerEvent({
    transactionId: instruction.transaction_id,
    instructionId: instruction.instruction_id,
    leg: instruction.leg,
    eventType: "transmitted",
    amount: instruction.amount,
    currency: instruction.currency,
  });

  return NextResponse.json({
    success: true,
    status: "transmitted",
    signature: signature.slice(0, 16) + "…",
    transmittedAt,
  });
}