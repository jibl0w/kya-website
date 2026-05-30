import React, { useState } from "react";
"use client";

import { useState } from "react";
import Link from "next/link";

interface KycProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  address?: string;
  nationality?: string;
  id_type?: string;
  id_number?: string;
  phone?: string;
  email?: string;
}

interface KybProfile {
  user_id: string;
  company_name: string;
  cac_number?: string;
  tin?: string;
  business_type?: string;
  registered_address?: string;
  company_email?: string;
  representative_title?: string;
  representative_name?: string;
  representative_email?: string;
  representative_phone?: string;
}

interface KycDoc {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  file_name?: string;
  verification_status: string;
  status: string;
  rejection_reason?: string;
  uploaded_at: string;
  version?: number;
  account_type?: string;
}

interface TxnDoc {
  id: string;
  transaction_id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  status: string;
  rejection_reason?: string;
  uploaded_at: string;
  version?: number;
}

interface Txn {
  id: string;
  transaction_ref: string;
  supplier_name: string;
  form_m_number?: string;
  lc_number?: string;
  total_value?: number;
  currency?: string;
}

interface Props {
  documents: KycDoc[];
  transactionDocuments: TxnDoc[];
  transactions: Txn[];
  kycProfiles: KycProfile[];
  kybProfiles: KybProfile[];
}

const KYC_DOC_TYPES = ["nin", "bvn_confirmation", "government_id", "proof_of_address", "selfie_with_id"];
const KYB_DOC_TYPES = ["cac_certificate", "memart", "cac_form_1_1", "director_id", "financial_statements"];

const DOC_LABELS: Record<string, string> = {
  nin: "NIN — National Identification Number",
  bvn_confirmation: "BVN Confirmation",
  government_id: "Government-Issued ID",
  proof_of_address: "Proof of Address",
  selfie_with_id: "Selfie Holding ID",
  cac_certificate: "CAC Certificate of Incorporation",
  memart: "Memorandum & Articles of Association",
  cac_form_1_1: "CAC Form 1.1 — Directors & Shareholders",
  director_id: "Director Government-Issued ID",
  financial_statements: "Financial Statements / Bank Statements",
  proforma_invoice: "Proforma Invoice",
  form_m: "Form M Application",
  bill_of_lading: "Bill of Lading",
  commercial_invoice: "Commercial Invoice",
  packing_list: "Packing List",
  certificate_of_origin: "Certificate of Origin",
};

const sc: Record<string, string> = {
  approved: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  rejected: "text-red-400 border-red-500/30 bg-red-500/10",
  pending: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

// ActionButtons is defined OUTSIDE the main component to prevent remounting on state change
interface ActionButtonsProps {
  docId: string;
  status: string;
  isTxnDoc: boolean;
  processingId: string | null;
  showRejectInput: Record<string, boolean>;
  onToggleReject: (docId: string) => void;
  onAction: (docId: string, action: "approve" | "reject", isTxnDoc: boolean, reason?: string) => void;
}

function ActionButtons({
  docId, status, isTxnDoc,
  processingId, showRejectInput,
  onToggleReject, onAction
}: Omit<ActionButtonsProps, "rejectionReason" | "onReasonChange"> & { onAction: (docId: string, action: "approve" | "reject", isTxnDoc: boolean, reason?: string) => void }) {
  const isProcessing = processingId === docId;
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleConfirmReject() {
    const reason = inputRef.current?.value || "";
    if (!reason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }
    onAction(docId, "reject", isTxnDoc, reason);
  }

  const rejectInput = showRejectInput[docId] && (
    <div className="flex gap-3 items-start mt-1">
      <input
        ref={inputRef}
        type="text"
        defaultValue=""
        placeholder="Enter rejection reason (required)"
        className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-400/50"
      />
      <button onClick={handleConfirmReject} disabled={isProcessing}
        className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-400 transition disabled:opacity-50 flex-shrink-0">
        {isProcessing ? "..." : "Confirm"}
      </button>
    </div>
  );

  if (status === "approved") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <p className="text-xs text-emerald-400 font-medium">✓ Approved</p>
          <button onClick={() => onToggleReject(docId)} disabled={isProcessing}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
            Reject
          </button>
        </div>
        {rejectInput}
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xs text-red-400 font-medium">✕ Rejected</p>
          <button onClick={() => onAction(docId, "approve", isTxnDoc)} disabled={isProcessing}
            className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-400 transition disabled:opacity-50">
            {isProcessing ? "Processing..." : "Re-approve"}
          </button>
          <button onClick={() => onToggleReject(docId)} disabled={isProcessing}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
            New Reason
          </button>
        </div>
        {rejectInput}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 flex-wrap">
        <button onClick={() => onAction(docId, "approve", isTxnDoc)} disabled={isProcessing}
          className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition disabled:opacity-50">
          {isProcessing ? "Processing..." : "✓ Approve"}
        </button>
        <button onClick={() => onToggleReject(docId)} disabled={isProcessing}
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
          ✕ Reject
        </button>
      </div>
      {rejectInput}
    </div>
  );
}

export default function AdminDocumentsClient({
  documents = [],
  transactionDocuments = [],
  transactions = [],
  kycProfiles = [],
  kybProfiles = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<"kyc" | "kyb" | "trade">("kyc");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});
  const [localDocs, setLocalDocs] = useState<KycDoc[]>(documents);
  const [localTxnDocs, setLocalTxnDocs] = useState<TxnDoc[]>(transactionDocuments);

  const kycUserIds = new Set(kycProfiles.map(p => p.user_id));
  const kybUserIds = new Set(kybProfiles.map(p => p.user_id));

  const kycDocs = localDocs.filter(d =>
    kycUserIds.has(d.user_id) && KYC_DOC_TYPES.includes(d.document_type)
  );
  const kybDocs = localDocs.filter(d =>
    kybUserIds.has(d.user_id) && KYB_DOC_TYPES.includes(d.document_type)
  );

  function getKycProfile(uid: string): KycProfile | null {
    return kycProfiles.find(p => p.user_id === uid) || null;
  }

  function getKybProfile(uid: string): KybProfile | null {
    return kybProfiles.find(p => p.user_id === uid) || null;
  }

  function getTxn(txnId: string): Txn | null {
    return transactions.find(t => t.id === txnId) || null;
  }

  function getDocStatus(doc: KycDoc) {
    return doc.status || doc.verification_status || "pending";
  }

  async function handleAction(docId: string, action: "approve" | "reject", isTxnDoc: boolean, reason?: string) {
    const rejectionText = reason || rejectionReason[docId] || "";
    if (action === "reject" && !rejectionText.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }
    setProcessingId(docId);
    const endpoint = isTxnDoc
      ? "/api/admin/review-transaction-document"
      : "/api/admin/review-document";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId, action, rejectionReason: rejectionText }),
      });
      if (res.ok) {
        if (isTxnDoc) {
          setLocalTxnDocs(prev => prev.map(d => d.id === docId
            ? { ...d, status: action === "approve" ? "approved" : "rejected", rejection_reason: rejectionText }
            : d
          ));
        } else {
          setLocalDocs(prev => prev.map(d => d.id === docId
            ? { ...d, status: action === "approve" ? "approved" : "rejected", verification_status: action === "approve" ? "approved" : "rejected", rejection_reason: rejectionText }
            : d
          ));
        }
        setShowRejectInput(prev => ({ ...prev, [docId]: false }));
        setRejectionReason(prev => ({ ...prev, [docId]: "" }));
      }
    } finally {
      setProcessingId(null);
    }
  }
  const handleReasonChange = (docId: string, value: string) => {
    setRejectionReason(prev => ({ ...prev, [docId]: value }));
  };

  const handleReasonChange = (docId: string, value: string) => {
  setRejectionReason(prev => {
    const next = { ...prev };
    next[docId] = value;
    return next;
  });
};

  const kycPending = kycDocs.filter(d => getDocStatus(d) === "pending").length;
  const kybPending = kybDocs.filter(d => getDocStatus(d) === "pending").length;
  const txnPending = localTxnDocs.filter(d => d.status === "pending").length;

  function applyFilter(docs: KycDoc[]) {
    return docs.filter(d => filter === "all" ? true : getDocStatus(d) === filter);
  }

  function applyTxnFilter(docs: TxnDoc[]) {
    return docs.filter(d => filter === "all" ? true : d.status === filter);
  }

  function groupByUser(docs: KycDoc[]) {
    return docs.reduce((acc, doc) => {
      if (!acc[doc.user_id]) acc[doc.user_id] = [];
      acc[doc.user_id].push(doc);
      return acc;
    }, {} as Record<string, KycDoc[]>);
  }

  function groupByTxn(docs: TxnDoc[]) {
    return docs.reduce((acc, doc) => {
      if (!acc[doc.transaction_id]) acc[doc.transaction_id] = [];
      acc[doc.transaction_id].push(doc);
      return acc;
    }, {} as Record<string, TxnDoc[]>);
  }

  function KycProfilePanel({ uid }: { uid: string }) {
    const p = getKycProfile(uid);
    if (!p) return null;
    return (
      <div className="mb-4 rounded-xl border border-white/10 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-xs font-medium text-blue-400">
            Personal KYC
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div>
            <p className="text-xs text-slate-500">Full Name</p>
            <p className="text-sm font-medium text-white">{p.first_name} {p.last_name}</p>
          </div>
          {p.nationality && (
            <div>
              <p className="text-xs text-slate-500">Nationality</p>
              <p className="text-sm text-white">{p.nationality}</p>
            </div>
          )}
          {p.address && (
            <div className="col-span-2">
              <p className="text-xs text-slate-500">Residential Address</p>
              <p className="text-sm text-white">{p.address}</p>
            </div>
          )}
          {p.id_type && (
            <div>
              <p className="text-xs text-slate-500">ID Type</p>
              <p className="text-sm text-white">{p.id_type}</p>
            </div>
          )}
          {p.id_number && (
            <div>
              <p className="text-xs text-slate-500">ID Number</p>
              <p className="text-sm text-white font-mono">{p.id_number}</p>
            </div>
          )}
          {p.phone && (
            <div>
              <p className="text-xs text-slate-500">Phone</p>
              <p className="text-sm text-white">{p.phone}</p>
            </div>
          )}
          {p.email && (
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm text-white">{p.email}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function KybProfilePanel({ uid }: { uid: string }) {
    const p = getKybProfile(uid);
    if (!p) return null;
    return (
      <div className="mb-4 rounded-xl border border-white/10 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-xs font-medium text-purple-400">
            Business KYB
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div className="col-span-2">
            <p className="text-xs text-slate-500">Company Name</p>
            <p className="text-sm font-bold text-white">{p.company_name}</p>
          </div>
          {p.cac_number && (
            <div>
              <p className="text-xs text-slate-500">CAC Number</p>
              <p className="text-sm text-white font-mono">{p.cac_number}</p>
            </div>
          )}
          {p.tin && (
            <div>
              <p className="text-xs text-slate-500">TIN</p>
              <p className="text-sm text-white font-mono">{p.tin}</p>
            </div>
          )}
          {p.business_type && (
            <div>
              <p className="text-xs text-slate-500">Business Type</p>
              <p className="text-sm text-white">{p.business_type}</p>
            </div>
          )}
          {p.registered_address && (
            <div className="col-span-2">
              <p className="text-xs text-slate-500">Registered Address</p>
              <p className="text-sm text-white">{p.registered_address}</p>
            </div>
          )}
          {p.representative_name && (
            <div>
              <p className="text-xs text-slate-500">Director / Representative</p>
              <p className="text-sm font-medium text-white">{p.representative_title} {p.representative_name}</p>
            </div>
          )}
          {p.representative_email && (
            <div>
              <p className="text-xs text-slate-500">Representative Email</p>
              <p className="text-sm text-white">{p.representative_email}</p>
            </div>
          )}
          {p.representative_phone && (
            <div>
              <p className="text-xs text-slate-500">Representative Phone</p>
              <p className="text-sm text-white">{p.representative_phone}</p>
            </div>
          )}
          {p.company_email && (
            <div>
              <p className="text-xs text-slate-500">Company Email</p>
              <p className="text-sm text-white">{p.company_email}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function DocGroup({ docs, label, isKyb }: { docs: KycDoc[]; label: string; isKyb: boolean }) {
    const grouped = groupByUser(applyFilter(docs));
    if (Object.keys(grouped).length === 0) {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400">No {filter === "all" ? "" : filter} {label} documents found.</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([uid, userDocs]) => (
          <div key={uid} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="border-b border-white/10 bg-white/5 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">
                  {isKyb
                    ? (getKybProfile(uid)?.company_name || "Unknown Company")
                    : ((getKycProfile(uid)?.first_name || "") + " " + (getKycProfile(uid)?.last_name || "")).trim() || "Unknown Customer"
                  }
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {label} • {userDocs.length} document{userDocs.length > 1 ? "s" : ""}
                </p>
              </div>
              <span className={"text-xs font-medium border rounded-full px-3 py-1 " +
                (isKyb ? "text-purple-400 border-purple-500/30 bg-purple-500/10" : "text-blue-400 border-blue-500/30 bg-blue-500/10")}>
                {label}
              </span>
            </div>
            <div className="px-6 pt-5">
              {isKyb ? <KybProfilePanel uid={uid} /> : <KycProfilePanel uid={uid} />}
            </div>
            <div className="divide-y divide-white/5">
              {userDocs.map(doc => (
                <div key={doc.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-medium text-white">
                        {DOC_LABELS[doc.document_type] || doc.document_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString("en-GB")}
                        {doc.version && doc.version > 1 ? " • Version " + doc.version : ""}
                        {doc.file_name ? " • " + doc.file_name : ""}
                      </p>
                    </div>
                    <span className={"text-xs font-medium border rounded-full px-3 py-1 flex-shrink-0 " + (sc[getDocStatus(doc)] || sc.pending)}>
                      {getDocStatus(doc)}
                    </span>
                  </div>
                  {getDocStatus(doc) === "rejected" && doc.rejection_reason && (
                    <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2">
                      <p className="text-xs text-red-300">Rejection reason: {doc.rejection_reason}</p>
                    </div>
                  )}
                  {doc.file_url && (
                    <div className="mb-3">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-amber-400 hover:text-amber-300 underline">
                        View document →
                      </a>
                    </div>
                  )}
                  <ActionButtons
                    docId={doc.id}
                    status={getDocStatus(doc)}
                    isTxnDoc={false}
                    processingId={processingId}
                    
                    showRejectInput={showRejectInp
                    onReasonChange={handleReasonChange}
                    onToggleReject={handleToggleReject}
                    onAction={handleAction}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">← Dashboard</Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">Admin — Document Review</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/transactions" className="text-sm text-slate-400 hover:text-white transition">Transactions</Link>
          {kycPending + kybPending + txnPending > 0 && (
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-400">
              {kycPending + kybPending + txnPending} pending
            </span>
          )}
          <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-8 py-10">
        <h1 className="text-3xl font-black mb-2">Document Review</h1>
        <p className="text-slate-400 mb-8">Review and approve or reject customer verification and trade documents.</p>

        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "KYC Pending", value: kycPending, color: "text-blue-400" },
            { label: "KYB Pending", value: kybPending, color: "text-purple-400" },
            { label: "Trade Pending", value: txnPending, color: "text-amber-400" },
            { label: "Total Pending", value: kycPending + kybPending + txnPending, color: "text-red-400" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className={"text-2xl font-black " + s.color}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "kyc" as const, label: "Personal KYC", count: kycPending, color: "bg-blue-500 text-white" },
            { key: "kyb" as const, label: "Business KYB", count: kybPending, color: "bg-purple-500 text-white" },
            { key: "trade" as const, label: "Trade Documents", count: txnPending, color: "bg-amber-400 text-slate-950" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={"rounded-lg px-5 py-2.5 text-sm font-medium transition " +
                (activeTab === tab.key ? tab.color : "border border-white/10 text-slate-400 hover:text-white")}>
              {tab.label}{tab.count > 0 ? " (" + tab.count + ")" : ""}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(["pending", "approved", "rejected", "all"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={"rounded-lg px-4 py-2 text-sm font-medium transition capitalize " +
                (filter === f ? "bg-white/10 text-white border border-white/20" : "border border-white/10 text-slate-400 hover:text-white")}>
              {f}
            </button>
          ))}
        </div>

        {activeTab === "kyc" && <DocGroup docs={kycDocs} label="Personal KYC" isKyb={false} />}
        {activeTab === "kyb" && <DocGroup docs={kybDocs} label="Business KYB" isKyb={true} />}

        {activeTab === "trade" && (
          <div className="flex flex-col gap-6">
            {Object.keys(groupByTxn(applyTxnFilter(localTxnDocs))).length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                <p className="text-slate-400">No {filter === "all" ? "" : filter} trade documents.</p>
              </div>
            )}
            {Object.entries(groupByTxn(applyTxnFilter(localTxnDocs))).map(([txnId, txnDocs]) => {
              const txn = getTxn(txnId);
              const txnRef = txn?.transaction_ref || txnId.slice(0, 8);
              const supplierName = txn?.supplier_name || "Unknown Supplier";
              const firstDoc = txnDocs[0];
              const customerKyc = getKycProfile(firstDoc.user_id);
              const customerKyb = getKybProfile(firstDoc.user_id);
              const customerName = customerKyc
                ? (customerKyc.first_name + " " + customerKyc.last_name).trim()
                : customerKyb?.company_name || "Unknown Customer";

              return (
                <div key={txnId} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <div className="border-b border-white/10 bg-white/5 px-6 py-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Supplier</p>
                        <p className="font-bold text-white text-lg">{supplierName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-0.5">Customer</p>
                        <p className="font-semibold text-amber-400">{customerName}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <p className="text-xs text-slate-500">KYA Reference</p>
                        <p className="text-sm font-mono text-white">{txnRef}</p>
                      </div>
                      {txn?.form_m_number && (
                        <div>
                          <p className="text-xs text-slate-500">Form M Number</p>
                          <p className="text-sm font-mono text-blue-400">{txn.form_m_number}</p>
                        </div>
                      )}
                      {txn?.lc_number && (
                        <div>
                          <p className="text-xs text-slate-500">LC Number</p>
                          <p className="text-sm font-mono text-purple-400">{txn.lc_number}</p>
                        </div>
                      )}
                      {txn?.total_value && (
                        <div>
                          <p className="text-xs text-slate-500">Transaction Value</p>
                          <p className="text-sm font-mono text-amber-400">${Number(txn.total_value).toLocaleString()} {txn.currency}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-white/5">
                    {txnDocs.map(doc => (
                      <div key={doc.id} className="px-6 py-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="font-medium text-white">
                              {DOC_LABELS[doc.document_type] || doc.document_type.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Uploaded {new Date(doc.uploaded_at).toLocaleDateString("en-GB")}
                              {doc.version && doc.version > 1 ? " • Version " + doc.version : ""}
                              {doc.file_name ? " • " + doc.file_name : ""}
                            </p>
                          </div>
                          <span className={"text-xs font-medium border rounded-full px-3 py-1 flex-shrink-0 " + (sc[doc.status] || sc.pending)}>
                            {doc.status}
                          </span>
                        </div>
                        {doc.status === "rejected" && doc.rejection_reason && (
                          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2">
                            <p className="text-xs text-red-300">Rejection reason: {doc.rejection_reason}</p>
                          </div>
                        )}
                        {doc.file_url && (
                          <div className="mb-3">
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-amber-400 hover:text-amber-300 underline">
                              View document →
                            </a>
                          </div>
                        )}
                        <ActionButtons
                          docId={doc.id}
                          status={doc.status}
                          isTxnDoc={true}
                          processingId={processingId}
                      
                          showRejectInput={showRejectInput}
                          onReasonChange={handleReasonChange}
                          onToggleReject={handleToggleReject}
                          onAction={handleAction}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}