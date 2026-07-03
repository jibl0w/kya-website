import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [{ data: kyc }, { data: kyb }] = await Promise.all([
    supabaseServer.from("kyc_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabaseServer.from("kyb_profiles").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  return <ProfileClient kyc={kyc || null} kyb={kyb || null} />;
}