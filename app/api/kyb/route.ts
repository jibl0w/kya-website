import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();

  const { data: kybProfile, error } = await supabase
    .from("kyb_profiles")
    .insert([
      {
        user_id: userId,
        company_name: body.company_name,
        cac_number: body.cac_number,
        tin: body.tin,
        business_type: body.business_type,
        registered_address: body.registered_address,
        company_email: body.company_email,
        representative_title: body.representative_title,
        representative_name: body.representative_name,
        representative_email: body.representative_email,
        representative_phone: body.representative_phone,
        kyb_status: "submitted",
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (kybProfile) {
    await supabase.from("directors").insert([
      {
        kyb_id: kybProfile.id,
        title: "",
        full_name: body.director_name,
        email: body.director_email,
        phone: body.director_phone,
        address: "",
        is_primary: true,
        kyc_linked: false,
      },
    ]);
  }

  const { error: profileError } = await supabase.from("profiles").insert([
    {
      user_id: userId,
      onboarding_status: "kyb_submitted",
    },
  ]);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}