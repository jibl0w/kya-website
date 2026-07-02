import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import OnboardingWithTerms from "./OnboardingWithTerms";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [{ data: kyc }, { data: kyb }] = await Promise.all([
    supabaseServer.from("kyc_profiles").select("kyc_status").eq("user_id", userId).maybeSingle(),
    supabaseServer.from("kyb_profiles").select("kyb_status").eq("user_id", userId).maybeSingle(),
  ]);

  return (
    <OnboardingWithTerms
      kycStatus={kyc?.kyc_status || null}
      kybStatus={kyb?.kyb_status || null}
    />
  );
}