import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { otpCode, purpose, transactionId } = await req.json();

  if (!otpCode || !purpose) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: otp } = await supabaseServer
    .from("transaction_otps")
    .select("*")
    .eq("user_id", userId)
    .eq("otp_code", otpCode)
    .eq("purpose", purpose)
    .eq("used", false)
    .maybeSingle();

  if (!otp) {
    return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
  }

  if (new Date(otp.expires_at) < new Date()) {
    return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
  }

  // Mark OTP as used
  await supabaseServer
    .from("transaction_otps")
    .update({ used: true })
    .eq("id", otp.id);

  return NextResponse.json({ success: true, verified: true });
}