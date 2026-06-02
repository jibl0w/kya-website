import {
  notifyAdminTransactionCreated,
  notifyCustomerTransactionCreated,
} from "@/lib/notifications";

PS C:\Users\jiblo\Desktop\KYA-WEBSITE> cd C:\Users\jiblo\Desktop\KYA-WEBSITE
PS C:\Users\jiblo\Desktop\KYA-WEBSITE> git add .
>> git commit -m "Add Terms of Service page and acceptance checkpoint"
>> git push
[main 836be10] Add Terms of Service page and acceptance checkpoint
 4 files changed, 331 insertions(+), 57 deletions(-)
 create mode 100644 app/components/TermsAcceptance.tsx
 create mode 100644 app/dashboard/onboarding/OnboardingWithTerms.tsx
 create mode 100644 app/terms/page.tsx
Enumerating objects: 17, done.
Counting objects: 100% (17/17), done.
Delta compression using up to 8 threads
Compressing objects: 100% (10/10), done.
Writing objects: 100% (11/11), 7.04 KiB | 266.00 KiB/s, done.
Total 11 (delta 4), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (4/4), completed with 4 local objects.
To https://github.com/jibl0w/kya-website.git
   4088e47..836be10  main -> main
PS C:\Users\jiblo\Desktop\KYA-WEBSITE> 
 *  History restored 

PS C:\Users\jiblo\Desktop\KYA-WEBSITE> Get-Content lib/notifications.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

export async function notifyAdminDocumentUploaded(params: {
  customerName: string;
  documentType: string;
  accountType: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: "KYA â€” New Document Uploaded",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">KYA Digital Services</h2>
        <p>A customer has uploaded a new verification document.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Customer</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Document</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.documentType.replace(/_/g, " ")}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Account Type</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.accountType === "personal" ? "Personal KYC" : "Business KYB"}</td>
          </tr>
        </table>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/documents" 
           style="background: #f59e0b; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Review Documents
        </a>
      </div>
    `,
  });
}

export async function notifyCustomerDocumentApproved(params: {
  customerEmail: string;
  customerName: string;
  documentType: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: params.customerEmail,
    subject: "KYA â€” Document Approved",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">KYA Digital Services</h2>
        <p>Hi ${params.customerName},</p>
        <p>Your document has been reviewed and <strong style="color: #10b981;">approved</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Document</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.documentType.replace(/_/g, " ")}</td>
          </tr>
        </table>
        <p>Log in to your KYA dashboard to check your verification progress.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard"
           style="background: #f59e0b; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          View Dashboard
        </a>
      </div>
    `,
  });
}

export async function notifyCustomerDocumentRejected(params: {
  customerEmail: string;
  customerName: string;
  documentType: string;
  rejectionReason: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: params.customerEmail,
    subject: "KYA â€” Document Requires Attention",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">KYA Digital Services</h2>
        <p>Hi ${params.customerName},</p>
        <p>Your document requires attention and needs to be re-uploaded.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Document</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.documentType.replace(/_/g, " ")}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Reason</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; color: #ef4444;">${params.rejectionReason}</td>
          </tr>
        </table>
        <p>Please log in and re-upload the correct document.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/documents"
           style="background: #ef4444; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Re-upload Document
        </a>
      </div>
    `,
  });
}

export async function notifyCustomerAccountVerified(params: {
  customerEmail: string;
  customerName: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: params.customerEmail,
    subject: "KYA â€” Your Account is Verified",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">KYA Digital Services</h2>
        <p>Hi ${params.customerName},</p>
        <p>Congratulations â€” your account has been <strong style="color: #10b981;">fully verified</strong>.</p>
        <p>You can now initiate trade transactions through the KYA platform. Browse our verified supplier marketplace and start your first trade today.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard"
           style="background: #f59e0b; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Start Trading
        </a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          KYA Digital Services Ltd Â· CAC Registered Â· Nigeria<br/>
          Not a PSP Â· Not a Bank Â· Trade Infrastructure Platform
        </p>
      </div>
    `,
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
    from: FROM,
    to: ADMIN_EMAIL,
    subject: "KYA â€” New Transaction Created",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">KYA Digital Services</h2>
        <p>A new trade transaction has been created.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Reference</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.transactionRef}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Customer</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Supplier</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.supplierName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Value</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">$${params.totalValue.toLocaleString()} ${params.currency}</td>
          </tr>
        </table>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/transactions"
           style="background: #f59e0b; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          View Transactions
        </a>
      </div>
    `,
  });
}

export async function notifyCustomerStepAdvanced(params: {
  customerEmail: string;
  customerName: string;
  transactionRef: string;
  supplierName: string;
  stepNumber: number;
  stepName: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: params.customerEmail,
    subject: "KYA â€” Transaction Update: " + params.transactionRef,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">KYA Digital Services</h2>
        <p>Hi ${params.customerName},</p>
        <p>Your trade transaction has been updated.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Reference</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.transactionRef}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Supplier</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.supplierName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Current Step</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; color: #f59e0b;">Step ${params.stepNumber} â€” ${params.stepName}</td>
          </tr>
        </table>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard"
           style="background: #f59e0b; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          View Transaction
        </a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          KYA Digital Services Ltd Â· CAC Registered Â· Nigeria
        </p>
      </div>
    `,
  });
}