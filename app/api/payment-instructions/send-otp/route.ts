import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { instructionId } = await req.json();
  if (!instructionId) return NextResponse.json({ error: "Missing instruction." }, { status: 400 });

  // Load the instruction and confirm ownership + correct state.
  const { data: instruction } = await supabaseServer
    .from("payment_instructions")
    .select("id, instruction_id, user_id, status, amount, currency, beneficiary_name, expires_at")
    .eq("instruction_id", instructionId)
    .maybeSingle();

  if (!instruction) return NextResponse.json({ error: "Instruction not found." }, { status: 404 });
  if (instruction.user_id !== userId) return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  if (instruction.status !== "otp_pending") {
    return NextResponse.json({ error: "This instruction is not awaiting authorisation." }, { status: 400 });
  }
  if (new Date(instruction.expires_at) < new Date()) {
    return NextResponse.json({ error: "This instruction has expired. Please start again." }, { status: 400 });
  }

  // Invalidate any previous unused OTPs for this instruction.
  await supabaseServer
    .from("transaction_otps")
    .update({ used: true })
    .eq("user_id", userId)
    .eq("purpose", "payment_instruction:" + instructionId)
    .eq("used", false);

  const otpCode = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: otpErr } = await supabaseServer
    .from("transaction_otps")
    .insert({
      user_id: userId,
      otp_code: otpCode,
      purpose: "payment_instruction:" + instructionId,
      used: false,
      expires_at: otpExpires,
    });

  if (otpErr) return NextResponse.json({ error: otpErr.message }, { status: 500 });

  // Email the OTP, showing the customer exactly what they are authorising.
  let maskedEmail: string | null = null;
  try {
    const clerkRes = await fetch("https://api.clerk.com/v1/users/" + userId, {
      headers: { Authorization: "Bearer " + process.env.CLERK_SECRET_KEY },
    });
    const clerkUser = await clerkRes.json();
    const email = clerkUser.email_addresses?.[0]?.email_address;
    const name = ((clerkUser.first_name || "") + " " + (clerkUser.last_name || "")).trim() || "Customer";

    if (email) {
      const [local, domain] = email.split("@");
      maskedEmail = local.slice(0, 2) + "•••@" + domain;

      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: email,
        subject: "KYA — Authorise Payment: " + instructionId,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#080C14;color:#E8E0D0;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1A2540,#0D1420);padding:32px 40px;border-bottom:2px solid #C9A84C;">
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#E8E0D0;font-family:Georgia,serif;">KY<span style="color:#C9A84C;">A</span></h1>
              <p style="margin:4px 0 0;font-size:11px;color:#4A5568;text-transform:uppercase;letter-spacing:0.15em;">Payment Authorisation</p>
            </div>
            <div style="padding:36px 40px;">
              <p style="font-size:15px;color:#E8E0D0;margin:0 0 16px;">Hi ${name},</p>
              <p style="font-size:14px;color:#8A9AB5;line-height:1.7;margin:0 0 20px;">
                You are authorising the following payment. Use the code below to confirm. If you did not initiate this, do not share the code and contact us immediately.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.08);border-radius:8px;margin:0 0 20px;">
                <tr><td style="padding:10px 16px;font-size:12px;color:#4A5568;background:#0D1420;">Instruction</td><td style="padding:10px 16px;font-size:13px;color:#E8E0D0;background:#0D1420;">${instructionId}</td></tr>
                <tr><td style="padding:10px 16px;font-size:12px;color:#4A5568;">Beneficiary</td><td style="padding:10px 16px;font-size:13px;color:#E8E0D0;">${instruction.beneficiary_name}</td></tr>
                <tr><td style="padding:10px 16px;font-size:12px;color:#4A5568;background:#0D1420;">Amount</td><td style="padding:10px 16px;font-size:14px;font-weight:700;color:#C9A84C;background:#0D1420;">${Number(instruction.amount).toLocaleString()} ${instruction.currency}</td></tr>
              </table>
              <div style="background:#080C14;border:2px solid #C9A84C;border-radius:12px;padding:28px;text-align:center;">
                <p style="font-size:44px;font-weight:900;color:#C9A84C;letter-spacing:0.2em;margin:0;font-family:monospace;">${otpCode}</p>
                <p style="font-size:12px;color:#4A5568;margin:10px 0 0;">Expires in 10 minutes</p>
              </div>
            </div>
            <div style="background:#0D1420;padding:20px 40px;border-top:1px solid rgba(201,168,76,0.2);">
              <p style="margin:0;font-size:11px;color:#4A5568;line-height:1.7;">KYA Digital Services does not hold or move funds. Payment is executed by your bank under your authorisation.</p>
            </div>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error("Payment OTP email error:", err);
  }

  return NextResponse.json({ success: true, sentTo: maskedEmail, expiresAt: otpExpires });
}