import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { selfieBase64, idImageBase64 } = await req.json();
  if (!selfieBase64 || !idImageBase64) {
    return NextResponse.json({ error: "Both selfie and ID image are required" }, { status: 400 });
  }

  const appId = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_APP_ID_TEST!
    : process.env.DOJAH_APP_ID!;
  const privateKey = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_PRIVATE_KEY_TEST!
    : process.env.DOJAH_PRIVATE_KEY!;

  try {
    const dojahRes = await fetch("https://api.dojah.io/api/v1/ml/face-match", {
      method: "POST",
      headers: {
        "AppId": appId,
        "Authorization": privateKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_one: selfieBase64,
        image_two: idImageBase64,
      }),
    });

    const dojahData = await dojahRes.json();

    if (!dojahRes.ok || dojahData.error) {
      await supabaseServer.from("kyc_profiles").update({
        face_match_status: "failed",
        face_match_checked_at: new Date().toISOString(),
      }).eq("user_id", userId);

      return NextResponse.json({
        matched: false,
        status: "failed",
        message: "Face match check failed. Please try again.",
      });
    }

    const confidence = dojahData.entity?.confidence || 0;
    const matched = confidence >= 70;
    const status = matched ? "matched" : "mismatch";

    await supabaseServer.from("kyc_profiles").update({
      face_match_status: status,
      face_match_confidence: confidence,
      face_match_checked_at: new Date().toISOString(),
      ...(status === "mismatch" && {
        risk_rating: "high",
        risk_notes: `Face match failed — confidence score: ${confidence.toFixed(1)}%`,
      }),
    }).eq("user_id", userId);

    return NextResponse.json({
      matched,
      status,
      confidence,
      message: matched
        ? `Face match passed with ${confidence.toFixed(1)}% confidence.`
        : `Face does not match ID document. Confidence: ${confidence.toFixed(1)}%.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Face match failed";
    console.error("Dojah face match error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}