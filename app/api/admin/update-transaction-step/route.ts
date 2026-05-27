import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { notifyCustomerStepAdvanced } from "@/lib/notifications";

const ADMIN_IDS = process.env.ADMIN_USER_IDS?.split(",") || [];

const STEP_NAMES = [
  "KYC / KYB Verification",
  "Supplier Selection",
  "Form M Submission",
  "Naira Funding",
  "LC Issuance",
  "Pre-Shipment Inspection",
  "Shipment & Documents",
  "FX Processing & Release",
  "USD Credit to Account",
  "Payment Instruction",
  "RMB Settlement",
  "LC Liquidation",
  "Transaction Complete",
];

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId || !ADMIN_IDS.includes(userId)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { transactionId, currentStep, nextStep, note, formMNumber, lcNumber, revert } = await req.json();

  if (!transactionId || !currentStep || !nextStep) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const txnUpdate: any = {
    current_step: nextStep,
    status: nextStep === 13 ? "complete" : "active",
    updated_at: new Date().toISOString(),
  };

  if (formMNumber) txnUpdate.form_m_number = formMNumber;
  if (lcNumber) txnUpdate.lc_number = lcNumber;

  const { error: txnError } = await supabaseServer
    .from("transactions")
    .update(txnUpdate)
    .eq("id", transactionId);

  if (txnError) return NextResponse.json({ error: txnError.message }, { status: 500 });

  if (!revert) {
    await supabaseServer
      .from("transaction_steps")
      .update({
        status: "complete",
        completed_at: new Date().toISOString(),
        completed_by: userId,
        notes: note || null,
      })
      .eq("transaction_id", transactionId)
      .eq("step_number", currentStep);
  } else {
    await supabaseServer
      .from("transaction_steps")
      .update({
        status: "pending",
        completed_at: null,
        completed_by: null,
        notes: null,
      })
      .eq("transaction_id", transactionId)
      .eq("step_number", currentStep);
  }

  await supabaseServer
    .from("transaction_steps")
    .update({ status: "active" })
    .eq("transaction_id", transactionId)
    .eq("step_number", nextStep);

  // Send notification to customer
  if (!revert) {
    try {
      const { data: txn } = await supabaseServer
        .from("transactions")
        .select("user_id, transaction_ref, supplier_name")
        .eq("id", transactionId)
        .single();

      if (txn) {
        const clerkRes = await fetch(
          "https://api.clerk.com/v1/users/" + txn.user_id,
          { headers: { Authorization: "Bearer " + process.env.CLERK_SECRET_KEY } }
        );
        const clerkUser = await clerkRes.json();
        const customerEmail = clerkUser.email_addresses?.[0]?.email_address;
        const customerName = ((clerkUser.first_name || "") + " " + (clerkUser.last_name || "")).trim() || "Customer";

        if (customerEmail) {
          await notifyCustomerStepAdvanced({
            customerEmail,
            customerName,
            transactionRef: txn.transaction_ref,
            supplierName: txn.supplier_name,
            stepNumber: nextStep,
            stepName: STEP_NAMES[nextStep - 1],
          });
        }
      }
    } catch (err) {
      console.error("Notification error:", err);
    }
  }

  return NextResponse.json({ success: true });
}