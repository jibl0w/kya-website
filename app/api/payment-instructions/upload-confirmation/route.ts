import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Customer uploads their own payment confirmation (the second corroborating
// source). When both the bank notification AND the customer upload are present,
// reconciliation runs. Accepts either order; neither blocks the other.

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const instructionId = formData.get("instructionId") as string | null;

  if (!file || !instructionId) {
    return NextResponse.json({ error: "Missing file or instruction." }, { status: 400 });
  }

  // Load + verify ownership.
  const { data: instruction } = await supabaseServer
    .from("payment_instructions")
    .select("id, instruction_id, user_id, status")
    .eq("instruction_id", instructionId)
    .maybeSingle();

  if (!instruction) return NextResponse.json({ error: "Instruction not found." }, { status: 404 });
  if (instruction.user_id !== userId) return NextResponse.json({ error: "Not authorised." }, { status: 403 });

  // Store the file in the private documents bucket (path, not public URL).
  const ext = file.name.split(".").pop() || "bin";
  const path = `payment-confirmations/${userId}/${instructionId}-${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadErr } = await supabaseServer.storage
    .from("kya-documents")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadErr) return NextResponse.json({ error: "Upload failed: " + uploadErr.message }, { status: 500 });

  // Record the customer-upload confirmation (second reconciliation source).
  await supabaseServer.from("payment_confirmations").insert({
    instruction_id: instructionId,
    source: "customer_upload",
    document_path: path,
    reconciliation_status: "pending",
  });

  // --- Reconciliation: do we now have BOTH sources? ---
  const { data: confirmations } = await supabaseServer
    .from("payment_confirmations")
    .select("source")
    .eq("instruction_id", instructionId);

  const hasBank = (confirmations || []).some((c) => c.source === "bank_notification");
  const hasCustomer = (confirmations || []).some((c) => c.source === "customer_upload");

  let reconciled = false;
  if (hasBank && hasCustomer) {
    // Both present → mark matched and settle.
    await supabaseServer
      .from("payment_confirmations")
      .update({ reconciliation_status: "matched" })
      .eq("instruction_id", instructionId);

    await supabaseServer
      .from("payment_instructions")
      .update({ status: "reconciled" })
      .eq("id", instruction.id);

    // Then settle (record-keeping state — no money movement by KYA).
    await supabaseServer
      .from("payment_instructions")
      .update({ status: "settled" })
      .eq("id", instruction.id);

    reconciled = true;
  } else {
    // Only customer upload so far → await bank notification.
    await supabaseServer
      .from("payment_instructions")
      .update({ status: "confirmation_pending" })
      .eq("id", instruction.id);
  }

  return NextResponse.json({
    success: true,
    reconciled,
    status: reconciled ? "settled" : "confirmation_pending",
  });
}