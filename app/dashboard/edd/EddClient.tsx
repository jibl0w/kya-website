"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface EddRequest {
  id: string;
  user_id: string;
  reason: string;
  status: string;
  documents_required: string[];
  notes?: string;
  created_at: string;
  cleared_at?: string;
}

interface EddDocument {
  id: string;
  edd_request_id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  status: string;
  rejection_reason?: string;
  uploaded_at: string;
}

interface Props {
  eddRequests: EddRequest[];
  eddDocuments: EddDocument[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending Your Response", color: "text-amber-400", bg: "border-amber-500/30 bg-amber-500/10" },
  in_progress: { label: "Under Review", color: "text-blue-400", bg: "border-blue-500/30 bg-blue-500/10" },
  completed: { label: "Documents Submitted", color: "text-purple-400", bg: "border-purple-500/30 bg-purple-500/10" },
  cleared: { label: "Cleared", color: "text-emerald-400", bg: "border-emerald-500/30 bg-emerald-500/10" },
  escalated: { label: "Escalated", color: "text-red-400", bg: "border-red-500/30 bg-red-500/10" },
};

export default function EddClient({ eddRequests = [], eddDocuments = [] }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localDocs, setLocalDocs] = useState<EddDocument[]>(eddDocuments);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function getDocsForRequest(requestId: string) {
    return localDocs.filter(d => d.edd_request_id === requestId);
  }

  function isDocUploaded(requestId: string, docType: string) {
    return localDocs.some(d => d.edd_request_id === requestId && d.document_type === docType);
  }

  async function handleUpload(requestId: string, docType: string, file: File) {
    const key = requestId + "_" + docType;
    setUploading(key);
    setUploadSuccess(null);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eddRequestId", requestId);
      formData.append("documentType", docType);

      const res = await fetch("/api/edd/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setLocalDocs(prev => [...prev, {
        id: data.id,
        edd_request_id: requestId,
        user_id: "",
        document_type: docType,
        file_url: data.fileUrl,
        file_name: file.name,
        status: "pending",
        uploaded_at: new Date().toISOString(),
      }]);
      setUploadSuccess(key);
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploading(null);
    }
  }

  const activeRequests = eddRequests.filter(r => ["pending", "in_progress"].includes(r.status));
  const pastRequests = eddRequests.filter(r => ["cleared", "escalated", "completed"].includes(r.status));

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">← Dashboard</Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">Enhanced Due Diligence</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-2xl px-8 py-12">

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-1">Compliance</p>
          <h1 className="text-3xl font-black mb-2">Enhanced Due Diligence</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Our compliance team has requested additional information from you. Please upload the required documents as soon as possible to avoid any restrictions on your account.
          </p>
        </div>

        {eddRequests.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-slate-400 mb-2">No EDD requests at this time.</p>
            <p className="text-xs text-slate-600">You will be notified by email if additional verification is required.</p>
            <Link href="/dashboard" className="inline-block mt-6 rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition">
              Return to Dashboard
            </Link>
          </div>
        )}

        {/* Active EDD Requests */}
        {activeRequests.length > 0 && (
          <div className="flex flex-col gap-6 mb-8">
            <h2 className="text-lg font-bold">Action Required</h2>
            {activeRequests.map(req => {
              const config = statusConfig[req.status] || statusConfig.pending;
              const uploadedDocs = getDocsForRequest(req.id);
              const totalRequired = req.documents_required.length;
              const totalUploaded = req.documents_required.filter(d => isDocUploaded(req.id, d)).length;
              const allUploaded = totalRequired > 0 && totalUploaded >= totalRequired;

              return (
                <div key={req.id} className={"rounded-2xl border p-6 " + config.bg}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className={"text-xs font-semibold uppercase tracking-wider " + config.color}>{config.label}</span>
                      <p className="text-sm text-slate-400 mt-1 leading-relaxed">{req.reason}</p>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">{new Date(req.created_at).toLocaleDateString("en-GB")}</span>
                  </div>

                  {req.notes && (
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 mb-4">
                      <p className="text-xs text-slate-400 italic">{req.notes}</p>
                    </div>
                  )}

                  {totalRequired > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Documents Required</p>
                        <p className="text-xs text-slate-500">{totalUploaded} of {totalRequired} uploaded</p>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/5 mb-4">
                        <div className="h-1.5 rounded-full bg-amber-400 transition-all" style={{ width: totalRequired > 0 ? (totalUploaded / totalRequired * 100) + "%" : "0%" }} />
                      </div>

                      <div className="flex flex-col gap-3">
                        {req.documents_required.map(docType => {
                          const uploaded = isDocUploaded(req.id, docType);
                          const doc = localDocs.find(d => d.edd_request_id === req.id && d.document_type === docType);
                          const key = req.id + "_" + docType;
                          const isUploading = uploading === key;
                          const justSucceeded = uploadSuccess === key;

                          return (
                            <div key={docType} className={"rounded-xl border p-4 " + (uploaded ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/5")}>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-start gap-2">
                                  <div className={"mt-0.5 h-2 w-2 rounded-full flex-shrink-0 " + (uploaded ? "bg-emerald-400" : "bg-amber-400")} />
                                  <p className="text-sm font-medium text-white">{docType}</p>
                                </div>
                                <span className={"text-xs font-medium flex-shrink-0 " + (uploaded ? "text-emerald-400" : "text-amber-400")}>
                                  {uploaded ? "Uploaded" : "Required"}
                                </span>
                              </div>

                              {doc?.status === "rejected" && doc.rejection_reason && (
                                <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                                  <p className="text-xs text-red-300">Rejected: {doc.rejection_reason}</p>
                                </div>
                              )}

                              {doc?.file_url && (
                                <div className="mb-2">
                                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 underline">
                                    View uploaded file →
                                  </a>
                                </div>
                              )}

                              <div className="flex items-center gap-3 flex-wrap">
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  ref={el => { fileRefs.current[key] = el; }}
                                  onChange={async e => {
                                    const file = e.target.files?.[0];
                                    if (file) await handleUpload(req.id, docType, file);
                                  }}
                                  className="hidden"
                                />
                                <button
                                  onClick={() => fileRefs.current[key]?.click()}
                                  disabled={isUploading}
                                  className={"rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 " +
                                    (doc?.status === "rejected" ? "bg-red-500 text-white hover:bg-red-400" :
                                     uploaded ? "border border-white/10 text-slate-400 hover:text-white" :
                                     "bg-amber-400 text-slate-950 hover:bg-amber-300")}>
                                  {isUploading ? "Uploading..." : doc?.status === "rejected" ? "Re-upload" : uploaded ? "Replace" : "Upload Document"}
                                </button>
                                {justSucceeded && <span className="text-xs text-emerald-400">✓ Uploaded successfully</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-4">
                      <p className="text-sm text-red-400">{uploadError}</p>
                    </div>
                  )}

                  {allUploaded && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                      <p className="text-sm font-semibold text-emerald-400 mb-1">✓ All documents uploaded</p>
                      <p className="text-xs text-slate-400">Our compliance team will review your documents and notify you of the outcome.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Past EDD Requests */}
        {pastRequests.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Past Requests</h2>
            {pastRequests.map(req => {
              const config = statusConfig[req.status] || statusConfig.cleared;
              return (
                <div key={req.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={"text-xs font-semibold " + config.color}>{config.label}</span>
                      <p className="text-sm text-slate-400 mt-1">{req.reason}</p>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">{new Date(req.created_at).toLocaleDateString("en-GB")}</span>
                  </div>
                  {req.cleared_at && (
                    <p className="text-xs text-slate-600 mt-2">Cleared: {new Date(req.cleared_at).toLocaleDateString("en-GB")}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">
            ← Return to Dashboard
          </Link>
        </div>

      </div>
    </main>
  );
}