import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  notifyAdminTransactionCreated,
  notifyCustomerTransactionCreated,
  notifySupplierTransactionCreated,
} from "@/lib/notifications";

function generateRef(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `KYA-${year}${month}-${random}`;
}

const STEPS_APPLY_FX = [
  "Customer Onboarding",
  "Supplier Selection",
  "Trade Setup",
  "Form M Submission",
  "Funding Instruction",
  "LC Issuance",
  "Pre-Shipment Inspection",
  "Shipment",
  "Document Validation",
  "FX Processing",
  "USD Credit",
  "Payment Instruction",
  "Payment Execution",
  "LC Liquidation",
  "Transaction Completion",
];

const STEPS_SELF_FUNDED = [
  "Customer Onboarding",
  "Supplier Selection",
  "Trade Setup",
  "Form M Submission",
  "Fund ROECNY (Own FX)",
  "Payment Instruction",
  "Payment Execution",
  "Pre-Shipment Inspection",
  "Shipment",
  "Document Validation",
  "Transaction Completion",
];

const HIGH_VALUE_THRESHOLD = 50000;

function assessTransactionRisk(totalValue: number, currency: string): {
  riskFlag: boolean;
  riskFlagReason: string;
  monitoringStatus: string;
} {
  const reasons: string[] = [];

  if (totalValue >= HIGH_VALUE_THRESHOLD) {
    reasons.push(`High value transaction: $${totalValue.toLocaleString()} ${currency} exceeds $${HIGH_VALUE_THRESHOLD.toLocaleString()} threshold`);
  }

  if (reasons.length > 0) {
    return {
      riskFlag: true,
      riskFlagReason: reasons.join("; "),
      monitoringStatus: "flagged",
    };
  }

  return {
    riskFlag: false,
    riskFlagReason: "",
    monitoringStatus: "clear",
  };
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await req.json();
  const {
    supplierId,
    supplierCategory,
    productDescription,
    quantity,
    unitPrice,
    totalValue,
    currency,
    portOfDestination,
    notes,
    fxRoute,
  } = body;

  if (!supplierId || !supplierCategory || !productDescription || !quantity || !unitPrice || !portOfDestination) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Defence-in-depth: confirm the supplier exists AND is verified server-side.
  const { data: verifiedSupplier } = await supabaseServer
    .from("suppliers")
    .select("id, supplier_name, contact_email")
    .eq("id", supplierId)
    .eq("verification_status", "verified")
    .maybeSingle();

  if (!verifiedSupplier) {
    return NextResponse.json({ error: "Selected supplier is not a verified supplier." }, { status: 400 });
  }

  const transactionRef = generateRef();
  const riskAssessment = assessTransactionRisk(totalValue, currency);

  const { data: transaction, error } = await supabaseServer
    .from("transactions")
    .insert({
      user_id: userId,
      transaction_ref: transactionRef,
      supplier_id: supplierId,
      supplier_name: verifiedSupplier.supplier_name,
      supplier_category: supplierCategory,
      product_description: productDescription,
      quantity,
      unit_price: unitPrice,
      total_value: totalValue,
      currency,
      port_of_destination: portOfDestination,
      notes,
      status: "draft",
      current_step: 2,
      fx_route: fxRoute === "self_funded" ? "self_funded" : "apply_fx",
      risk_flag: riskAssessment.riskFlag,
      risk_flag_reason: riskAssessment.riskFlagReason || null,
      monitoring_status: riskAssessment.monitoringStatus,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const stepsList = fxRoute === "self_funded" ? STEPS_SELF_FUNDED : STEPS_APPLY_FX;
  const steps = stepsList.map((name, i) => ({
    transaction_id: transaction.id,
    step_number: i + 1,
    step_name: name,
    status: i === 0 ? "complete" : i === 1 ? "active" : "pending",
  }));

  await supabaseServer.from("transaction_steps").insert(steps);

  // Self-funded transactions automatically trigger Enhanced Due Diligence (source of funds).
  if (fxRoute === "self_funded") {
    await supabaseServer.from("edd_requests").insert({
      user_id: userId,
      requested_by: "system",
      reason: "Self-funded transaction (" + transactionRef + ") — source of funds verification required.",
      status: "pending",
      documents_required: ["Source of Funds Declaration", "Proof of FX Source", "Bank Statements — 12 Months"],
      notes: "Automatically triggered because the customer is self-funding this transaction.",
    });
  }

  // Notifications: customer, KYA (admin), and supplier. Best-effort — never
  // block transaction creation if an email fails.
  try {
    const clerkRes = await fetch(
      "https://api.clerk.com/v1/users/" + userId,
      { headers: { Authorization: "Bearer " + process.env.CLERK_SECRET_KEY } }
    );
    const clerkUser = await clerkRes.json();
    const customerEmail = clerkUser.email_addresses?.[0]?.email_address;
    const customerName = ((clerkUser.first_name || "") + " " + (clerkUser.last_name || "")).trim() || "Customer";

    // Customer confirmation
    if (customerEmail) {
      await notifyCustomerTransactionCreated({
        customerEmail,
        customerName,
        transactionRef,
        supplierName: verifiedSupplier.supplier_name,
        totalValue,
        currency,
        transactionId: transaction.id,
      });
    }

    // KYA (admin) notification
    await notifyAdminTransactionCreated({
      customerName,
      transactionRef,
      supplierName: verifiedSupplier.supplier_name,
      totalValue,
      currency,
    });

    // Supplier notification — only if the supplier has a contact email on file.
    if (verifiedSupplier.contact_email) {
      await notifySupplierTransactionCreated({
        supplierEmail: verifiedSupplier.contact_email,
        supplierName: verifiedSupplier.supplier_name,
        customerName,
        customerEmail: customerEmail || "",
        transactionRef,
        productDescription,
        quantity: String(quantity),
        totalValue,
        currency,
        portOfDestination,
      });
    } else {
      console.warn("Supplier has no contact_email; supplier notification skipped:", verifiedSupplier.id);
    }

    // High-value alert to admin
    if (riskAssessment.riskFlag) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "info@kya.com.ng",
        to: process.env.ADMIN_EMAIL || "",
        subject: "KYA — Transaction Monitoring Alert: " + transactionRef,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#080C14;color:#E8E0D0;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1A2540,#0D1420);padding:36px 40px;border-bottom:2px solid #ef4444;">
              <h1 style="margin:0;font-size:28px;font-weight:900;color:#E8E0D0;font-family:Georgia,serif;">KY<span style="color:#C9A84C;">A</span></h1>
              <p style="margin:4px 0 0;font-size:11px;color:#4A5568;text-transform:uppercase;letter-spacing:0.15em;">Transaction Monitoring Alert</p>
            </div>
            <div style="padding:40px;">
              <div style="background:#080C14;border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:20px;margin:0 0 24px;">
                <p style="font-size:16px;font-weight:700;color:#ef4444;margin:0 0 8px;">High Value Transaction Flagged</p>
                <p style="font-size:13px;color:#8A9AB5;margin:0;">${riskAssessment.riskFlagReason}</p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;margin:0 0 24px;border:1px solid rgba(255,255,255,0.06);">
                ${[
                  ["KYA Reference", transactionRef],
                  ["Customer", customerName],
                  ["Supplier", verifiedSupplier.supplier_name],
                  ["Transaction Value", "$" + Number(totalValue).toLocaleString() + " " + currency],
                  ["Risk Flag", riskAssessment.riskFlagReason],
                ].map(([k, v]) => `
                  <tr>
                    <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;color:#4A5568;width:160px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;background:#080C14;">${k}</td>
                    <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;color:#E8E0D0;background:#080C14;">${v}</td>
                  </tr>
                `).join("")}
              </table>
              <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#C9A84C;border-radius:8px;">
                    <a href="https://staff.kya.ng/transactions" style="display:inline-block;background:#C9A84C;color:#080C14;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;text-transform:uppercase;">Review Transaction &rarr;</a>
                  </td>
                </tr>
              </table>
            </div>
            <div style="background:linear-gradient(135deg,#0D1420,#080C14);padding:28px 40px;border-top:1px solid rgba(201,168,76,0.2);">
              <p style="margin:0;font-size:11px;color:#4A5568;line-height:1.8;">KYA Digital Services Ltd &middot; CBN AML 2025 Compliance &middot; Transaction Monitoring System</p>
            </div>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error("Notification error:", err);
  }

  return NextResponse.json({
    success: true,
    transactionId: transaction.id,
    transactionRef,
    riskFlag: riskAssessment.riskFlag,
  });
}