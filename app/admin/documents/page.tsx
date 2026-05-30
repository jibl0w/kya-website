import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase-server";
import AdminDocumentsClient from "./AdminDocumentsClient";

const ADMIN_IDS = process.env.ADMIN_USER_IDS?.split(",") || [];

export default async function AdminDocumentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!ADMIN_IDS.includes(userId)) redirect("/dashboard");

  const { data: documents } = await supabaseServer
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  const { data: transactionDocuments } = await supabaseServer
    .from("transaction_documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  const { data: transactions } = await supabaseServer
    .from("transactions")
    .select("id, transaction_ref, supplier_name, form_m_number, lc_number, total_value, currency");

  const { data: kycProfiles } = await supabaseServer
    .from("kyc_profiles")
    .select("user_id, first_name, last_name, address, nationality, id_type, id_number, phone, email");

  const { data: kybProfiles } = await supabaseServer
    .from("kyb_profiles")
    .select("user_id, company_name, cac_number, tin, business_type, registered_address, company_email, representative_title, representative_name, representative_email, representative_phone");

  return (
    <AdminDocumentsClient
      documents={documents || []}
      transactionDocuments={transactionDocuments || []}
      transactions={transactions || []}
      kycProfiles={kycProfiles || []}
      kybProfiles={kybProfiles || []}
    />
  );
}