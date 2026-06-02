import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kya.com.ng";

function emailTemplate(content: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#080C14;color:#E8E0D0;border-radius:12px;overflow:hidden;">
      <div style="background:#0D1420;padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <h1 style="margin:0;font-size:28px;font-weight:900;color:#E8E0D0;">KY<span style="color:#C9A84C;">A</span></h1>
        <p style="margin:4px 0 0;font-size:12px;color:#4A5568;text-transform:uppercase;letter-spacing:0.1em;">Digital Services</p>
      </div>
      <div style="padding:32px;">${content}</div>
      <div style="background:#0D1420;padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
        <p style="margin:0;font-size:11px;color:#4A5568;line-height:1.6;">
          KYA Digital Services Ltd &middot; CAC Registered &middot; Lagos, Nigeria<br/>
          Not a PSP &middot; Not a Bank &middot; Trade Infrastructure Platform<br/>
          <a href="${APP_URL}" style="color:#C9A84C;text-decoration:none;">kya.ng</a>
        </p>
      </div>
    </div>
  `;
}

function row(label: string, value: string, highlight = false) {
  return `<tr><td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;color:#4A5568;width:160px;font-weight:600;">${label}</td><td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;color:${highlight ? "#C9A84C" : "#E8E0D0"};">${value}</td></tr>`;
}

function table(rows: string) {
  return `<table style="width:100%;border-collapse:collapse;margin:20px 0;background:#0D1420;border-radius:8px;overflow:hidden;">${rows}</table>`;
}

function btn(text: string, url: string, color = "#C9A84C") {
  return `<a href="${url}" style="display:inline-block;background:${color};color:${color === "#C9A84C" ? "#080C14" : "#fff"};padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;letter-spacing:0.04em;margin-top:20px;text-transform:uppercase;">${text}</a>`;
}

function greeting(name: string) {
  return `<p style="font-size:16px;color:#E8E0D0;margin-bottom:8px;">Hi ${name},</p>`;
}

function disclaimer() {
  return `<p style="font-size:11px;color:#4A5568;margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);line-height:1.6;">KYA Digital Services Ltd does not hold, transfer, or process customer funds. All financial activities are conducted by licensed banking and settlement partners.</p>`;
}

// ─── CUSTOMER NOTIFICATIONS ───────────────────────────────────────────────────

export async function notifyCustomerWelcome(params: {
  customerEmail: string;
  customerName: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "Welcome to KYA Digital Services",
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;margin-bottom:20px;">Welcome to KYA Digital Services. Your account has been created successfully.</p>
      <p style="font-size:14px;color:#8A9AB5;line-height:1.7;">To begin trading you need to complete your verification:</p>
      <ul style="color:#8A9AB5;font-size:14px;line-height:2;padding-left:20px;">
        <li>Complete your KYC or KYB onboarding form</li>
        <li>Upload your required verification documents</li>
        <li>Await compliance review and approval</li>
      </ul>
      ${btn("Complete Verification", APP_URL + "/dashboard/onboarding")}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerTermsAccepted(params: {
  customerEmail: string;
  customerName: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — Platform Terms Accepted",
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">You have successfully accepted the KYA Platform Terms of Service.</p>
      <p style="font-size:14px;color:#8A9AB5;line-height:1.7;">Please complete your onboarding to gain full platform access.</p>
      ${btn("Continue Onboarding", APP_URL + "/dashboard/onboarding")}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerKycSubmitted(params: {
  customerEmail: string;
  customerName: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — KYC Verification Submitted",
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">Your KYC verification form has been received successfully.</p>
      <p style="font-size:14px;color:#8A9AB5;line-height:1.7;">The next step is to upload your required identity documents. Our compliance team will review everything once all documents are submitted.</p>
      ${btn("Upload Documents", APP_URL + "/dashboard/documents")}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerKybSubmitted(params: {
  customerEmail: string;
  customerName: string;
  companyName: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — KYB Verification Submitted",
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">Your KYB verification form for <strong style="color:#E8E0D0;">${params.companyName}</strong> has been received successfully.</p>
      <p style="font-size:14px;color:#8A9AB5;line-height:1.7;">The next step is to upload your required business documents.</p>
      ${btn("Upload Documents", APP_URL + "/dashboard/documents")}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerDocumentUploaded(params: {
  customerEmail: string;
  customerName: string;
  documentType: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — Document Received",
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">We have received your document and it is now pending review.</p>
      ${table(row("Document", params.documentType.replace(/_/g, " ")))}
      <p style="font-size:14px;color:#8A9AB5;line-height:1.7;">You will receive a notification once reviewed. This typically takes 1 to 2 business days.</p>
      ${btn("View Documents", APP_URL + "/dashboard/documents")}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerDocumentApproved(params: {
  customerEmail: string;
  customerName: string;
  documentType: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — Document Approved",
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">Your document has been <strong style="color:#10b981;">approved</strong> by our compliance team.</p>
      ${table(row("Document", params.documentType.replace(/_/g, " ")))}
      ${btn("View Dashboard", APP_URL + "/dashboard")}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerDocumentRejected(params: {
  customerEmail: string;
  customerName: string;
  documentType: string;
  rejectionReason: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — Document Requires Attention",
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">Your document could not be approved and needs to be re-uploaded.</p>
      ${table(row("Document", params.documentType.replace(/_/g, " ")) + row("Reason", params.rejectionReason, true))}
      ${btn("Re-upload Document", APP_URL + "/dashboard/documents", "#ef4444")}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerAccountVerified(params: {
  customerEmail: string;
  customerName: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — Account Verified — You Can Now Trade",
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">Congratulations — your account has been <strong style="color:#10b981;">fully verified</strong>.</p>
      <p style="font-size:14px;color:#8A9AB5;line-height:1.7;">You now have full access to the KYA trade platform.</p>
      <div style="background:#0D1420;border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:20px;margin:20px 0;">
        <p style="font-size:13px;color:#C9A84C;font-weight:600;margin-bottom:8px;">What you can do now:</p>
        <ul style="color:#8A9AB5;font-size:13px;line-height:2;padding-left:20px;margin:0;">
          <li>Browse verified Asian suppliers across 5 trade categories</li>
          <li>Create a trade transaction with a unique KYA reference</li>
          <li>Upload trade documents and track your shipment</li>
          <li>Monitor every step of your transaction in real time</li>
        </ul>
      </div>
      ${btn("Start Trading", APP_URL + "/dashboard/suppliers")}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerTransactionCreated(params: {
  customerEmail: string;
  customerName: string;
  transactionRef: string;
  supplierName: string;
  totalValue: number;
  currency: string;
  transactionId: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — Transaction Created: " + params.transactionRef,
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">Your trade transaction has been created. Your unique KYA reference is shown below — please keep this for your records.</p>
      ${table(
        row("KYA Reference", params.transactionRef, true) +
        row("Supplier", params.supplierName) +
        row("Value", "$" + Number(params.totalValue).toLocaleString() + " " + params.currency)
      )}
      <p style="font-size:14px;color:#8A9AB5;line-height:1.7;">Your transaction is now at Step 2 — Supplier Selection. Upload your trade documents to proceed.</p>
      ${btn("View Transaction", APP_URL + "/dashboard/transactions/" + params.transactionId)}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerTradeDocumentUploaded(params: {
  customerEmail: string;
  customerName: string;
  documentType: string;
  transactionRef: string;
  transactionId: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — Trade Document Received: " + params.transactionRef,
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">We have received your trade document for transaction <strong style="color:#C9A84C;">${params.transactionRef}</strong>.</p>
      ${table(row("Document", params.documentType.replace(/_/g, " ")) + row("Transaction", params.transactionRef, true))}
      ${btn("View Transaction", APP_URL + "/dashboard/transactions/" + params.transactionId)}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerTradeDocumentApproved(params: {
  customerEmail: string;
  customerName: string;
  documentType: string;
  transactionRef: string;
  transactionId: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — Trade Document Approved: " + params.transactionRef,
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">Your trade document has been <strong style="color:#10b981;">approved</strong>.</p>
      ${table(row("Document", params.documentType.replace(/_/g, " ")) + row("Transaction", params.transactionRef, true))}
      ${btn("View Transaction", APP_URL + "/dashboard/transactions/" + params.transactionId)}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerTradeDocumentRejected(params: {
  customerEmail: string;
  customerName: string;
  documentType: string;
  transactionRef: string;
  transactionId: string;
  rejectionReason: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — Trade Document Requires Attention: " + params.transactionRef,
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">Your trade document requires attention and needs to be re-uploaded.</p>
      ${table(
        row("Document", params.documentType.replace(/_/g, " ")) +
        row("Transaction", params.transactionRef, true) +
        row("Reason", params.rejectionReason)
      )}
      ${btn("Re-upload Document", APP_URL + "/dashboard/transactions/" + params.transactionId, "#ef4444")}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerStepAdvanced(params: {
  customerEmail: string;
  customerName: string;
  transactionRef: string;
  supplierName: string;
  stepNumber: number;
  stepName: string;
  transactionId?: string;
  note?: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — Transaction Update: " + params.transactionRef,
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">Your trade transaction has been advanced to the next step.</p>
      ${table(
        row("Reference", params.transactionRef, true) +
        row("Supplier", params.supplierName) +
        row("Current Step", "Step " + params.stepNumber + " — " + params.stepName, true) +
        (params.note ? row("Note", params.note) : "")
      )}
      ${params.stepNumber === 15 ? `<div style="background:#0D1420;border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:20px;margin:20px 0;text-align:center;"><p style="font-size:16px;font-weight:700;color:#10b981;margin:0;">Transaction Complete</p><p style="font-size:13px;color:#8A9AB5;margin-top:8px;">Your trade transaction has been fully processed and closed.</p></div>` : ""}
      ${btn("View Transaction", APP_URL + "/dashboard" + (params.transactionId ? "/transactions/" + params.transactionId : ""))}
      ${disclaimer()}
    `),
  });
}

export async function notifyCustomerTransactionComplete(params: {
  customerEmail: string;
  customerName: string;
  transactionRef: string;
  supplierName: string;
  totalValue: number;
  currency: string;
  transactionId: string;
}) {
  await resend.emails.send({
    from: FROM, to: params.customerEmail,
    subject: "KYA — Transaction Complete: " + params.transactionRef,
    html: emailTemplate(`
      ${greeting(params.customerName)}
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">Your trade transaction has been <strong style="color:#10b981;">successfully completed</strong>. The full audit trail has been recorded.</p>
      ${table(
        row("KYA Reference", params.transactionRef, true) +
        row("Supplier", params.supplierName) +
        row("Total Value", "$" + Number(params.totalValue).toLocaleString() + " " + params.currency)
      )}
      ${btn("View Transaction", APP_URL + "/dashboard/transactions/" + params.transactionId)}
      ${disclaimer()}
    `),
  });
}

// ─── ADMIN NOTIFICATIONS ──────────────────────────────────────────────────────

export async function notifyAdminDocumentUploaded(params: {
  customerName: string;
  documentType: string;
  accountType: string;
}) {
  await resend.emails.send({
    from: FROM, to: ADMIN_EMAIL,
    subject: "KYA Staff — Document Pending Review",
    html: emailTemplate(`
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">A customer has uploaded a document requiring review.</p>
      ${table(
        row("Customer", params.customerName) +
        row("Document", params.documentType.replace(/_/g, " ")) +
        row("Account Type", params.accountType === "personal" ? "Personal KYC" : "Business KYB")
      )}
      ${btn("Review Documents", "https://staff.kya.ng/documents")}
    `),
  });
}

export async function notifyAdminTransactionCreated(params: {
  customerName: string;
  transactionRef: string;
  supplierName: string;
  totalValue: number;
  currency: string;
}) {
  await resend.emails.send({
    from: FROM, to: ADMIN_EMAIL,
    subject: "KYA Staff — New Transaction: " + params.transactionRef,
    html: emailTemplate(`
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">A new trade transaction has been created.</p>
      ${table(
        row("Reference", params.transactionRef, true) +
        row("Customer", params.customerName) +
        row("Supplier", params.supplierName) +
        row("Value", "$" + Number(params.totalValue).toLocaleString() + " " + params.currency)
      )}
      ${btn("View Transactions", "https://staff.kya.ng/transactions")}
    `),
  });
}

export async function notifyAdminKycSubmitted(params: {
  customerName: string;
  customerEmail: string;
}) {
  await resend.emails.send({
    from: FROM, to: ADMIN_EMAIL,
    subject: "KYA Staff — New KYC Submission",
    html: emailTemplate(`
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">A customer has submitted their KYC onboarding form.</p>
      ${table(row("Customer", params.customerName) + row("Email", params.customerEmail))}
      ${btn("View Customers", "https://staff.kya.ng/customers")}
    `),
  });
}

export async function notifyAdminKybSubmitted(params: {
  customerName: string;
  companyName: string;
  customerEmail: string;
}) {
  await resend.emails.send({
    from: FROM, to: ADMIN_EMAIL,
    subject: "KYA Staff — New KYB Submission",
    html: emailTemplate(`
      <p style="font-size:15px;color:#8A9AB5;line-height:1.7;">A business customer has submitted their KYB onboarding form.</p>
      ${table(
        row("Company", params.companyName, true) +
        row("Representative", params.customerName) +
        row("Email", params.customerEmail)
      )}
      ${btn("View Customers", "https://staff.kya.ng/customers")}
    `),
  });
}