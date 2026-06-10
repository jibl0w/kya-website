import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { nin, first_name, last_name, dob } = await req.json();

  if (!nin) return NextResponse.json({ error: "NIN is required" }, { status: 400 });

  const appId = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_APP_ID_TEST!
    : process.env.DOJAH_APP_ID!;
  const privateKey = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_PRIVATE_KEY_TEST!
    : process.env.DOJAH_PRIVATE_KEY!;

  try {
    const dojahRes = await fetch(
      `https://api.dojah.io/api/v1/kyc/nin?nin=${nin}`,
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
        .from("kyc_profiles")
        .update({
          nin_verification_status: "failed",
          nin_verification_response: JSON.stringify(dojahData),
          nin_verified_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      return NextResponse.json({
        verified: false,
        status: "failed",
        message: "NIN verification failed. Please check your NIN and try again.",
      });
    }

    const ninData = dojahData.entity;

    let nameMatch = true;
    let dobMatch = true;

    if (first_name && ninData?.first_name) {
      const fnMatch =
        ninData.first_name.toLowerCase().includes(first_name.toLowerCase()) ||
        first_name.toLowerCase().includes(ninData.first_name.toLowerCase());
      const lnMatch = last_name
        ? ninData.last_name?.toLowerCase().includes(last_name.toLowerCase()) ||
          last_name.toLowerCase().includes(ninData.last_name?.toLowerCase())
        : true;
      nameMatch = fnMatch && lnMatch;
    }

    if (dob && ninData?.date_of_birth) {
      dobMatch =
        ninData.date_of_birth === dob ||
        new Date(ninData.date_of_birth).toISOString().split("T")[0] === dob;
    }

    const verificationStatus = nameMatch && dobMatch ? "verified" : "mismatch";

    await supabaseServer
      .from("kyc_profiles")
      .update({
        nin_verification_status: verificationStatus,
        nin_verified_name: (ninData?.first_name || "") + " " + (ninData?.last_name || ""),
        nin_verification_response: JSON.stringify({ status: verificationStatus, nameMatch, dobMatch }),
        nin_verified_at: new Date().toISOString(),
        ...(verificationStatus === "mismatch" && {
          risk_rating: "high",
          risk_notes: "NIN name or date of birth mismatch detected at onboarding",
        }),
      })
      .eq("user_id", userId);

    return NextResponse.json({
      verified: verificationStatus === "verified",
      status: verificationStatus,
      message:
        verificationStatus === "verified"
          ? "NIN verified successfully"
          : "NIN details do not match your submitted information. Your account has been flagged for manual review.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "NIN verification failed";
    console.error("Dojah NIN error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}