import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();

  const { error } = await supabase.from("kyc_profiles").insert([
    {
      user_id: userId,
      title: body.title,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      dob: body.dob || null,
      nationality: body.nationality,
      address: body.address,
      id_type: body.id_type,
      id_number: body.id_number,
      liveness_status: "pending",
      verification_provider: null,
      provider_reference_id: null,
      kyc_status: "submitted",
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("profiles").insert({
    user_id: userId,
    onboarding_status: "kyc_submitted",
  });

  return NextResponse.json({ success: true });
}