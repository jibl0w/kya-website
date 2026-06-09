import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import EddClient from "./EddClient";

export default async function EddPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: eddRequests } = await supabaseServer
    .from("edd_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: eddDocuments } = await supabaseServer
    .from("edd_documents")
    .select("*")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });

  return (
    <EddClient
      eddRequests={eddRequests || []}
      eddDocuments={eddDocuments || []}
    />
  );
}