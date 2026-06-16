import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  getSupplierBeneficiary,
  tripleMirrorCheck,
  generateInstructionId,
  computeInstructionHash,
  type SettlementCurrency,
} from "@/lib/payment-instruction";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { transactionId, amount, currency } = await req.json();

  // --- Basic validation ---
  if (!transactionId || !amount || !currency) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (currency !== "USD" && currency !== "RMB") {
    return NextResponse.json({ error: "Settlement currency must be USD or RMB." }, { status: 400 });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 });
  }

  // --- Load the transaction and confirm ownership ---
  const { data: transaction } = await supabaseServer
    .from("transactions")
    .select("id, user_id, supplier_id, transaction_ref, total_value, lc_number")
    .eq("id", transactionId)
    .maybeSingle();

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }
  if (transaction.user_id !== userId) {
    return NextResponse.json({ error: "You are not authorised to act on this transaction." }, { status: 403 });
  }
  if (!transaction.supplier_id) {
    return NextResponse.json({ error: "This transaction is not bound to a verified supplier." }, { status: 400 });
  }

  // --- Load the supplier's CURRENT beneficiary record ---
  const { data: supplier } = await supabaseServer
    .from("suppliers")
    .select("id, supplier_name, verification_status, usd_beneficiary_name, usd_beneficiary_account, usd_beneficiary_bank, usd_beneficiary_swift, usd_details_status, rmb_beneficiary_name, rmb_beneficiary_account, rmb_beneficiary_bank, rmb_beneficiary_swift, rmb_details_status")
    .eq("id", transaction.supplier_id)
    .maybeSingle();

  if (!supplier || supplier.verification_status !== "verified") {
    return NextResponse.json({ error: "Supplier is not verified." }, { status: 400 });
  }

  // --- Get the supplier's beneficiary for the chosen currency ---
  const beneficiary = getSupplierBeneficiary(supplier, currency as SettlementCurrency);
  if (!beneficiary) {
    return NextResponse.json(
      { error: `Supplier has not provided ${currency} beneficiary details. Payment cannot proceed.` },
      { status: 400 }
    );
  }

  // --- Prevent duplicate active instructions for this transaction+leg ---
  const { data: existing } = await supabaseServer
    .from("payment_instructions")
    .select("id, status")
    .eq("transaction_id", transactionId)
    .eq("leg", "roecny_usd")
    .not("status", "in", "(rejected,failed,expired)")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "An active payment instruction already exists for this transaction." },
      { status: 409 }
    );
  }

  // --- Triple-mirror check ---
  // Supplier-match enforced now. LC-match deferred (no LC beneficiary captured yet),
  // so lcBeneficiary is omitted; the check records checkedLc=false.
  const mirror = tripleMirrorCheck({
    frozen: beneficiary,           // at creation, frozen == supplier-current; both validated again before transmission
    supplierCurrent: beneficiary,
    // lcBeneficiary: <to be wired when LC beneficiary capture exists>
  });

  if (!mirror.ok) {
    return NextResponse.json(
      { error: "Beneficiary validation failed: " + mirror.mismatches.join(" ") },
      { status: 400 }
    );
  }

  // --- Build the frozen instruction ---
  const instructionId = generateInstructionId();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-min validity window

  const instructionHash = computeInstructionHash({
    instructionId,
    transactionId,
    leg: "roecny_usd",
    beneficiaryAccount: beneficiary.account,
    amount,
    currency,
    lcReference: transaction.lc_number || null,
  });

  const { data: instruction, error } = await supabaseServer
    .from("payment_instructions")
    .insert({
      instruction_id: instructionId,
      transaction_id: transactionId,
      user_id: userId,
      leg: "roecny_usd",
      beneficiary_type: "lc_supplier",
      beneficiary_name: beneficiary.name,
      beneficiary_account: beneficiary.account,
      beneficiary_bank: beneficiary.bank,
      beneficiary_frozen_at: new Date().toISOString(),
      amount,
      currency,
      lc_reference: transaction.lc_number || null,
      status: "otp_pending",
      instruction_hash: instructionHash,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    instructionId: instruction.instruction_id,
    id: instruction.id,
    beneficiary: {
      // Return only what the customer should see — name and bank, NOT full account.
      name: beneficiary.name,
      bank: beneficiary.bank,
      currency: beneficiary.currency,
    },
    amount,
    currency,
    expiresAt,
    lcCheckPending: !mirror.checkedLc,
  });
}