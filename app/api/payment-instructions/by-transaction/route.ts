import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { transactionId } = await req.json();
  if (!transactionId) return NextResponse.json({ error: "Missing transaction." }, { status: 400 });

  // Most recent non-cancelled instruction for this transaction's ROECNY leg.
  const { data: instructions } = await supabaseServer
    .from("payment_instructions")
    .select("instruction_id, leg, status, amount, currency, beneficiary_name, beneficiary_bank, created_at")
    .eq("transaction_id", transactionId)
    .eq("user_id", userId)
    .eq("leg", "roecny_usd")
    .order("created_at", { ascending: false });

  const active = (instructions || []).find(
    (pi) => !["rejected", "failed", "expired"].includes(pi.status)
  );

  if (!active) return NextResponse.json({ instruction: null });

  // Fetch confirmation status for reconciliation display.
  const { data: confirmations } = await supabaseServer
    .from("payment_confirmations")
    .select("source, reconciliation_status, received_at")
    .eq("instruction_id", active.instruction_id);

  const hasBank = (confirmations || []).some((c) => c.source === "bank_notification");
  const hasCustomer = (confirmations || []).some((c) => c.source === "customer_upload");

  return NextResponse.json({
    instruction: {
      instructionId: active.instruction_id,
      status: active.status,
      amount: active.amount,
      currency: active.currency,
      beneficiaryName: active.beneficiary_name,
      beneficiaryBank: active.beneficiary_bank,
      hasBankConfirmation: hasBank,
      hasCustomerConfirmation: hasCustomer,
    },
  });
}