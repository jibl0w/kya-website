"use client";

import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import OTPConfirmation from "@/app/components/OTPConfirmation";

const SUPPLIER_CATEGORIES = [
  { value: "Electronics & Consumer Technology", label: "Electronics & Consumer Technology" },
  { value: "Solar & Energy Infrastructure", label: "Solar & Energy Infrastructure" },
  { value: "Industrial Equipment & Machinery", label: "Industrial Equipment & Machinery" },
  { value: "Construction & Building Materials", label: "Construction & Building Materials" },
  { value: "Textiles, Packaging & Manufacturing Inputs", label: "Textiles, Packaging & Manufacturing Inputs" },
];

const NIGERIAN_PORTS = [
  "Apapa Port, Lagos",
  "Tin Can Island Port, Lagos",
  "Onne Port, Rivers State",
  "Calabar Port, Cross River",
  "Warri Port, Delta State",
];

function NewTransactionForm() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);

  const [form, setForm] = useState({
    supplierName: "",
    supplierCategory: "",
    productDescription: "",
    quantity: "",
    unitPrice: "",
    currency: "USD",
    portOfDestination: "",
    notes: "",
  });

  useEffect(() => {
    const name = searchParams.get("supplierName");
    const category = searchParams.get("category");
    if (name || category) {
      setForm(prev => ({
        ...prev,
        supplierName: name || prev.supplierName,
        supplierCategory: category || prev.supplierCategory,
      }));
    }
  }, [searchParams]);

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const totalValue = parseFloat(form.unitPrice || "0") * parseFloat(form.quantity || "0");

  function handleReview() {
    if (!form.supplierName || !form.supplierCategory || !form.productDescription || !form.quantity || !form.unitPrice || !form.portOfDestination) {
      setError("Please complete all required fields.");
      return;
    }
    setError(null);
    setShowOTP(true);
  }

  async function handleOTPVerified() {
    if (!user) return;
    setShowOTP(false);
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create transaction");
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

  const inp = "rounded-xl bg-white/5 border border-white/10 p-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 w-full text-sm";
  const sel = "rounded-xl bg-slate-900 border border-white/10 p-3.5 text-white focus:outline-none focus:border-amber-400/50 w-full text-sm";
  const lbl = "text-xs font-medium text-slate-400 mb-1.5 block";

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {showOTP && (
        <OTPConfirmation
          purpose="transaction_creation"
          onVerified={handleOTPVerified}
          onCancel={() => setShowOTP(false)}
          title="Confirm Transaction"
          description={`Enter the 6-digit code sent to your email to confirm this trade transaction with ${form.supplierName} for $${totalValue.toLocaleString()} ${form.currency}.`}
        />
      )}

      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">← Dashboard</Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">New Transaction</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-2xl px-8 py-12">

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-1">Trade Platform</p>
          <h1 className="text-3xl font-black mb-2">New Trade Transaction</h1>
          <p className="text-slate-400 text-sm">
            Complete the details below to initiate a new trade transaction. You will be asked to verify with a one-time code before submission.
          </p>
        </div>

        <div className="flex flex-col gap-5">

          {/* Supplier Details */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Supplier Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Supplier Name <span className="text-amber-400">*</span></label>
                <input value={form.supplierName} onChange={e => update("supplierName", e.target.value)}
                  className={inp} placeholder="e.g. Shenzhen TechCo Ltd" />
                <p className="text-xs text-slate-600 mt-1.5">
                  <Link href="/dashboard/suppliers" className="text-amber-400 hover:text-amber-300">Browse verified suppliers →</Link>
                </p>
              </div>
              <div>
                <label className={lbl}>Supplier Category <span className="text-amber-400">*</span></label>
                <select value={form.supplierCategory} onChange={e => update("supplierCategory", e.target.value)} className={sel}>
                  <option value="">Select category</option>
                  {SUPPLIER_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Product Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Product Description <span className="text-amber-400">*</span></label>
                <input value={form.productDescription} onChange={e => update("productDescription", e.target.value)}
                  className={inp} placeholder="e.g. 500W Monocrystalline Solar Panels" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Quantity <span className="text-amber-400">*</span></label>
                  <input type="number" value={form.quantity} onChange={e => update("quantity", e.target.value)}
                    className={inp} placeholder="e.g. 200" />
                </div>
                <div>
                  <label className={lbl}>Unit Price <span className="text-amber-400">*</span></label>
                  <input type="number" value={form.unitPrice} onChange={e => update("unitPrice", e.target.value)}
                    className={inp} placeholder="e.g. 150" />
                </div>
              </div>
              <div>
                <label className={lbl}>Currency</label>
                <select value={form.currency} onChange={e => update("currency", e.target.value)} className={sel}>
                  <option value="USD">USD — US Dollar</option>
                  <option value="CNY">CNY — Chinese Yuan</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
              {totalValue > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <p className="text-xs text-slate-500">Total Transaction Value</p>
                  <p className="text-2xl font-black text-amber-400">${totalValue.toLocaleString()} {form.currency}</p>
                </div>
              )}
            </div>
          </div>

          {/* Logistics */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Logistics</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Port of Destination <span className="text-amber-400">*</span></label>
                <select value={form.portOfDestination} onChange={e => update("portOfDestination", e.target.value)} className={sel}>
                  <option value="">Select port</option>
                  {NIGERIAN_PORTS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Additional Notes</label>
                <textarea value={form.notes} onChange={e => update("notes", e.target.value)}
                  rows={3} className={inp + " resize-none"} placeholder="Any specific instructions or requirements..." />
              </div>
            </div>
          </div>

          {/* Security notice */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-amber-400 font-semibold">🔐 Verification required.</span> After clicking Submit you will receive a 6-digit verification code at your registered email address. You must enter this code to confirm the transaction.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button onClick={handleReview} disabled={submitting}
            className="w-full rounded-xl bg-amber-400 py-4 font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Creating Transaction..." : "Submit Transaction — Verify with OTP →"}
          </button>

        </div>
      </div>
    </main>
  );
}

export default function NewTransactionPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <NewTransactionForm />
    </Suspense>
  );
}