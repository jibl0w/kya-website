import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase-server";
import AdminTransactionsClient from "./AdminTransactionsClient";

const ADMIN_IDS = process.env.ADMIN_USER_IDS?.split(",") || [];

export default async function AdminTransactionsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!ADMIN_IDS.includes(userId)) redirect("/dashboard");

  const { data: transactions } = await supabaseServer
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: steps } = await supabaseServer
    .from("transaction_steps")
    .select("*")
    .order("step_number", { ascending: true });

  const { data: transactionDocs } = await supabaseServer
    .from("transaction_documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  const { data: kycProfiles } = await supabaseServer
    .from("kyc_profiles")
    .select("user_id, first_name, last_name, address, nationality, phone, email");

  const { data: kybProfiles } = await supabaseServer
    .from("kyb_profiles")
    .select("user_id, company_name, cac_number, registered_address, representative_title, representative_name, representative_phone, representative_email, company_email");

  return (
    <AdminTransactionsClient
      transactions={transactions || []}
      steps={steps || []}
      transactionDocs={transactionDocs || []}
      kycProfiles={kycProfiles || []}
      kybProfiles={kybProfiles || []}
    />
  );
}