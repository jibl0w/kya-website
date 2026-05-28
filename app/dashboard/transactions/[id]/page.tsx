"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type DocStatus = "pending" | "approved" | "rejected" | "not_uploaded";

interface TransactionDoc {
  id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  status: DocStatus;
  rejection_reason?: string;
  version: number;
}

interface Step {
  id: string;
  step_number: number;
  step_name: string;
  status: string;
}

interface Transaction {
  id: string;
  transaction_ref: string;
  supplier_name: string;
  supplier_category: string;
  product_description: string;
  quantity: string;
  unit_price: number;
  total_value: number;
  currency: string;
  port_of_destination: string;
  status: string;
  current_step: number;
  notes?: string;
  created_at: string;
}

const TRADE_DOCUMENTS = [
  { key: "proforma_invoice", label: "Proforma Invoice", hint: "Invoice from supplier confirming goods, quantity and price", required: true },
  { key: "form_m", label: "Form M Application", hint: "CBN Form M — required for all imports above $1,000", required: true },
  { key: "bill_of_lading", label: "Bill of Lading", hint: "Shipping document issued by carrier after goods are shipped", required: true },
  { key: "commercial_invoice", label: "Commercial Invoice", hint: "Final invoice from supplier for customs purposes", required: true },
  { key: "packing_list", label: "Packing List", hint: "Detailed list of all items in the shipment", required: true },
  { key: "certificate_of_origin", label: "Certificate of Origin", hint: "Document certifying country of manufacture", required: false },
];

const statusConfig = {
  approved: { label: "Approved", color: "text-emerald-400", bg: "border-emerald-500/30 bg-emerald-500/10", dot: "bg-emerald-400" },
  rejected: { label: "Rejected", color: "text-red-400", bg: "border-red-500/30 bg-red-500/10", dot: "bg-red-400" },
  pending: { label: "Pending Review", color: "text-amber-400", bg: "border-amber-500/30 bg-amber-500/10", dot: "bg-amber-400" },
  not_uploaded: { label: "Not Uploaded", color: "text-slate-500", bg: "border-white/10 bg-white/5", dot: "bg-slate-600" },
};

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [tradeDocs, setTradeDocs] = useState<TransactionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchData();
  }, [isLoaded, user, id]);

  async function fetchData() {
    try {
      const res = await fetch("/api/transactions/" + id);
      if (!res.ok) { router.push("/dashboard"); return; }
      const data = await res.json();
      setTransaction(data.transaction);
      setSteps(data.steps);
      setTradeDocs(data.tradeDocs);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  function getDoc(docKey: string): TransactionDoc | null {
    return tradeDocs.find(d => d.document_type === docKey) || null;
  }

  function getDocStatus(docKey: string): DocStatus {
    const doc = getDoc(docKey);
    if (!doc) return "not_uploaded";
    return (doc.status as DocStatus) || "pending";
  }

  async function handleUpload(docKey: string, file: File) {
    if (!user || !id) return;
    setUploading(docKey);
    setUploadSuccess(null);
    setUploadError(null);
    setErrorMessage("");

    try {
      const existingDoc = getDoc(docKey);
      const fileExt = file.name.split(".").pop();
      const fileName = user.id + "/transactions/" + id + "/" + docKey + "_" + Date.now() + "." + fileExt;

      // Upload directly from browser to Supabase storage
      const supabaseDirect = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: storageError } = await supabaseDirect.storage
        .from("kya-documents")
        .upload(fileName, file, { upsert: true });

      if (storageError) throw new Error(storageError.message);

      const { data: urlData } = supabaseDirect.storage
        .from("kya-documents")
        .getPublicUrl(fileName);

      // Save document record through API
      const res = await fetch("/api/transactions/upload-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docKey,
          transactionId: id,
          fileUrl: urlData.publicUrl,
          fileName: file.name,
          existingDocId: existingDoc?.id || null,
          version: (existingDoc?.version || 0) + 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to save document record");

      await fetchData();
      setUploadSuccess(docKey);
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Upload failed");
      setUploadError(docKey);
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploading(null);
    }
  }

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!transaction) return null;

  const totalUploaded = TRADE_DOCUMENTS.filter(d => getDocStatus(d.key) !== "not_uploaded").length;
  const totalApproved = TRADE_DOCUMENTS.filter(d => getDocStatus(d.key) === "approved").length;
  const totalRejected = TRADE_DOCUMENTS.filter(d => getDocStatus(d.key) === "rejected").length;
  const unitPrice = Number(transaction.unit_price).toLocaleString();
  const totalValue = Number(transaction.total_value).toLocaleString();
  const createdDate = new Date(transaction.created_at).toLocaleDateString("en-GB");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">Transaction</span>
          <span className="text-white/20">/</span>
          <span className="text-sm text-amber-400 font-mono">{transaction.transaction_ref}</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-5xl px-8 py-10">

        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-1">Transaction</p>
            <h1 className="text-3xl font-black">{transaction.supplier_name}</h1>
            <p className="text-slate-400 mt-1 font-mono text-sm">{transaction.transaction_ref}</p>
          </div>
          <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium capitalize text-amber-400">
            {transaction.status}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Transaction details */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="border-b border-white/10 bg-white/5 px-6 py-4">
                <h2 className="font-semibold">Transaction Details</h2>
              </div>
              <div className="divide-y divide-white/5">
                <div className="flex justify-between px-6 py-3">
                  <span className="text-sm text-slate-500">Reference</span>
                  <span className="text-sm text-white font-mono">{transaction.transaction_ref}</span>
                </div>
                <div className="flex justify-between px-6 py-3">
                  <span className="text-sm text-slate-500">Supplier</span>
                  <span className="text-sm text-white">{transaction.supplier_name}</span>
                </div>
                <div className="flex justify-between px-6 py-3">
                  <span className="text-sm text-slate-500">Category</span>
                  <span className="text-sm text-white capitalize">{transaction.supplier_category}</span>
                </div>
                <div className="flex justify-between px-6 py-3">
                  <span className="text-sm text-slate-500">Product</span>
                  <span className="text-sm text-white text-right max-w-xs">{transaction.product_description}</span>
                </div>
                <div className="flex justify-between px-6 py-3">
                  <span className="text-sm text-slate-500">Quantity</span>
                  <span className="text-sm text-white">{transaction.quantity}</span>
                </div>
                <div className="flex justify-between px-6 py-3">
                  <span className="text-sm text-slate-500">Unit Price</span>
                  <span className="text-sm text-white">${unitPrice}</span>
                </div>
                <div className="flex justify-between px-6 py-3">
                  <span className="text-sm text-slate-500">Total Value</span>
                  <span className="text-sm font-bold text-amber-400">${totalValue}</span>
                </div>
                <div className="flex justify-between px-6 py-3">
                  <span className="text-sm text-slate-500">Currency</span>
                  <span className="text-sm text-white">{transaction.currency}</span>
                </div>
                <div className="flex justify-between px-6 py-3">
                  <span className="text-sm text-slate-500">Port of Destination</span>
                  <span className="text-sm text-white">{transaction.port_of_destination}</span>
                </div>
                <div className="flex justify-between px-6 py-3">
                  <span className="text-sm text-slate-500">Created</span>
                  <span className="text-sm text-white">{createdDate}</span>
                </div>
              </div>
            </div>

            {/* Trade Documents */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="border-b border-white/10 bg-white/5 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Trade Documents</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Upload all required documents for this transaction</p>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-amber-400">{totalUploaded} uploaded</span>
                  {totalApproved > 0 && <span className="text-emerald-400">{totalApproved} approved</span>}
                  {totalRejected > 0 && <span className="text-red-400">{totalRejected} rejected</span>}
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {TRADE_DOCUMENTS.map(doc => {
                  const status = getDocStatus(doc.key);
                  const record = getDoc(doc.key);
                  const config = statusConfig[status];
                  const isUploading = uploading === doc.key;
                  const justSucceeded = uploadSuccess === doc.key;
                  const hasError = uploadError === doc.key;

                  return (
                    <div key={doc.key} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-start gap-3">
                          <div className={"mt-1.5 h-2 w-2 rounded-full flex-shrink-0 " + config.dot} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white">{doc.label}</p>
                              {doc.required && (
                                <span className="text-xs text-amber-400">Required</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{doc.hint}</p>
                          </div>
                        </div>
                        <span className={"text-xs font-medium flex-shrink-0 " + config.color}>
                          {config.label}
                        </span>
                      </div>

                      {status === "rejected" && record?.rejection_reason && (
                        <div className="mb-3 ml-5 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2">
                          <p className="text-xs text-red-300">
                            Rejection reason: {record.rejection_reason}
                          </p>
                        </div>
                      )}

                      {record?.file_url && (
                        <div className="mb-3 ml-5">
                          <a href={record.file_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-amber-400 hover:text-amber-300 underline">
                            View uploaded file{record.version > 1 ? " (v" + record.version + ")" : ""} →
                          </a>
                        </div>
                      )}

                      {status !== "approved" && (
                        <div className="flex items-center gap-3 ml-5 flex-wrap">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            ref={el => { fileRefs.current[doc.key] = el; }}
                            onChange={async e => {
                              const file = e.target.files?.[0];
                              if (file) await handleUpload(doc.key, file);
                            }}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileRefs.current[doc.key]?.click()}
                            disabled={isUploading}
                            className={
                              "rounded-xl px-4 py-2 text-xs font-semibold transition disabled:opacity-50 " +
                              (status === "rejected"
                                ? "bg-red-500 text-white hover:bg-red-400"
                                : "bg-amber-400 text-slate-950 hover:bg-amber-300")
                            }
                          >
                            {isUploading ? "Uploading..." : status === "rejected" ? "Re-upload" : status === "pending" ? "Replace" : "Upload"}
                          </button>
                          {justSucceeded && (
                            <span className="text-xs text-emerald-400">✓ Uploaded</span>
                          )}
                          {hasError && (
                            <span className="text-xs text-red-400">
                              {errorMessage || "Upload failed — try again"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {transaction.notes && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="font-semibold mb-3">Notes</h2>
                <p className="text-sm text-slate-400">{transaction.notes}</p>
              </div>
            )}

          </div>

          {/* Steps tracker */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-fit">
            <h3 className="font-semibold mb-1">Transaction Progress</h3>
            <p className="text-xs text-slate-500 mb-5">Step {transaction.current_step} of 13</p>
            <div className="flex flex-col gap-1">
              {steps.map(step => (
                <div key={step.id} className={
                  step.status === "complete" ? "flex items-center gap-3 rounded-lg px-3 py-2.5 bg-emerald-500/10" :
                  step.status === "active" ? "flex items-center gap-3 rounded-lg px-3 py-2.5 bg-amber-500/10" :
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 opacity-30"
                }>
                  <span className={
                    step.status === "complete" ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold bg-emerald-500 text-slate-950" :
                    step.status === "active" ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold border border-amber-400 text-amber-400" :
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold border border-white/10 text-slate-600"
                  }>
                    {step.status === "complete" ? "✓" : String(step.step_number).padStart(2, "0")}
                  </span>
                  <span className={
                    step.status === "complete" ? "text-xs text-emerald-300" :
                    step.status === "active" ? "text-xs font-medium text-white" :
                    "text-xs text-slate-600"
                  }>
                    {step.step_name}
                  </span>
                  {step.status === "active" && (
                    <span className="ml-auto text-xs font-medium text-amber-400">Active</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}