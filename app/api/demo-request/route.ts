import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const { productName, modelNumber, supplierName, note } = body;
  if (!productName) return NextResponse.json({ error: "Product required" }, { status: 400 });

  // Get the customer's details from their KYC or KYB profile.
  const [{ data: kyc }, { data: kyb }] = await Promise.all([
    supabaseServer.from("kyc_profiles").select("first_name, last_name, email").eq("user_id", userId).maybeSingle(),
    supabaseServer.from("kyb_profiles").select("first_name, last_name, email").eq("user_id", userId).maybeSingle(),
  ]);
  const profile = kyc || kyb;
  const customerName = profile ? ((profile.first_name || "") + " " + (profile.last_name || "")).trim() : "A KYA customer";
  const customerEmail = profile?.email || "";

  const productLabel = productName + (modelNumber ? " (" + modelNumber + ")" : "");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM = process.env.RESEND_FROM_EMAIL || "info@kya.com.ng";

    // 1. Email to KYA staff inbox
    await resend.emails.send({
      from: FROM,
      to: "info@kya.com.ng",
      subject: "Demo Request — " + productLabel,
      html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0A0E1A;margin:0;padding:40px 20px;">
        <table width="600" style="max-width:600px;margin:0 auto;background:#0D1420;border-radius:16px;overflow:hidden;border:1px solid rgba(201,168,76,0.2);">
          <tr><td style="background:linear-gradient(135deg,#1A2540,#0D1420);padding:32px 40px;border-bottom:2px solid #C9A84C;">
            <span style="font-size:28px;font-weight:900;color:#E8E0D0;font-family:Georgia,serif;">KY<span style="color:#C9A84C;">A</span></span>
          </td></tr>
          <tr><td style="padding:40px;">
            <p style="font-size:16px;color:#E8E0D0;margin:0 0 16px;">New Demo Request</p>
            <div style="background:#080C14;border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:16px;margin:0 0 16px;">
              <p style="font-size:13px;color:#8A9AB5;margin:0 0 8px;"><strong style="color:#E8E0D0;">Product:</strong> ${productLabel}</p>
              <p style="font-size:13px;color:#8A9AB5;margin:0 0 8px;"><strong style="color:#E8E0D0;">Supplier:</strong> ${supplierName || "N/A"}</p>
              <p style="font-size:13px;color:#8A9AB5;margin:0 0 8px;"><strong style="color:#E8E0D0;">Customer:</strong> ${customerName}</p>
              <p style="font-size:13px;color:#8A9AB5;margin:0 0 8px;"><strong style="color:#E8E0D0;">Customer Email:</strong> ${customerEmail}</p>
              ${note ? `<p style="font-size:13px;color:#8A9AB5;margin:0;"><strong style="color:#E8E0D0;">Note:</strong> ${note}</p>` : ""}
            </div>
            <p style="font-size:14px;color:#8A9AB5;line-height:1.75;">Please arrange a Teams demo session between the customer and the supplier.</p>
          </td></tr>
          <tr><td style="background:#080C14;padding:24px 40px;border-top:1px solid rgba(201,168,76,0.2);">
            <p style="font-size:11px;color:#4A5568;margin:0;">KYA Digital Services Ltd · Demo Request System</p>
          </td></tr>
        </table></body></html>`,
    });

    // 2. Confirmation email to the customer
    if (customerEmail) {
      await resend.emails.send({
        from: FROM,
        to: customerEmail,
        subject: "Your Demo Request — " + productLabel,
        html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0A0E1A;margin:0;padding:40px 20px;">
          <table width="600" style="max-width:600px;margin:0 auto;background:#0D1420;border-radius:16px;overflow:hidden;border:1px solid rgba(201,168,76,0.2);">
            <tr><td style="background:linear-gradient(135deg,#1A2540,#0D1420);padding:32px 40px;border-bottom:2px solid #C9A84C;">
              <span style="font-size:28px;font-weight:900;color:#E8E0D0;font-family:Georgia,serif;">KY<span style="color:#C9A84C;">A</span></span>
            </td></tr>
            <tr><td style="padding:40px;">
              <p style="font-size:16px;color:#E8E0D0;margin:0 0 16px;">Hi ${customerName},</p>
              <p style="font-size:14px;color:#8A9AB5;line-height:1.75;margin:0 0 16px;">Thank you for your interest in <strong style="color:#E8E0D0;">${productLabel}</strong>${supplierName ? " from " + supplierName : ""}. We've received your request for a live demonstration.</p>
              <p style="font-size:14px;color:#8A9AB5;line-height:1.75;margin:0 0 16px;">Our team will be in touch shortly to arrange a Microsoft Teams session with the supplier at a time that suits you.</p>
              <p style="font-size:14px;color:#8A9AB5;line-height:1.75;">If you have any questions in the meantime, reply to this email or contact us at info@kya.com.ng.</p>
            </td></tr>
            <tr><td style="background:#080C14;padding:24px 40px;border-top:1px solid rgba(201,168,76,0.2);">
              <p style="font-size:11px;color:#4A5568;margin:0;">KYA Digital Services Ltd · Not a PSP · Not a Bank · CAC Registered</p>
            </td></tr>
          </table></body></html>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Demo request email error:", err);
    return NextResponse.json({ error: "Failed to send demo request" }, { status: 500 });
  }
}