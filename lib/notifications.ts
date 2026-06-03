import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kya.com.ng";

function emailTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>KYA Digital Services</title>
</head>
<body style="margin:0;padding:0;background:#0A0E1A;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0E1A;padding:40px 20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1A2540 0%,#0D1420 100%);border-radius:16px 16px 0 0;padding:36px 40px;border-bottom:2px solid #C9A84C;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:32px;font-weight:900;color:#E8E0D0;letter-spacing:-0.02em;font-family:Georgia,serif;">KY<span style="color:#C9A84C;">A</span></span>
                  <p style="margin:4px 0 0;font-size:11px;color:#4A5568;text-transform:uppercase;letter-spacing:0.15em;">Digital Services</p>
                </td>
                <td align="right">
                  <span style="font-size:11px;color:#4A5568;text-transform:uppercase;letter-spacing:0.1em;">Trade Infrastructure</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="background:#C9A84C;height:2px;padding:0;line-height:2px;font-size:0;">&nbsp;</td></tr>
        <tr>
          <td style="background:#0D1420;padding:40px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#0D1420;padding:0 40px;">
            <div style="border-top:1px solid rgba(255,255,255,0.06);"></div>
          </td>
        </tr>
        <tr>
          <td style="background:#0D1420;padding:20px 40px;">
            <p style="margin:0;font-size:11px;color:#4A5568;line-height:1.7;">
              <strong style="color:#6B7280;">Important:</strong> KYA Digital Services Ltd does not hold, transfer, or process customer funds. All financial activities are conducted exclusively by licensed banking and settlement partners.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:linear-gradient(135deg,#0D1420 0%,#080C14 100%);border-radius:0 0 16px 16px;padding:28px 40px;border-top:1px solid rgba(201,168,76,0.2);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:12px;color:#4A5568;line-height:1.8;">
                    <strong style="color:#6B7280;">KYA Digital Services Ltd</strong><br/>
                    CAC Registered &nbsp;&middot;&nbsp; Lagos, Nigeria<br/>
                    Not a PSP &nbsp;&middot;&nbsp; Not a Bank &nbsp;&middot;&nbsp; Trade Infrastructure Platform
                  </p>
                </td>
                <td align="right" valign="top">
                  <a href="${APP_URL}" style="font-size:12px;color:#C9A84C;text-decoration:none;font-weight:600;">kya.ng</a><br/>
                  <a href="mailto:info@kya.ng" style="font-size:11px;color:#4A5568;text-decoration:none;">info@kya.ng</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function row(label: string, value: string, highlight = false) {
  return `<tr>
    <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;color:#4A5568;width:160px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;background:#080C14;">${label}</td>
    <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;color:${highlight ? "#C9A84C" : "#E8E0D0"};font-weight:${highlight ? "700" : "400"};background:#080C14;">${value}</td>
  </tr>`;
}

function table(rows: string) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;margin:20px 0;border:1px solid rgba(255,255,255,0.06);">${rows}</table>`;
}

function btn(text: string, url: string, color = "#C9A84C") {
  const textColor = color === "#C9A84C" ? "#080C14" : "#ffffff";
  return `<table cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td style="background:${color};border-radius:8px;"><a href="${url}" style="display:inline-block;background:${color};color:${textColor};padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">${text} &rarr;</a></td></tr></table>`;
}

function greeting(name: string) {
  return `<p style="font-size:16px;color:#E8E0D0;margin:0 0 16px;font-weight:400;">Hi <strong style="color:#E8E0D0;">${name}</strong>,</p>`;
}

function para(text: string) {
  return `<p style="font-size:14px;color:#8A9AB5;line-height:1.75;margin:0 0 16px;">${text}</p>`;
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
      ${para("Welcome to KYA Digital Services. Your account has been created successfully.")}
      ${para("To begin trading you need to complete your verification:")}
      <ul style="color:#8A9AB5;font-size:14px;line-height:2;padding-left:20px;margin:0 0 16px;">
        <li>Complete your KYC or KYB onboarding form</li>
        <li>Upload your required verification documents</li>
        <li>Await compliance review and approval</li>
      </ul>
      ${btn("Complete Verification", APP_URL + "/dashboard/onboarding")}
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
      ${para("You have successfully accepted the KYA Platform Terms of Service.")}
      ${para("Please complete your onboarding to gain full platform access.")}
      ${btn("Continue Onboarding", APP_URL + "/dashboard/onboarding")}
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
      ${para("Your KYC verification form has been received successfully.")}
      ${para("The next step is to upload your required identity documents. Our compliance team will review everything once all documents are submitted.")}
      ${btn("Upload Documents", APP_URL + "/dashboard/documents")}
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
      ${para("Your KYB verification form for <strong style=\"color:#E8E0D0;\">" + params.companyName + "</strong> has been received successfully.")}
      ${para("The next step is to upload your required business documents. Our compliance team will review everything once all documents are submitted.")}
      ${btn("Upload Documents", APP_URL + "/dashboard/documents")}
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
      ${para("We have received your document and it is now pending review by our compliance team.")}
      ${table(row("Document", params.documentType.replace(/_/g, " ")))}
      ${para("You will receive a notification once the document has been reviewed. This typically takes 1 to 2 business days.")}
      ${btn("View Documents", APP_URL + "/dashboard/documents")}
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
      ${para("Your document has been reviewed and <strong style=\"color:#10b981;\">approved</strong> by our compliance team.")}
      ${table(row("Document", params.documentType.replace(/_/g, " ")))}
      ${para("Log in to your dashboard to check your overall verification progress.")}
      ${btn("View Dashboard", APP_URL + "/dashboard")}
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
      ${para("Your document could not be approved and needs to be re-uploaded.")}
      ${table(row("Document", params.documentType.replace(/_/g, " ")) + row("Reason", params.rejectionReason, true))}
      ${para("Please log in and re-upload the correct document at your earliest convenience.")}
      ${btn("Re-upload Document", APP_URL + "/dashboard/documents", "#ef4444")}
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
      ${para("Congratulations — your account has been <strong style=\"color:#10b981;\">fully verified</strong>.")}
      ${para("You now have full access to the KYA trade platform. You can browse our verified supplier marketplace and initiate your first trade transaction.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#080C14;border:1px solid rgba(201,168,76,0.2);border-radius:8px;margin:20px 0;">
        <tr><td style="padding:20px;">
          <p style="font-size:13px;color:#C9A84C;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;">What you can do now</p>
          <ul style="color:#8A9AB5;font-size:13px;line-height:2;padding-left:20px;margin:0;">
            <li>Browse verified Asian suppliers across 5 trade categories</li>
            <li>Create a trade transaction with a unique KYA reference</li>
            <li>Upload trade documents and track your shipment</li>
            <li>Monitor every step of your transaction in real time</li>
          </ul>
        </td></tr>
      </table>
      ${btn("Start Trading", APP_URL + "/dashboard/suppliers")}
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
      ${para("Your trade transaction has been created successfully. Your unique KYA reference number is shown below — please keep this for your records.")}
      ${table(
        row("KYA Reference", params.transactionRef, true) +
        row("Supplier", params.supplierName) +
        row("Transaction Value", "$" + Number(params.totalValue).toLocaleString() + " " + params.currency)
      )}
      ${para("Your transaction is now at Step 2 — Supplier Selection. The next step is to upload your trade documents to proceed.")}
      ${btn("View Transaction", APP_URL + "/dashboard/transactions/" + params.transactionId)}
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
      ${para("We have received your trade document for transaction <strong style=\"color:#C9A84C;\">" + params.transactionRef + "</strong>.")}
      ${table(
        row("Document", params.documentType.replace(/_/g, " ")) +
        row("Transaction", params.transactionRef, true)
      )}
      ${para("Our compliance team will review the document and notify you of the outcome.")}
      ${btn("View Transaction", APP_URL + "/dashboard/transactions/" + params.transactionId)}
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
      ${para("Your trade document has been <strong style=\"color:#10b981;\">approved</strong>.")}
      ${table(
        row("Document", params.documentType.replace(/_/g, " ")) +
        row("Transaction", params.transactionRef, true)
      )}
      ${btn("View Transaction", APP_URL + "/dashboard/transactions/" + params.transactionId)}
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
      ${para("Your trade document requires attention and needs to be re-uploaded.")}
      ${table(
        row("Document", params.documentType.replace(/_/g, " ")) +
        row("Transaction", params.transactionRef, true) +
        row("Reason", params.rejectionReason)
      )}
      ${btn("Re-upload Document", APP_URL + "/dashboard/transactions/" + params.transactionId, "#ef4444")}
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
      ${para("Your trade transaction has been advanced to the next step.")}
      ${table(
        row("Reference", params.transactionRef, true) +
        row("Supplier", params.supplierName) +
        row("Current Step", "Step " + params.stepNumber + " — " + params.stepName, true) +
        (params.note ? row("Note", params.note) : "")
      )}
      ${params.stepNumber === 15 ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#080C14;border:1px solid rgba(16,185,129,0.3);border-radius:8px;margin:20px 0;">
          <tr><td style="padding:20px;text-align:center;">
            <p style="font-size:16px;font-weight:700;color:#10b981;margin:0;">Transaction Complete</p>
            <p style="font-size:13px;color:#8A9AB5;margin:8px 0 0;">Your trade transaction has been fully processed and closed.</p>
          </td></tr>
        </table>
      ` : ""}
      ${btn("View Transaction", APP_URL + "/dashboard" + (params.transactionId ? "/transactions/" + params.transactionId : ""))}
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
      ${para("Your trade transaction has been <strong style=\"color:#10b981;\">successfully completed</strong>. The full audit trail has been recorded.")}
      ${table(
        row("KYA Reference", params.transactionRef, true) +
        row("Supplier", params.supplierName) +
        row("Total Value", "$" + Number(params.totalValue).toLocaleString() + " " + params.currency)
      )}
      ${para("Thank you for using the KYA trade platform. You can view the full transaction record and audit trail in your dashboard.")}
      ${btn("View Transaction", APP_URL + "/dashboard/transactions/" + params.transactionId)}
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
      ${para("A customer has uploaded a document requiring compliance review.")}
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
      ${para("A new trade transaction has been created and requires your attention.")}
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
      ${para("A customer has submitted their KYC onboarding form and is awaiting document upload.")}
      ${table(
        row("Customer", params.customerName) +
        row("Email", params.customerEmail)
      )}
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
      ${para("A business customer has submitted their KYB onboarding form and is awaiting document upload.")}
      ${table(
        row("Company", params.companyName, true) +
        row("Representative", params.customerName) +
        row("Email", params.customerEmail)
      )}
      ${btn("View Customers", "https://staff.kya.ng/customers")}
    `),
  });
}