"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUPPLIER_CATEGORIES = [
  { value: "electronics", label: "Electronics & Consumer Technology" },
  { value: "solar", label: "Solar & Energy Infrastructure" },
  { value: "industrial", label: "Industrial Equipment & Machinery" },
  { value: "construction", label: "Construction & Building Materials" },
  { value: "textiles", label: "Textiles, Packaging & Manufacturing Inputs" },
];

const NIGERIAN_PORTS = [
  "Apapa Port, Lagos",
  "Tin Can Island Port, Lagos",
  "Onne Port, Rivers State",
  "Calabar Port, Cross River",
  "Warri Port, Delta State",
];

const STEPS = [
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

export default function NewTransactionPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

const [form, setForm] = useState({
    supplierName: searchParams.get("supplierName") || "",
    supplierCategory: searchParams.get("category") || "",
    productDescription: "",
    quantity: "",
    unitPrice: "",
    currency: "USD",
    portOfDestination: "",
    notes: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const totalValue = parseFloat(form.unitPrice || "0") * parseFloat(form.quantity || "0");

  async function handleSubmit() {
    if (!user) return;

    if (!form.supplierName || !form.supplierCategory || !form.productDescription || !form.quantity || !form.unitPrice || !form.portOfDestination) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/transactions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierName: form.supplierName,
          supplierCategory: form.supplierCategory,
          productDescription: form.productDescription,
          quantity: form.quantity,
          unitPrice: parseFloat(form.unitPrice),
          totalValue,
          currency: form.currency,
          portOfDestination: form.portOfDestination,
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create transaction");

      router.push(`/dashboard/transactions/${data.transactionId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const inp = "rounded-xl bg-white/5 border border-white/10 p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 w-full";
  const sel = "rounded-xl bg-slate-900 border border-white/10 p-3 text-white focus:outline-none focus:border-amber-400/50 w-full";
  const lbl = "text-sm text-slate-400 mb-1 block";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">New Transaction</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-5xl px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-1">
            Trade Setup
          </p>
          <h1 className="text-4xl font-black">Create New Transaction</h1>
          <p className="mt-2 text-slate-400">
            Complete the details below to initiate a new trade transaction through the KYA platform.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Form */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Supplier Details */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-semibold text-white mb-5">Supplier Details</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={lbl}>Supplier Name <span className="text-amber-400">*</span></label>
                  <input value={form.supplierName} onChange={e => update("supplierName", e.target.value)}
                    placeholder="Enter supplier or manufacturer name" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Supplier Category <span className="text-amber-400">*</span></label>
                  <select value={form.supplierCategory} onChange={e => update("supplierCategory", e.target.value)} className={sel}>
                    <option value="">Select a category</option>
                    {SUPPLIER_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-semibold text-white mb-5">Product Details</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={lbl}>Product Description <span className="text-amber-400">*</span></label>
                  <textarea
                    value={form.productDescription}
                    onChange={e => update("productDescription", e.target.value)}
                    placeholder="Describe the goods being imported — include product type, specifications, and intended use"
                    rows={3}
                    className={`${inp} resize-none`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Quantity <span className="text-amber-400">*</span></label>
                    <input type="number" value={form.quantity} onChange={e => update("quantity", e.target.value)}
                      placeholder="e.g. 100" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Unit Price (USD) <span className="text-amber-400">*</span></label>
                    <input type="number" value={form.unitPrice} onChange={e => update("unitPrice", e.target.value)}
                      placeholder="0.00" className={inp} />
                  </div>
                </div>

                {/* Total value display */}
                {totalValue > 0 && (
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Total Transaction Value</span>
                    <span className="font-bold text-amber-400 text-lg">
                      ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Details */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-semibold text-white mb-5">Shipping Details</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={lbl}>Port of Destination <span className="text-amber-400">*</span></label>
                  <select value={form.portOfDestination} onChange={e => update("portOfDestination", e.target.value)} className={sel}>
                    <option value="">Select destination port</option>
                    {NIGERIAN_PORTS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Additional Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => update("notes", e.target.value)}
                    placeholder="Any additional information about this transaction"
                    rows={3}
                    className={`${inp} resize-none`}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-xl bg-amber-400 py-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating Transaction..." : "Create Transaction →"}
            </button>
          </div>

          {/* Right panel — transaction flow */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold mb-1">Transaction Flow</h3>
              <p className="text-xs text-slate-500 mb-5">15-step platform-controlled process</p>
              <div className="flex flex-col gap-1">
                {STEPS.map((step, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${i === 1 ? "bg-amber-500/10" : "opacity-30"}`}>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-xs ${
                      i === 1 ? "border border-amber-400 text-amber-400" : "border border-white/10 text-slate-600"
                    }`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`text-xs ${i === 1 ? "text-white font-medium" : "text-slate-600"}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                Important
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your account must be fully verified before a transaction can be processed. All transactions require a valid Form M and Letter of Credit before FX will be released.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}