import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import KycForm from "./KycForm";

export default async function KYCPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: kyc } = await supabaseServer
    .from("kyc_profiles")
    .select("kyc_status")
    .eq("user_id", userId)
    .maybeSingle();

  // Block access if already verified or under review.
  // Allow only when not started or previously rejected (retry).
  if (kyc?.kyc_status === "approved" || kyc?.kyc_status === "pending") {
    redirect("/dashboard/onboarding");
  }

  return <KycForm />;
}