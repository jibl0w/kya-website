"use client";

import { useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  user_id: string;
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
  form_m_number?: string;
  lc_number?: string;
  notes?: string;
  created_at: string;
}

interface Step {
  id: string;
  transaction_id: string;
  step_number: number;
  step_name: string;
  status: string;
  completed_at?: string;
  notes?: string;
}

interface Props {
  transactions: Transaction[];
  steps: Step[];
  kycProfiles: { user_id: string; first_name: string; last_name: string }[];
  kybProfiles: { user_id: string; company_name: string }[];
}

const STEP_NAMES = [
  "KYC / KYB Verification",
  "Supplier Selection",
  "Form M Submission",
  "Naira Funding",
  "LC Issuance",
  "Pre-Shipment Inspection",
  "Shipment & Documents",
  "FX Processing & Release",
  "USD Credit to Account",
  "Payment Instruction",
  "RMB Settlement",
  "LC Liquidation",
  "Transaction Complete",
];

export default function AdminTransactionsClient({
  transactions = [],
  steps = [],
  kycProfiles = [],
  kybProfiles = [],
}: Props) {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [localTxns, setLocalTxns] = useState<Transaction[]>(transactions);
  const [localSteps, setLocalSteps] = useState<Step[]>(steps);
  const [updating, setUpdating] = useState(false);
  const [stepNote, setStepNote] = useState("");
  const [formM, setFormM] = useState("");
  const [lcNumber, setLcNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  function getCustomerName(uid: string) {
    const kyc = kycProfiles.find(p => p.user_id === uid);
    if (kyc) return (kyc.first_name + " " + kyc.last_name).trim() || "KYC Customer";
    const kyb = kybProfiles.find(p => p.user_id === uid);
    if (kyb) return kyb.company_name || "KYB Customer";
    return uid.slice(0, 20) + "...";
  }

  function getTxnSteps(txnId: string) {
    return localSteps.filter(s => s.transaction_id === txnId)
      .sort((a, b) => a.step_number - b.step_number);
  }

  async function advanceStep(txn: Transaction) {
    if (txn.current_step >= 13) return;
    setUpdating(true);

    const nextStep = txn.current_step + 1;

    try {
      const res = await fetch("/api/admin/update-transaction-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: txn.id,
          currentStep: txn.current_step,
          nextStep,
          note: stepNote,
          formMNumber: formM,
          lcNumber,
        }),
      });

      if (res.ok) {
        setLocalTxns(prev => prev.map(t => t.id === txn.id
          ? { ...t, current_step: nextStep, status: nextStep === 13 ? "complete" : "active", form_m_number: formM || t.form_m_number, lc_number: lcNumber || t.lc_number }
          : t
        ));
        setLocalSteps(prev => prev.map(s => {
          if (s.transaction_id === txn.id && s.step_number === txn.current_step) {
            return { ...s, status: "complete", completed_at: new Date().toISOString(), notes: stepNote };
          }
          if (s.transaction_id === txn.id && s.step_number === nextStep) {
            return { ...s, status: "active" };
          }
          return s;
        }));
        setSelectedTxn(prev => prev ? { ...prev, current_step: nextStep, status: nextStep === 13 ? "complete" : "active" } : null);
        setStepNote("");
      }
    } finally {
      setUpdating(false);
    }
  }

  async function revertStep(txn: Transaction) {
    if (txn.current_step <= 1) return;
    setUpdating(true);

    const prevStep = txn.current_step - 1;

    try {
      const res = await fetch("/api/admin/update-transaction-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: txn.id,
          currentStep: txn.current_step,
          nextStep: prevStep,
          revert: true,
        }),
      });

      if (res.ok) {
        setLocalTxns(prev => prev.map(t => t.id === txn.id
          ? { ...t, current_step: prevStep, status: "active" }
          : t
        ));
        setLocalSteps(prev => prev.map(s => {
          if (s.transaction_id === txn.id && s.step_number === txn.current_step) {
            return { ...s, status: "pending", completed_at: undefined };
          }
          if (s.transaction_id === txn.id && s.step_number === prevStep) {
            return { ...s, status: "active" };
          }
          return s;
        }));
        setSelectedTxn(prev => prev ? { ...prev, current_step: prevStep, status: "active" } : null);
      }
    } finally {
      setUpdating(false);
    }
  }

  const filtered = localTxns.filter(t =>
    statusFilter === "all" ? true : t.status === statusFilter
  );

  const activeCount = localTxns.filter(t => t.status === "active" || t.status === "draft").length;
  const completeCount = localTxns.filter(t => t.status === "complete").length;

  const statusColors: Record<string, string> = {
    draft: "text-slate-400 border-slate-500/30 bg-slate-500/10",
    active: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    complete: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">Admin — Transactions</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/documents" className="text-sm text-slate-400 hover:text-white transition">
            Documents
          </Link>
          <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-8 py-10">

        <h1 className="text-3xl font-black mb-2">Transaction Management</h1>
        <p className="text-slate-400 mb-8">
          Monitor and advance all customer trade transactions through the 13-step KYA process.
        </p>

        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: localTxns.length, color: "text-white" },
            { label: "Active", value: activeCount, color: "text-amber-400" },
            { label: "Complete", value: completeCount, color: "text-emerald-400" },
            { label: "Steps Done", value: localSteps.filter(s => s.status === "complete").length, color: "text-blue-400" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className={"text-2xl font-black " + s.color}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "draft", "active", "complete"] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={"rounded-lg px-4 py-2 text-sm font-medium transition capitalize " +
                (statusFilter === f
                  ? "bg-amber-400 text-slate-950"
                  : "border border-white/10 text-slate-400 hover:text-white")}>
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Transaction list */}
          <div className="flex flex-col gap-4">
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                <p className="text-slate-400">No transactions found.</p>
              </div>
            )}
            {filtered.map(txn => {
              const txnSteps = getTxnSteps(txn.id);
              const completedSteps = txnSteps.filter(s => s.status === "complete").length;
              const progress = Math.round((completedSteps / 13) * 100);

              return (
                <div
                  key={txn.id}
                  onClick={() => {
                    setSelectedTxn(txn);
                    setFormM(txn.form_m_number || "");
                    setLcNumber(txn.lc_number || "");
                    setStepNote("");
                  }}
                  className={"rounded-2xl border p-5 cursor-pointer transition " +
                    (selectedTxn?.id === txn.id
                      ? "border-amber-400/40 bg-amber-400/5"
                      : "border-white/10 bg-white/5 hover:border-white/20")}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-white">{txn.supplier_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {txn.transaction_ref} · {getCustomerName(txn.user_id)}
                      </p>
                    </div>
                    <span className={"text-xs font-medium border rounded-full px-3 py-1 flex-shrink-0 " + (statusColors[txn.status] || statusColors.draft)}>
                      {txn.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500">
                      Step {txn.current_step} of 13 — {STEP_NAMES[txn.current_step - 1]}
                    </p>
                    <p className="text-xs text-amber-400">{progress}%</p>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-white/5">
                    <div
                      className="h-1.5 rounded-full bg-amber-400 transition-all"
                      style={{ width: progress + "%" }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      ${Number(txn.total_value).toLocaleString()} {txn.currency}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(txn.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transaction detail panel */}
          <div>
            {!selectedTxn ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center sticky top-6">
                <p className="text-slate-400">Select a transaction to manage it.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden sticky top-6">
                <div className="border-b border-white/10 bg-white/5 px-6 py-4">
                  <h3 className="font-semibold text-white">{selectedTxn.supplier_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedTxn.transaction_ref} · {getCustomerName(selectedTxn.user_id)}
                  </p>
                </div>

                <div className="p-6 flex flex-col gap-5">

                  {/* Current step */}
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-xs text-amber-400 mb-1">Current Step</p>
                    <p className="font-semibold text-white">
                      {selectedTxn.current_step}. {STEP_NAMES[selectedTxn.current_step - 1]}
                    </p>
                    {selectedTxn.current_step < 13 && (
                      <p className="text-xs text-slate-500 mt-1">
                        Next: {STEP_NAMES[selectedTxn.current_step]}
                      </p>
                    )}
                  </div>

                  {/* Form M and LC number fields */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Form M Number</label>
                      <input
                        type="text"
                        value={formM}
                        onChange={e => setFormM(e.target.value)}
                        placeholder="e.g. MF2024XXXXXXXX"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">LC Number</label>
                      <input
                        type="text"
                        value={lcNumber}
                        onChange={e => setLcNumber(e.target.value)}
                        placeholder="Letter of Credit reference"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Step Note</label>
                      <textarea
                        value={stepNote}
                        onChange={e => setStepNote(e.target.value)}
                        placeholder="Add a note for this step (optional)"
                        rows={2}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 resize-none"
                      />
                    </div>
                  </div>

                  {/* Advance / revert buttons */}
                  <div className="flex gap-3">
                    {selectedTxn.current_step < 13 && (
                      <button
                        onClick={() => advanceStep(selectedTxn)}
                        disabled={updating}
                        className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50"
                      >
                        {updating ? "Updating..." : "Advance to Step " + (selectedTxn.current_step + 1)}
                      </button>
                    )}
                    {selectedTxn.current_step === 13 && (
                      <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400 text-center">
                        ✓ Transaction Complete
                      </div>
                    )}
                    {selectedTxn.current_step > 2 && (
                      <button
                        onClick={() => revertStep(selectedTxn)}
                        disabled={updating}
                        className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 hover:text-white hover:border-white/20 transition disabled:opacity-50"
                      >
                        ← Back
                      </button>
                    )}
                  </div>

                  {/* Step progress */}
                  <div>
                    <p className="text-xs text-slate-500 mb-3">All Steps</p>
                    <div className="flex flex-col gap-1">
                      {getTxnSteps(selectedTxn.id).map(step => (
                        <div key={step.id} className={
                          "flex items-center gap-3 rounded-lg px-3 py-2 " +
                          (step.status === "complete" ? "bg-emerald-500/10" :
                            step.status === "active" ? "bg-amber-500/10" : "opacity-30")
                        }>
                          <span className={
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold " +
                            (step.status === "complete" ? "bg-emerald-500 text-slate-950" :
                              step.status === "active" ? "border border-amber-400 text-amber-400" :
                              "border border-white/10 text-slate-600")
                          }>
                            {step.status === "complete" ? "✓" : String(step.step_number).padStart(2, "0")}
                          </span>
                          <span className={
                            "text-xs flex-1 " +
                            (step.status === "complete" ? "text-emerald-300" :
                              step.status === "active" ? "font-medium text-white" : "text-slate-600")
                          }>
                            {step.step_name}
                          </span>
                          {step.status === "active" && (
                            <span className="text-xs text-amber-400">Current</span>
                          )}
                          {step.status === "complete" && step.completed_at && (
                            <span className="text-xs text-slate-600">
                              {new Date(step.completed_at).toLocaleDateString("en-GB")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}