"use client";

import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const NIGERIAN_PORTS = [
  "Apapa Port, Lagos",
  "Tin Can Island Port, Lagos",
  "Onne Port, Rivers State",
  "Calabar Port, Cross River",
  "Warri Port, Delta State",
];

interface VerifiedSupplier {
  id: string;
  supplier_name: string;
  trade_name: string | null;
  country: string | null;
  primary_category: string | null;
  currencies_accepted: string[] | null;
  has_usd_details: boolean;
  has_rmb_details: boolean;
}

function NewTransactionForm() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  const [suppliers, setSuppliers] = useState<VerifiedSupplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  const [form, setForm] = useState({
    supplierId: "",
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
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    try {
      const res = await fetch("/api/suppliers/verified");
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (err) {
      console.error("Suppliers fetch error:", err);
    } finally {
      setLoadingSuppliers(false);
    }
  }

  useEffect(() => {
    const id = searchParams.get("supplierId");
    if (id && suppliers.length > 0) {
      const s = suppliers.find((x) => x.id === id);
      if (s) selectSupplier(s.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, suppliers]);

  const selectedSupplier = suppliers.find((s) => s.id === form.supplierId) || null;

  function selectSupplier(id: string) {
    const s = suppliers.find((x) => x.id === id);
    setForm((prev) => ({
      ...prev,
      supplierId: id,
      supplierName: s ? s.supplier_name : "",
      supplierCategory: s?.primary_category || "",
    }));
  }

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const totalValue = parseFloat(form.unitPrice || "0") * parseFloat(form.quantity || "0");

  // Whether the selected supplier has beneficiary details for the chosen currency.
  const hasCurrencyDetails = selectedSupplier
    ? form.currency === "RMB"
      ? selectedSupplier.has_rmb_details
      : selectedSupplier.has_usd_details
    : false;

  function handleReview() {
    if (!form.supplierId) {
      setError("Please select a verified supplier.");
      return;
    }
    if (!form.productDescription || !form.quantity || !form.unitPrice || !form.portOfDestination) {
      setError("Please complete all required fields.");
      return;
    }
    setError(null);
    setShowReview(true);
  }

  async function handleConfirm() {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/transactions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: form.supplierId,
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
      setShowReview(false);
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

  // ---- REVIEW & CONFIRM SCREEN ----
  if (showReview) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Review Transaction</span>
          </div>
          <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
        </header>

        <div className="mx-auto max-w-xl px-8 py-12">
          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-1">Final Step</p>
            <h1 className="text-3xl font-black mb-2">Review & Confirm</h1>         <p className="text-slate-400 text-sm">
              Please review the details below. On confirmation, your transaction will be created and the supplier will be notified.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden mb-6">
            {[
              ["Supplier", form.supplierName],
              ["Category", form.supplierCategory],
              ["Product", form.productDescription],
              ["Quantity", form.quantity],
              ["Unit Price", form.unitPrice + " " + form.currency],
              ["Total Value", totalValue.toLocaleString() + " " + form.currency],
              ["Payment Currency", form.currency],
              ["Destination", form.portOfDestination],
              ...(form.notes ? [["Notes", form.notes]] : []),
            ].map(([k, v], i) => (
              <div key={i} className="flex justify-between gap-4 px-5 py-3.5 border-b border-white/5 last:border-0">
                <span className="text-xs text-slate-500 uppercase tracking-wide">{k}</span>
                <span className="text-sm text-white text-right">{v}</span>
              </div>
            ))}
          </div>

          {/* Beneficiary status for the chosen currency */}
          {!hasCurrencyDetails && (
            <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="text-xs text-amber-400">
                Note: this supplier has not yet provided {form.currency} beneficiary details. The transaction will be created, but payment in {form.currency} cannot proceed until they do.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setShowReview(false)} disabled={submitting}
              className="rounded-xl border border-white/10 px-6 py-4 text-sm text-slate-400 hover:text-white transition disabled:opacity-50">
              Back
            </button>
            <button onClick={handleConfirm} disabled={submitting}
              className="flex-1 rounded-xl bg-amber-400 py-4 font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? "Creating Transaction..." : "Confirm & Create Transaction"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ---- MAIN FORM ----
  return (
    <main className="min-h-screen bg-slate-950 text-white">
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
            Select a verified supplier and complete the order details. You will review everything before it is submitted.
          </p>
        </div>

        <div className="flex flex-col gap-5">

          {/* Supplier */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Supplier</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Verified Supplier <span className="text-amber-400">*</span></label>
                {loadingSuppliers ? (
                  <p className="text-sm text-slate-500">Loading verified suppliers…</p>
                ) : suppliers.length === 0 ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                    <p className="text-sm text-amber-300">No verified suppliers are available yet.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      <Link href="/dashboard/suppliers" className="text-amber-400 hover:text-amber-300">Browse the supplier marketplace →</Link>
                    </p>
                  </div>
                ) : (
                  <select value={form.supplierId} onChange={e => selectSupplier(e.target.value)} className={sel}>
                    <option value="">Select a verified supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.supplier_name}{s.country ? " — " + s.country : ""}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-slate-600 mt-1.5">
                  Only KYA-verified suppliers can be selected. <Link href="/dashboard/suppliers" className="text-amber-400 hover:text-amber-300">Browse suppliers →</Link>
                </p>
              </div>

              {selectedSupplier && (
                <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Supplier</p>
                      <p className="text-white">{selectedSupplier.supplier_name}</p>
                    </div>
                    {selectedSupplier.country && (
                      <div>
                        <p className="text-xs text-slate-500">Country</p>
                        <p className="text-white">{selectedSupplier.country}</p>
                      </div>
                    )}
                    {selectedSupplier.primary_category && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Category</p>
                        <p className="text-white">{selectedSupplier.primary_category}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    {hasCurrencyDetails ? (
                      <p className="text-xs text-emerald-400">
                        ✓ {form.currency} beneficiary details on file. Payment can be processed once the trade reaches the payment stage.
                      </p>
                    ) : (
                      <p className="text-xs text-amber-400">
                        ⚠ This supplier has not yet provided {form.currency} beneficiary details. You can create the transaction, but payment in {form.currency} cannot proceed until they do.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product */}
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
                <label className={lbl}>Payment Currency</label>
                <select value={form.currency} onChange={e => update("currency", e.target.value)} className={sel}>
                  <option value="USD">USD — US Dollar</option>
                  <option value="RMB">RMB — Chinese Yuan</option>
                </select>
              </div>
              {totalValue > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <p className="text-xs text-slate-500">Total Transaction Value</p>
                  <p className="text-2xl font-black text-amber-400">{totalValue.toLocaleString()} {form.currency}</p>
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

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button onClick={handleReview}
            className="w-full rounded-xl bg-amber-400 py-4 font-bold text-slate-950 hover:bg-amber-300 transition">
            Review Transaction →
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