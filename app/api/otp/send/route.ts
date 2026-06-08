import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { purpose, transactionId } = await req.json();

  if (!purpose) return NextResponse.json({ error: "Missing purpose" }, { status: 400 });

  // Invalidate any existing unused OTPs for this user and purpose
  await supabaseServer
    .from("transaction_otps")
    .update({ used: true })
    .eq("user_id", userId)
    .eq("purpose", purpose)
    .eq("used", false);

  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  const { error } = await supabaseServer
    .from("transaction_otps")
    .insert({
      user_id: userId,
      transaction_id: transactionId || null,
      otp_code: otpCode,
      purpose,
      used: false,
      expires_at: expiresAt,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get customer email from Clerk
  try {
    const clerkRes = await fetch(
      "https://api.clerk.com/v1/users/" + userId,
      { headers: { Authorization: "Bearer " + process.env.CLERK_SECRET_KEY } }
    );
    const clerkUser = await clerkRes.json();
    const customerEmail = clerkUser.email_addresses?.[0]?.email_address;
    const customerName = ((clerkUser.first_name || "") + " " + (clerkUser.last_name || "")).trim() || "Customer";

    if (customerEmail) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const purposeLabel = purpose === "transaction_creation" ? "Transaction Creation"
        : purpose === "payment_instruction" ? "Payment Authorisation"
        : purpose === "transaction_confirmation" ? "Transaction Confirmation"
        : "Account Action";

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "info@kya.com.ng",
        to: customerEmail,
        subject: "KYA — Your Verification Code",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#080C14;color:#E8E0D0;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1A2540,#0D1420);padding:36px 40px;border-bottom:2px solid #C9A84C;">
              <h1 style="margin:0;font-size:28px;font-weight:900;color:#E8E0D0;font-family:Georgia,serif;">KY<span style="color:#C9A84C;">A</span></h1>
              <p style="margin:4px 0 0;font-size:11px;color:#4A5568;text-transform:uppercase;letter-spacing:0.15em;">Digital Services</p>
            </div>
            <div style="padding:40px;">
              <p style="font-size:16px;color:#E8E0D0;margin:0 0 16px;">Hi ${customerName},</p>
              <p style="font-size:14px;color:#8A9AB5;line-height:1.75;margin:0 0 24px;">
                Use the verification code below to confirm your <strong style="color:#E8E0D0;">${purposeLabel}</strong> on the KYA platform.
              </p>
              <div style="background:#080C14;border:2px solid #C9A84C;border-radius:12px;padding:32px;text-align:center;margin:0 0 24px;">
                <p style="font-size:48px;font-weight:900;color:#C9A84C;letter-spacing:0.2em;margin:0;font-family:monospace;">${otpCode}</p>
                <p style="font-size:12px;color:#4A5568;margin:12px 0 0;">This code expires in 10 minutes</p>
              </div>
              <p style="font-size:13px;color:#4A5568;line-height:1.7;">
                If you did not initiate this action please contact us immediately at <a href="mailto:info@kya.com.ng" style="color:#C9A84C;">info@kya.com.ng</a> and do not share this code with anyone.
              </p>
            </div>
            <div style="background:linear-gradient(135deg,#0D1420,#080C14);padding:28px 40px;border-top:1px solid rgba(201,168,76,0.2);">
              <p style="margin:0;font-size:11px;color:#4A5568;line-height:1.8;">KYA Digital Services Ltd &middot; CAC Registered &middot; Lagos, Nigeria<br/>Not a PSP &middot; Not a Bank &middot; Trade Infrastructure Platform</p>
            </div>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error("OTP email error:", err);
  }

  return NextResponse.json({ success: true, expiresAt });
}