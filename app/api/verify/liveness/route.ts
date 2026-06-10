import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { imageBase64 } = await req.json();
  if (!imageBase64) return NextResponse.json({ error: "Image is required" }, { status: 400 });

  const appId = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_APP_ID_TEST!
    : process.env.DOJAH_APP_ID!;
  const privateKey = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_PRIVATE_KEY_TEST!
    : process.env.DOJAH_PRIVATE_KEY!;

  try {
    const dojahRes = await fetch("https://api.dojah.io/api/v1/ml/liveness", {
      method: "POST",
      headers: {
        "AppId": appId,
        "Authorization": privateKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    const dojahData = await dojahRes.json();

    if (!dojahRes.ok || dojahData.error) {
      await supabaseServer.from("kyc_profiles").update({
        liveness_status: "failed",
        liveness_checked_at: new Date().toISOString(),
      }).eq("user_id", userId);

      return NextResponse.json({
        passed: false,
        status: "failed",
        message: "Liveness check failed. Please try again with a clear photo.",
      });
    }

    const liveness = dojahData.entity?.liveness;
    const passed = liveness?.liveness_check === true;
    const probability = liveness?.liveness_probability || 0;
    const status = passed ? "passed" : "failed";

    await supabaseServer.from("kyc_profiles").update({
      liveness_status: status,
      liveness_probability: probability,
      liveness_checked_at: new Date().toISOString(),
      ...(passed === false && {
        risk_rating: "high",
        risk_notes: "Liveness check failed during onboarding",
      }),
    }).eq("user_id", userId);

    return NextResponse.json({
      passed,
      status,
      probability,
      message: passed
        ? "Liveness check passed successfully."
        : "Liveness check failed. Please ensure you are using a real photo of yourself.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Liveness check failed";
    console.error("Dojah liveness error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}