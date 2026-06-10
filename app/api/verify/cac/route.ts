import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { rc_number, company_name } = await req.json();

  if (!rc_number) return NextResponse.json({ error: "RC number is required" }, { status: 400 });

  const appId = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_APP_ID_TEST!
    : process.env.DOJAH_APP_ID!;
  const privateKey = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_PRIVATE_KEY_TEST!
    : process.env.DOJAH_PRIVATE_KEY!;

  try {
    const dojahRes = await fetch(
      `https://api.dojah.io/api/v1/kyc/cac?rc_number=${rc_number}`,
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
          cac_verification_status: "failed",
          cac_verification_response: JSON.stringify(dojahData),
          cac_verified_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      return NextResponse.json({
        verified: false,
        status: "failed",
        message: "CAC verification failed. Please check your RC number and try again.",
      });
    }

    const cacData = dojahData.entity;

    let nameMatch = true;
    if (company_name && cacData?.company_name) {
      nameMatch =
        cacData.company_name.toLowerCase().includes(company_name.toLowerCase()) ||
        company_name.toLowerCase().includes(cacData.company_name.toLowerCase());
    }

    const verificationStatus = nameMatch ? "verified" : "mismatch";

    await supabaseServer
      .from("kyb_profiles")
      .update({
        cac_verification_status: verificationStatus,
        cac_verified_name: cacData?.company_name || "",
        cac_verification_response: JSON.stringify({ status: verificationStatus, nameMatch }),
        cac_verified_at: new Date().toISOString(),
        ...(verificationStatus === "mismatch" && {
          risk_rating: "high",
          risk_notes: "CAC company name mismatch detected at onboarding",
        }),
      })
      .eq("user_id", userId);

    return NextResponse.json({
      verified: verificationStatus === "verified",
      status: verificationStatus,
      company_name: cacData?.company_name,
      message:
        verificationStatus === "verified"
          ? "CAC registration verified successfully"
          : "CAC company name does not match your submitted information. Your account has been flagged for manual review.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "CAC verification failed";
    console.error("Dojah CAC error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}