import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { bvn, first_name, last_name, dob } = await req.json();

  if (!bvn) return NextResponse.json({ error: "BVN is required" }, { status: 400 });

  try {
const isSandbox = process.env.DOJAH_ENV === "sandbox";
    const appId = isSandbox ? process.env.DOJAH_APP_ID_TEST! : process.env.DOJAH_APP_ID!;
    const privateKey = isSandbox ? process.env.DOJAH_PRIVATE_KEY_TEST! : process.env.DOJAH_PRIVATE_KEY!;

    const dojahRes = await fetch(
      `https://sandbox.dojah.io/api/v1/kyc/bvn?bvn=${bvn}`,
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
          bvn_verification_status: "failed",
          bvn_verification_response: JSON.stringify(dojahData),
          bvn_verified_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      return NextResponse.json({
        verified: false,
        status: "failed",
        message: "BVN verification failed. Please check your BVN and try again.",
      });
    }

    const bvnData = dojahData.entity;

    let nameMatch = true;
    let dobMatch = true;

    if (first_name && bvnData?.first_name) {
      const fnMatch =
        bvnData.first_name.toLowerCase().includes(first_name.toLowerCase()) ||
        first_name.toLowerCase().includes(bvnData.first_name.toLowerCase());
      const lnMatch = last_name
        ? bvnData.last_name?.toLowerCase().includes(last_name.toLowerCase()) ||
          last_name.toLowerCase().includes(bvnData.last_name?.toLowerCase())
        : true;
      nameMatch = fnMatch && lnMatch;
    }

    if (dob && bvnData?.date_of_birth) {
      dobMatch =
        bvnData.date_of_birth === dob ||
        new Date(bvnData.date_of_birth).toISOString().split("T")[0] === dob;
    }

    const verificationStatus = nameMatch && dobMatch ? "verified" : "mismatch";

    await supabaseServer
      .from("kyc_profiles")
      .update({
        bvn_verification_status: verificationStatus,
        bvn_verified_name: (bvnData?.first_name || "") + " " + (bvnData?.last_name || ""),
        bvn_verified_dob: bvnData?.date_of_birth,
        bvn_verification_response: JSON.stringify({ status: verificationStatus, nameMatch, dobMatch }),
        bvn_verified_at: new Date().toISOString(),
        ...(verificationStatus === "mismatch" && {
          risk_rating: "high",
          risk_notes: "BVN name or date of birth mismatch detected at onboarding",
        }),
      })
      .eq("user_id", userId);

    return NextResponse.json({
      verified: verificationStatus === "verified",
      status: verificationStatus,
      message:
        verificationStatus === "verified"
          ? "BVN verified successfully"
          : "BVN details do not match your submitted information. Your account has been flagged for manual review.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "BVN verification failed";
    console.error("Dojah BVN error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}