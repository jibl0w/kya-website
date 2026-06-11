import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { tin, company_name } = await req.json();

  if (!tin) return NextResponse.json({ error: "TIN is required" }, { status: 400 });

  const appId = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_APP_ID_TEST!
    : process.env.DOJAH_APP_ID!;
  const privateKey = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_PRIVATE_KEY_TEST!
    : process.env.DOJAH_PRIVATE_KEY!;

  try {
    const dojahRes = await fetch(
      `https://api.dojah.io/api/v1/kyc/tin?tin=${tin}`,
      {
        method: "GET",
        headers: {
          "AppId": appId,
          "Authorization": privateKey,
          "Content-Type": "application/json",
        },
      }
    );

    const dojahData = await dojahRes.json();

    if (!dojahRes.ok || dojahData.error) {
      await supabaseServer
        .from("kyb_profiles")
        .update({
          tin_verification_status: "failed",
          tin_verified_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      return NextResponse.json({
        verified: false,
        status: "failed",
        message: "TIN verification failed. Please check your TIN and try again.",
      });
    }

    const tinData = dojahData.entity;

    // Cross-check company name if provided
    let nameMatch = true;
    if (company_name && tinData?.company_name) {
      nameMatch =
        tinData.company_name.toLowerCase().includes(company_name.toLowerCase()) ||
        company_name.toLowerCase().includes(tinData.company_name.toLowerCase());
    }

    const verificationStatus = nameMatch ? "verified" : "mismatch";

    await supabaseServer
      .from("kyb_profiles")
      .update({
        tin_verification_status: verificationStatus,
        tin_verified_name: tinData?.company_name || tinData?.name || null,
        tin_verified_at: new Date().toISOString(),
        ...(verificationStatus === "mismatch" && {
          risk_rating: "high",
          risk_notes: "TIN company name mismatch detected at onboarding",
        }),
      })
      .eq("user_id", userId);

    return NextResponse.json({
      verified: verificationStatus === "verified",
      status: verificationStatus,
      message: verificationStatus === "verified"
        ? "TIN verified successfully"
        : "TIN company name does not match. Your account has been flagged for review.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "TIN verification failed";
    console.error("Dojah TIN error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}