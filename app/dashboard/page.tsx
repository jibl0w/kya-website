import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

const ADMIN_IDS = process.env.ADMIN_USER_IDS?.split(",") || [];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const isAdmin = ADMIN_IDS.includes(userId);

  const { data: kycProfile } = await supabaseServer
    .from("kyc_profiles")
    .select("id, first_name, last_name")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: kybProfile } = await supabaseServer
    .from("kyb_profiles")
    .select("id, company_name")
    .eq("user_id", userId)
    .maybeSingle();

  const accountType = kycProfile ? "personal" : kybProfile ? "business" : null;
  const displayName = kycProfile?.first_name || kybProfile?.company_name || null;

  const { data: documents } = await supabaseServer
    .from("documents")
    .select("document_type, status, verification_status, rejection_reason")
    .eq("user_id", userId);

  const { data: transactions } = await supabaseServer
    .from("transactions")
    .select("id, transaction_ref, supplier_name, supplier_category, total_value, currency, status, current_step, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const docs = documents || [];
  const txns = transactions || [];

  const getStatus = (doc: any) => doc.status || doc.verification_status || "pending";
  const totalDocs = docs.length;
  const approvedDocs = docs.filter(d => getStatus(d) === "approved").length;
  const rejectedDocs = docs.filter(d => getStatus(d) === "rejected").length;
  const pendingDocs = docs.filter(d => getStatus(d) === "pending").length;
  const rejectedList = docs.filter(d => getStatus(d) === "rejected");

  const KYC_REQUIRED = 5;
  const KYB_REQUIRED = 5;
  const requiredCount = accountType === "personal" ? KYC_REQUIRED : accountType === "business" ? KYB_REQUIRED : 0;
  const allApproved = requiredCount > 0 && approvedDocs >= requiredCount;
  const hasRejections = rejectedDocs > 0;
  const hasSubmitted = totalDocs > 0;

  const getVerificationLabel = () => {
    if (allApproved) return "Verified";
    if (hasRejections) return "Action Required";
    if (hasSubmitted) return "Under Review";
    if (accountType) return "Docs Needed";
    return "Not Started";
  };

  const getVerificationColor = () => {
    if (allApproved) return "text-emerald-400";
    if (hasRejections) return "text-red-400";
    if (hasSubmitted) return "text-amber-400";
    return "text-slate-400";
  };

  const stepNames: Record<number, string> = {
    1: "KYC / KYB",
    2: "Supplier Selection",
    3: "Form M",
    4: "Naira Funding",
    5: "LC Issuance",
    6: "Pre-Shipment",
    7: "Shipment",
    8: "FX Processing",
    9: "USD Credit",
    10: "Payment",
    11: "Settlement",
    12: "LC Discharge",
    13: "Complete",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-6">
            <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
            <nav className="hidden md:flex items-center gap-5">
              <Link href="/dashboard/documents" className="text-sm text-slate-400 hover:text-white transition">
                Documents
              </Link>
              <Link href="/dashboard/onboarding" className="text-sm text-slate-400 hover:text-white transition">
                Onboarding
              </Link>
              <Link href="/dashboard/suppliers" className="text-sm text-slate-400 hover:text-white transition">
                Suppliers
              </Link>
              {allApproved && (
                <Link href="/transactions/new" className="text-sm text-slate-400 hover:text-white transition">
                  New Transaction
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <div className="flex gap-2">
                <Link
                  href="/admin/documents"
                  className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition"
                >
                  Documents
                </Link>
                <Link
                  href="/admin/transactions"
                  className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition"
                >
                  Transactions
                </Link>
              </div>
            )}
            <UserButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-8 py-10">

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-1">Customer Portal</p>
          <h1 className="text-4xl font-black">
            {displayName ? "Welcome, " + displayName : "Trade Dashboard"}
          </h1>
          <p className="mt-2 text-slate-400">Your secure environment for cross-border trade management.</p>
        </div>

        {/* REJECTED DOCUMENTS ALERT */}
        {hasRejections && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-1">Action Required</p>
            <h2 className="text-lg font-bold mb-3">
              {rejectedDocs} document{rejectedDocs > 1 ? "s were" : " was"} rejected
            </h2>
            <div className="flex flex-col gap-2 mb-4">
              {rejectedList.map((doc: any, i: number) => (
                <div key={i} className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <p className="text-sm font-medium text-white">{doc.document_type}</p>
                  {doc.rejection_reason && (
                    <p className="text-xs text-red-300 mt-1">Reason: {doc.rejection_reason}</p>
                  )}
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/documents"
              className="inline-block rounded-xl bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-400 transition"
            >
              Re-upload Documents →
            </Link>
          </div>
        )}

        {/* VERIFIED BANNER */}
        {allApproved && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Account Verified</p>
            <h2 className="text-lg font-bold">
              Your account is fully verified. You can now initiate trade transactions.
            </h2>
          </div>
        )}

        {/* ONBOARDING BANNER */}
        {!allApproved && !hasRejections && (
          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                  {hasSubmitted ? "Under Review" : "Action Required"}
                </p>
                <h2 className="mt-1 text-lg font-bold">
                  {hasSubmitted
                    ? "Your documents are being reviewed"
                    : !accountType
                    ? "Complete your onboarding to start trading"
                    : "Upload your verification documents"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {hasSubmitted
                    ? "Our compliance team reviews within 2 business days."
                    : !accountType
                    ? "Select personal or business account and complete verification."
                    : accountType === "personal"
                    ? "Upload your NIN, BVN, government ID, proof of address, and selfie."
                    : "Upload your CAC documents, director ID, and financial statements."}
                </p>
              </div>
              {!hasSubmitted && (
                <div className="flex gap-3 flex-shrink-0 flex-wrap">
                  {!accountType ? (
                    <Link
                      href="/dashboard/onboarding"
                      className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition"
                    >
                      Begin Verification
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/documents"
                      className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition"
                    >
                      Upload Documents
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { step: "01", label: accountType === "business" ? "Business KYB" : "Identity Verification", done: !!accountType },
                { step: "02", label: "Source of Funds", done: !!accountType },
                { step: "03", label: "Document Upload", done: hasSubmitted },
                { step: "04", label: "Account Activated", done: allApproved },
              ].map(s => (
                <div key={s.step} className={"rounded-xl border p-4 " + (s.done ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5")}>
                  <p className="font-mono text-xs text-slate-500">{s.step}</p>
                  <p className="mt-1 text-sm font-medium text-white">{s.label}</p>
                  <p className={"mt-2 text-xs font-medium " + (s.done ? "text-emerald-400" : "text-amber-400")}>
                    {s.done ? "✓ Complete" : "Not started"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAT CARDS */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Account Type</p>
            <h2 className="mt-4 text-2xl font-black">
              {accountType === "personal" ? "Personal" : accountType === "business" ? "Business" : "—"}
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              {accountType === "personal" ? "KYC Verification" : accountType === "business" ? "KYB Verification" : "Not selected"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Verification</p>
            <h2 className={"mt-4 text-2xl font-black " + getVerificationColor()}>
              {getVerificationLabel()}
            </h2>
            <div className="mt-2 flex gap-3 text-xs flex-wrap">
              {approvedDocs > 0 && <span className="text-emerald-400">{approvedDocs} approved</span>}
              {rejectedDocs > 0 && <span className="text-red-400">{rejectedDocs} rejected</span>}
              {pendingDocs > 0 && <span className="text-amber-400">{pendingDocs} pending</span>}
              {totalDocs === 0 && <span className="text-slate-500">No docs uploaded</span>}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Transactions</p>
            <h2 className={"mt-4 text-2xl font-black " + (allApproved ? "text-white" : "text-slate-600")}>
              {txns.length}
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              {txns.length === 0 ? "No transactions yet" : txns.length + " transaction" + (txns.length > 1 ? "s" : "")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Platform Access</p>
            <h2 className={"mt-4 text-2xl font-black " + (allApproved ? "text-emerald-400" : "text-amber-400")}>
              {allApproved ? "Unlocked" : "Locked"}
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              {allApproved ? "Full access granted" : "Complete verification first"}
            </p>
          </div>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="border-b border-white/10 bg-white/5 px-6 py-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Transactions</h3>
              <p className="mt-0.5 text-xs text-slate-500">All your trade flows and current status</p>
            </div>
            {allApproved && (
              <Link
                href="/transactions/new"
                className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition"
              >
                + New Transaction
              </Link>
            )}
          </div>

          {txns.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">↗</div>
              <p className="font-semibold text-white">No transactions yet</p>
              <p className="mt-2 max-w-xs text-sm text-slate-500">
                {allApproved
                  ? "Your account is verified. Create your first trade transaction."
                  : "Complete verification to initiate trade transactions."}
              </p>
              {allApproved && (
                <Link
                  href="/transactions/new"
                  className="mt-6 rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition"
                >
                  Start Your First Trade
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-left font-mono text-xs uppercase tracking-wider text-slate-600">Reference</th>
                    <th className="px-6 py-3 text-left font-mono text-xs uppercase tracking-wider text-slate-600">Supplier</th>
                    <th className="px-6 py-3 text-left font-mono text-xs uppercase tracking-wider text-slate-600">Value</th>
                    <th className="px-6 py-3 text-left font-mono text-xs uppercase tracking-wider text-slate-600">Stage</th>
                    <th className="px-6 py-3 text-left font-mono text-xs uppercase tracking-wider text-slate-600">Status</th>
                    <th className="px-6 py-3 text-left font-mono text-xs uppercase tracking-wider text-slate-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {txns.map((txn: any) => (
                    <tr key={txn.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 font-mono text-xs text-amber-400">{txn.transaction_ref}</td>
                      <td className="px-6 py-4 text-sm text-white">{txn.supplier_name}</td>
                      <td className="px-6 py-4 text-sm text-white">
                        ${Number(txn.total_value).toLocaleString()} {txn.currency}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {stepNames[txn.current_step] || "Step " + txn.current_step}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium capitalize text-amber-400">
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={"/dashboard/transactions/" + txn.id}
                          className="text-xs text-slate-400 hover:text-amber-400 transition"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Link
            href="/dashboard/onboarding"
            className={"rounded-2xl border p-6 transition hover:border-amber-400/30 " +
              (allApproved ? "border-white/10 bg-white/5" : "border-amber-400/20 bg-amber-400/5")}
          >
            <span className="text-2xl">📋</span>
            <p className="mt-3 font-semibold text-white">
              {allApproved ? "View Onboarding" : !accountType ? "Start Onboarding" : "Continue Onboarding"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {allApproved ? "Verification complete" : "KYC or KYB verification"}
            </p>
          </Link>

          <Link
            href="/dashboard/documents"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20"
          >
            <span className="text-2xl">📄</span>
            <p className="mt-3 font-semibold text-white">Documents</p>
            <p className="mt-1 text-xs text-slate-500">
              {totalDocs > 0
                ? totalDocs + " document" + (totalDocs > 1 ? "s" : "") + " uploaded"
                : "Upload verification documents"}
            </p>
          </Link>

          <Link
            href="/dashboard/suppliers"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20"
          >
            <span className="text-2xl">🏭</span>
            <p className="mt-3 font-semibold text-white">Supplier Marketplace</p>
            <p className="mt-1 text-xs text-slate-500">Browse KYA verified suppliers</p>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition">← Back to Home</Link>
          <p className="text-xs text-slate-700">Not a PSP · Not a Bank · CAC Registered · Nigeria</p>
        </div>

      </div>
    </main>
  );
}