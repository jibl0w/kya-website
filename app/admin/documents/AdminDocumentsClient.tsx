"use client";

import { useState } from "react";
import Link from "next/link";

interface KycDoc {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  verification_status: string;
  status: string;
  rejection_reason?: string;
  uploaded_at: string;
  version?: number;
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
}

interface Props {
  documents: KycDoc[];
  transactionDocuments: TxnDoc[];
  transactions: Txn[];
  kycProfiles: { user_id: string; first_name: string; last_name: string }[];
  kybProfiles: { user_id: string; company_name: string }[];
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

  const kycDocs = localDocs.filter(d => kycUserIds.has(d.user_id));
  const kybDocs = localDocs.filter(d => kybUserIds.has(d.user_id));

  function getCustomerName(uid: string) {
    const kyc = kycProfiles.find(p => p.user_id === uid);
    if (kyc) return (kyc.first_name + " " + kyc.last_name).trim() || "KYC Customer";
    const kyb = kybProfiles.find(p => p.user_id === uid);
    if (kyb) return kyb.company_name || "KYB Customer";
    return uid.slice(0, 20) + "...";
  }

  function getTxn(txnId: string) {
    return transactions.find(t => t.id === txnId) || null;
  }

  function getKycStatus(doc: KycDoc) {
    return doc.status || doc.verification_status || "pending";
  }

  async function handleAction(docId: string, action: "approve" | "reject", isTxnDoc: boolean) {
    const reason = rejectionReason[docId] || "";
    if (action === "reject" && !reason.trim()) {
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
        body: JSON.stringify({ documentId: docId, action, rejectionReason: reason }),
      });
      if (res.ok) {
        if (isTxnDoc) {
          setLocalTxnDocs(prev => prev.map(d => d.id === docId
            ? { ...d, status: action === "approve" ? "approved" : "rejected", rejection_reason: reason }
            : d
          ));
        } else {
          setLocalDocs(prev => prev.map(d => d.id === docId
            ? { ...d, status: action === "approve" ? "approved" : "rejected", verification_status: action === "approve" ? "approved" : "rejected", rejection_reason: reason }
            : d
          ));
        }
        setShowRejectInput(prev => ({ ...prev, [docId]: false }));
      }
    } finally {
      setProcessingId(null);
    }
  }

  const kycPending = kycDocs.filter(d => getKycStatus(d) === "pending").length;
  const kybPending = kybDocs.filter(d => getKycStatus(d) === "pending").length;
  const txnPending = localTxnDocs.filter(d => d.status === "pending").length;

  function applyFilter(docs: KycDoc[]) {
    return docs.filter(d => filter === "all" ? true : getKycStatus(d) === filter);
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

  const sc: Record<string, string> = {
    approved: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    rejected: "text-red-400 border-red-500/30 bg-red-500/10",
    pending: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  };

  function ActionButtons({ docId, status, isTxnDoc }: { docId: string; status: string; isTxnDoc: boolean }) {
    const isProcessing = processingId === docId;
    if (status === "approved") return <p className="text-xs text-emerald-400">✓ Approved</p>;
    if (status === "rejected") return <p className="text-xs text-red-400">✕ Rejected</p>;
    return (
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => handleAction(docId, "approve", isTxnDoc)} disabled={isProcessing}
            className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition disabled:opacity-50">
            {isProcessing ? "Processing..." : "✓ Approve"}
          </button>
          <button onClick={() => setShowRejectInput(prev => ({ ...prev, [docId]: !prev[docId] }))} disabled={isProcessing}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
            ✕ Reject
          </button>
        </div>
        {showRejectInput[docId] && (
          <div className="flex gap-3 items-start">
            <input type="text" value={rejectionReason[docId] || ""}
              onChange={e => setRejectionReason(prev => ({ ...prev, [docId]: e.target.value }))}
              placeholder="Enter rejection reason (required)"
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-400/50"
            />
            <button onClick={() => handleAction(docId, "reject", isTxnDoc)} disabled={isProcessing}
              className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-400 transition disabled:opacity-50 flex-shrink-0">
              Confirm
            </button>
          </div>
        )}
      </div>
    );
  }

  function DocGroup({ docs, label }: { docs: KycDoc[]; label: string }) {
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
                <p className="font-semibold text-white">{getCustomerName(uid)}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label} · {uid.slice(0, 28)}...</p>
              </div>
              <span className="text-xs text-slate-500">{userDocs.length} doc{userDocs.length > 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-white/5">
              {userDocs.map(doc => (
                <div key={doc.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-medium text-white capitalize">{doc.document_type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(doc.uploaded_at).toLocaleDateString("en-GB")}
                        {doc.version && doc.version > 1 ? " · v" + doc.version : ""}
                      </p>
                    </div>
                    <span className={"text-xs font-medium border rounded-full px-3 py-1 flex-shrink-0 " + (sc[getKycStatus(doc)] || sc.pending)}>
                      {getKycStatus(doc)}
                    </span>
                  </div>
                  {getKycStatus(doc) === "rejected" && doc.rejection_reason && (
                    <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2">
                      <p className="text-xs text-red-300">Reason: {doc.rejection_reason}</p>
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
                  <ActionButtons docId={doc.id} status={getKycStatus(doc)} isTxnDoc={false} />
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
            { label: "KYC Pending", value: kycPending, color: "text-amber-400" },
            { label: "KYB Pending", value: kybPending, color: "text-amber-400" },
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
            { key: "kyc" as const, label: "Personal KYC", count: kycPending },
            { key: "kyb" as const, label: "Business KYB", count: kybPending },
            { key: "trade" as const, label: "Trade Documents", count: txnPending },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={"rounded-lg px-5 py-2.5 text-sm font-medium transition " +
                (activeTab === tab.key
                  ? "bg-amber-400 text-slate-950"
                  : "border border-white/10 text-slate-400 hover:text-white")}>
              {tab.label}{tab.count > 0 ? " (" + tab.count + ")" : ""}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(["pending", "approved", "rejected", "all"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={"rounded-lg px-4 py-2 text-sm font-medium transition capitalize " +
                (filter === f
                  ? "bg-white/10 text-white border border-white/20"
                  : "border border-white/10 text-slate-400 hover:text-white")}>
              {f}
            </button>
          ))}
        </div>

        {activeTab === "kyc" && <DocGroup docs={kycDocs} label="Personal KYC" />}
        {activeTab === "kyb" && <DocGroup docs={kybDocs} label="Business KYB" />}

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
              return (
                <div key={txnId} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <div className="border-b border-white/10 bg-white/5 px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{supplierName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{txnRef} · {getCustomerName(firstDoc.user_id)}</p>
                    </div>
                    <span className="text-xs text-slate-500">{txnDocs.length} doc{txnDocs.length > 1 ? "s" : ""}</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {txnDocs.map(doc => (
                      <div key={doc.id} className="px-6 py-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="font-medium text-white capitalize">{doc.document_type.replace(/_/g, " ")}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {new Date(doc.uploaded_at).toLocaleDateString("en-GB")}
                              {doc.version && doc.version > 1 ? " · v" + doc.version : ""}
                            </p>
                          </div>
                          <span className={"text-xs font-medium border rounded-full px-3 py-1 flex-shrink-0 " + (sc[doc.status] || sc.pending)}>
                            {doc.status}
                          </span>
                        </div>
                        {doc.status === "rejected" && doc.rejection_reason && (
                          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2">
                            <p className="text-xs text-red-300">Reason: {doc.rejection_reason}</p>
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
                        <ActionButtons docId={doc.id} status={doc.status} isTxnDoc={true} />
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