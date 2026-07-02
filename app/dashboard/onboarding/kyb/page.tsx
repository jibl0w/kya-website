import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import KybForm from "./KybForm";

export default async function KYBPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: kyb } = await supabaseServer
    .from("kyb_profiles")
    .select("kyb_status")
    .eq("user_id", userId)
    .maybeSingle();

  // Block access if already verified or under review.
  // Allow only when not started or previously rejected (retry).
  if (kyb?.kyb_status === "approved" || kyb?.kyb_status === "pending") {
    redirect("/dashboard/onboarding");
  }

  return <KybForm />;
}