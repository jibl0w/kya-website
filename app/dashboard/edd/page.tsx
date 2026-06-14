import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { signDocumentUrls } from "@/lib/signed-url";
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

  // Convert stored file paths into time-limited signed URLs before sending to the browser
  const signedEddDocuments = await signDocumentUrls(eddDocuments || []);

  return (
    <EddClient
      eddRequests={eddRequests || []}
      eddDocuments={signedEddDocuments}
    />
  );
}