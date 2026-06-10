import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { idType, idNumber, first_name, last_name, dob } = await req.json();

  if (!idType || !idNumber) {
    return NextResponse.json({ error: "ID type and number are required" }, { status: 400 });
  }

  const appId = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_APP_ID_TEST!
    : process.env.DOJAH_APP_ID!;
  const privateKey = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_PRIVATE_KEY_TEST!
    : process.env.DOJAH_PRIVATE_KEY!;

  // Map ID type to Dojah endpoint and query param
  const endpointMap: Record<string, { path: string; param: string }> = {
    "Driver's Licence": { path: "/api/v1/kyc/dl", param: "license_number" },
    "Voter's Card": { path: "/api/v1/kyc/vin", param: "vin" },
    "International Passport": { path: "/api/v1/kyc/passport", param: "passport_number" },
    "National ID": { path: "/api/v1/kyc/nin", param: "nin" },
  };

  const endpoint = endpointMap[idType];
  if (!endpoint) {
    return NextResponse.json({ error: "Unsupported ID type" }, { status: 400 });
  }

  try {
    const url = `https://api.dojah.io${endpoint.path}?${endpoint.param}=${idNumber}`;
    const dojahRes = await fetch(url, {
      method: "GET",
      headers: {
        "AppId": appId,
        "Authorization": privateKey,
        "Content-Type": "application/json",
      },
    });

    const dojahData = await dojahRes.json();

    if (!dojahRes.ok || dojahData.error) {
      await supabaseServer.from("kyc_profiles").update({
        govt_id_verification_status: "failed",
        govt_id_verification_response: JSON.stringify(dojahData),
        govt_id_verified_at: new Date().toISOString(),
      }).eq("user_id", userId);

      return NextResponse.json({
        verified: false,
        status: "failed",
        message: "ID verification failed. Please check your ID number and try again.",
      });
    }

    const idData = dojahData.entity;

    // Cross-check name if provided
    let nameMatch = true;
    if (first_name && idData?.firstName) {
      const fnMatch =
        idData.firstName.toLowerCase().includes(first_name.toLowerCase()) ||
        first_name.toLowerCase().includes(idData.firstName.toLowerCase());
      const lnMatch = last_name
        ? idData.lastName?.toLowerCase().includes(last_name.toLowerCase()) ||
          last_name.toLowerCase().includes(idData.lastName?.toLowerCase())
        : true;
      nameMatch = fnMatch && lnMatch;
    }

    // Cross-check DOB if provided
    let dobMatch = true;
    if (dob && idData?.birthDate) {
      const normalizedDob = new Date(dob).toISOString().split("T")[0];
      const normalizedIdDob = new Date(idData.birthDate).toISOString().split("T")[0];
      dobMatch = normalizedDob === normalizedIdDob;
    }

    const verificationStatus = nameMatch && dobMatch ? "verified" : "mismatch";
    const verifiedName = [idData?.firstName, idData?.middleName, idData?.lastName]
      .filter(Boolean).join(" ");

    await supabaseServer.from("kyc_profiles").update({
      govt_id_verification_status: verificationStatus,
      govt_id_verified_name: verifiedName || null,
      govt_id_verification_response: JSON.stringify({ status: verificationStatus, nameMatch, dobMatch }),
      govt_id_verified_at: new Date().toISOString(),
      ...(verificationStatus === "mismatch" && {
        risk_rating: "high",
        risk_notes: `Government ID name or DOB mismatch — ${idType}`,
      }),
    }).eq("user_id", userId);

    return NextResponse.json({
      verified: verificationStatus === "verified",
      status: verificationStatus,
      verifiedName,
      message: verificationStatus === "verified"
        ? `${idType} verified successfully`
        : `${idType} details do not match your submitted information. Your account has been flagged for review.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ID verification failed";
    console.error("Dojah govt ID error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}