"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type AccountType = "personal" | "business" | "unknown" | null;
type DocStatus = "pending" | "approved" | "rejected" | "not_uploaded";

interface DocumentRecord {
  id: string;
  document_type: string;
  file_url: string;
  verification_status: string;
  status: string;
  rejection_reason?: string;
  uploaded_at: string;
  version?: number;
  file_name?: string;
}

const KYC_DOCUMENTS = [
  { key: "nin", label: "NIN — National Identification Number", hint: "Clear photo or scan of your NIN slip" },
  { key: "bvn_confirmation", label: "BVN Confirmation", hint: "Screenshot or document showing your Bank Verification Number" },
  { key: "government_id", label: "Government-Issued ID", hint: "Passport, driver's licence, or national ID — valid and not expired" },
  { key: "proof_of_address", label: "Proof of Address", hint: "Utility bill or bank statement — not older than 3 months" },
  { key: "selfie_with_id", label: "Selfie Holding ID", hint: "Clear photo of your face holding your government ID document" },
];

const KYB_DOCUMENTS = [
  { key: "cac_certificate", label: "CAC Certificate of Incorporation", hint: "Official certificate issued by Corporate Affairs Commission" },
  { key: "memart", label: "Memorandum & Articles of Association", hint: "Full MEMART document as filed with CAC" },
  { key: "cac_form_1_1", label: "CAC Form 1.1 — Directors & Shareholders", hint: "Current Form 1.1 showing all directors and shareholders" },
  { key: "director_id", label: "Director Government-Issued ID", hint: "Valid ID for primary director — passport, NIN, or driver's licence" },
  { key: "financial_statements", label: "Financial Statements or Bank Statements", hint: "Last 3 years audited financials or last 3 months bank statements" },
];

const statusConfig = {
  approved: { label: "Approved", color: "text-emerald-400", bg: "border-emerald-500/30 bg-emerald-500/10", dot: "bg-emerald-400" },
  rejected: { label: "Rejected", color: "text-red-400", bg: "border-red-500/30 bg-red-500/10", dot: "bg-red-400" },
  pending: { label: "Pending Review", color: "text-amber-400", bg: "border-amber-500/30 bg-amber-500/10", dot: "bg-amber-400" },
  not_uploaded: { label: "Not Uploaded", color: "text-slate-500", bg: "border-white/10 bg-white/5", dot: "bg-slate-600" },
};

export default function DocumentsPage() {
  const { user, isLoaded } = useUser();
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchProfile();
  }, [isLoaded, user]);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/user-profile");
      const data = await res.json();
      setAccountType(data.accountType || "unknown");
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setAccountType("unknown");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/user-profile");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Documents fetch error:", err);
    }
  }

  function getDocumentRecord(docKey: string): DocumentRecord | null {
    return documents.find((d) => d.document_type === docKey) || null;
  }

  function getDocStatus(docKey: string): DocStatus {
    const doc = getDocumentRecord(docKey);
    if (!doc) return "not_uploaded";
    return (doc.status || doc.verification_status || "pending") as DocStatus;
  }

 async function handleUpload(docKey: string, file: File) {
    if (!user) return;
    setUploading(docKey);
    setUploadSuccess(null);
    setUploadError(null);

    try {
      const existingDoc = getDocumentRecord(docKey);
      const newVersion = (existingDoc?.version || 0) + 1;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("docKey", docKey);
      formData.append("accountType", accountType || "personal");
      formData.append("existingDocId", existingDoc?.id || "null");
      formData.append("version", String(newVersion));

      const res = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      await fetchDocuments();
      setUploadSuccess(docKey);
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(docKey);
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploading(null);
    }
  }

  const DOCUMENTS = accountType === "personal" ? KYC_DOCUMENTS : KYB_DOCUMENTS;
  const totalRequired = DOCUMENTS.length;
  const totalUploaded = DOCUMENTS.filter((d) => getDocStatus(d.key) !== "not_uploaded").length;
  const totalApproved = DOCUMENTS.filter((d) => getDocStatus(d.key) === "approved").length;
  const totalRejected = DOCUMENTS.filter((d) => getDocStatus(d.key) === "rejected").length;
  const allApproved = totalApproved === totalRequired && totalRequired > 0;

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your documents...</p>
        </div>
      </main>
    );
  }

  if (accountType === "unknown") {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
        <div className="mx-auto max-w-2xl text-center py-20">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Complete Onboarding First</h1>
          <p className="text-slate-400 mb-8">
            You need to complete KYC or KYB onboarding before uploading documents.
          </p>
          <Link href="/dashboard/onboarding" className="rounded-xl bg-amber-400 px-8 py-3 font-bold text-slate-950 transition hover:bg-amber-300">
            Start Onboarding →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">← Dashboard</Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">Documents</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-4xl px-8 py-10">

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 mb-6">
          <span>{accountType === "personal" ? "👤" : "🏢"}</span>
          <span className="text-sm font-medium">
            {accountType === "personal" ? "Personal KYC Documents" : "Business KYB Documents"}
          </span>
        </div>

        <h1 className="text-3xl font-black mb-2">Upload Documents</h1>
        <p className="text-slate-400 mb-8">
          {accountType === "personal"
            ? "Upload the required documents to verify your personal identity."
            : "Upload the required documents to verify your business registration and ownership."}
        </p>

        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Required", value: totalRequired, color: "text-white" },
            { label: "Uploaded", value: totalUploaded, color: "text-amber-400" },
            { label: "Approved", value: totalApproved, color: "text-emerald-400" },
            { label: "Rejected", value: totalRejected, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {allApproved && (
          <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="font-semibold text-emerald-400">✓ All documents approved</p>
            <p className="text-sm text-slate-400 mt-1">Your documents are verified. Your account is fully activated.</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {DOCUMENTS.map((doc) => {
            const status = getDocStatus(doc.key);
            const record = getDocumentRecord(doc.key);
            const config = statusConfig[status];
            const isUploading = uploading === doc.key;
            const justSucceeded = uploadSuccess === doc.key;
            const hasError = uploadError === doc.key;

            return (
              <div key={doc.key} className={`rounded-2xl border p-6 transition ${config.bg}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${config.dot}`} />
                    <div>
                      <p className="font-semibold text-white">{doc.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{doc.hint}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                {status === "rejected" && record?.rejection_reason && (
                  <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <p className="text-xs text-red-300">
                      <span className="font-medium">Rejection reason: </span>
                      {record.rejection_reason}
                    </p>
                  </div>
                )}

                {record?.file_url && (
                  <div className="mb-4">
                    <a href={record.file_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-amber-400 hover:text-amber-300 underline">
                      View uploaded file{record.version && record.version > 1 ? ` (version ${record.version})` : ""} →
                    </a>
                  </div>
                )}

                {status !== "approved" && (
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      ref={(el) => { fileRefs.current[doc.key] = el; }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await handleUpload(doc.key, file);
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileRefs.current[doc.key]?.click()}
                      disabled={isUploading}
                      className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        status === "rejected"
                          ? "bg-red-500 text-white hover:bg-red-400"
                          : "bg-amber-400 text-slate-950 hover:bg-amber-300"
                      }`}
                    >
                      {isUploading ? "Uploading..." : status === "rejected" ? "Re-upload Document" : status === "pending" ? "Replace Document" : "Upload Document"}
                    </button>

                    {justSucceeded && <span className="text-xs text-emerald-400 font-medium">✓ Uploaded successfully</span>}
                    {hasError && <span className="text-xs text-red-400 font-medium">Upload failed — please try again</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {totalUploaded === totalRequired && !allApproved && (
          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
            <p className="font-semibold text-white mb-1">All documents uploaded</p>
            <p className="text-sm text-slate-400 mb-4">Our compliance team will review within 2 business days.</p>
            <Link href="/dashboard" className="inline-block rounded-xl bg-amber-400 px-8 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
              Return to Dashboard
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}