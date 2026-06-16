import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import crypto from "crypto";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { instructionId, otpCode } = await req.json();
  if (!instructionId || !otpCode) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  // Load the instruction; confirm ownership and state.
  const { data: instruction } = await supabaseServer
    .from("payment_instructions")
    .select("id, instruction_id, user_id, status, instruction_hash, expires_at")
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

  // Find the matching, unused, unexpired OTP for this specific instruction.
  const { data: otp } = await supabaseServer
    .from("transaction_otps")
    .select("*")
    .eq("user_id", userId)
    .eq("otp_code", otpCode)
    .eq("purpose", "payment_instruction:" + instructionId)
    .eq("used", false)
    .maybeSingle();

  if (!otp) {
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }
  if (new Date(otp.expires_at) < new Date()) {
    return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
  }

  // Consume the OTP.
  await supabaseServer.from("transaction_otps").update({ used: true }).eq("id", otp.id);

  // Compute the OTP attestation hash: binds THIS otp event to THIS instruction's
  // content hash. Proves the customer authorised exactly this instruction.
  const verifiedAt = new Date().toISOString();
  const attestation = crypto
    .createHash("sha256")
    .update(
      [instruction.instruction_id, instruction.instruction_hash, userId, otp.id, verifiedAt].join("::")
    )
    .digest("hex");

  // Advance the instruction to otp_verified, recording the attestation.
  const { error: updErr } = await supabaseServer
    .from("payment_instructions")
    .update({
      status: "otp_verified",
      otp_attestation_hash: attestation,
      otp_verified_at: verifiedAt,
    })
    .eq("id", instruction.id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ success: true, verified: true, status: "otp_verified" });
}