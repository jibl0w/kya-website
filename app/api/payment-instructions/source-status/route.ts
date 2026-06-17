import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { transactionId } = await req.json();
  if (!transactionId) return NextResponse.json({ error: "Missing transaction." }, { status: 400 });

  // Transaction's source-leg state + frozen AD account.
  const { data: txn } = await supabaseServer
    .from("transactions")
    .select("id, user_id, source_leg_status, ad_nominated_name, ad_nominated_bank, ad_nominated_account, ad_fx_amount_ngn, ad_fx_reference")
    .eq("id", transactionId)
    .maybeSingle();

  if (!txn) return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  if (txn.user_id !== userId) return NextResponse.json({ error: "Not authorised." }, { status: 403 });

  // Any Source-leg instruction for this transaction.
  const { data: instructions } = await supabaseServer
    .from("payment_instructions")
    .select("instruction_id, status, amount, currency, beneficiary_name, beneficiary_bank, beneficiary_account, created_at")
    .eq("transaction_id", transactionId)
    .eq("user_id", userId)
    .eq("leg", "source_ngn")
    .order("created_at", { ascending: false });

  const active = (instructions || []).find(
    (pi) => !["rejected", "failed", "expired"].includes(pi.status)
  );

  let confirmation = { hasBank: false, hasCustomer: false };
  if (active) {
    const { data: confs } = await supabaseServer
      .from("payment_confirmations")
      .select("source")
      .eq("instruction_id", active.instruction_id);
    confirmation = {
      hasBank: (confs || []).some((c) => c.source === "bank_notification"),
      hasCustomer: (confs || []).some((c) => c.source === "customer_upload"),
    };
  }

  return NextResponse.json({
    sourceLegStatus: txn.source_leg_status,
    fxAuthorised: !!txn.ad_nominated_account,
    adNominated: txn.ad_nominated_account
      ? {
          name: txn.ad_nominated_name,
          bank: txn.ad_nominated_bank,
          accountMasked: "••••" + String(txn.ad_nominated_account).slice(-4),
          amountNgn: txn.ad_fx_amount_ngn,
          fxReference: txn.ad_fx_reference,
        }
      : null,
    instruction: active
      ? {
          instructionId: active.instruction_id,
          status: active.status,
          amount: active.amount,
          currency: active.currency,
          beneficiaryName: active.beneficiary_name,
          beneficiaryBank: active.beneficiary_bank,
          beneficiaryAccountMasked: active.beneficiary_account
            ? "••••" + String(active.beneficiary_account).slice(-4)
            : null,
          hasBankConfirmation: confirmation.hasBank,
          hasCustomerConfirmation: confirmation.hasCustomer,
        }
      : null,
  });
}