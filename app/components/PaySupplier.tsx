"use client";

import { useState } from "react";

interface Props {
  transactionId: string;
  supplierName: string;
  defaultCurrency: string;   // transaction's agreed settlement currency
  totalValue: number;
}

interface CreatedInstruction {
  instructionId: string;
  beneficiary: { name: string; bank: string; currency: string };
  amount: number;
  currency: string;
  expiresAt: string;
  lcCheckPending: boolean;
}

export default function PaySupplier({ transactionId, supplierName, defaultCurrency, totalValue }: Props) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState(defaultCurrency === "RMB" ? "RMB" : "USD");
  const [amount, setAmount] = useState(String(totalValue || ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedInstruction | null>(null);

  async function handleCreate() {
    setError(null);
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payment-instructions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, amount: amt, currency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payment instruction.");
      setCreated(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create payment instruction.");
    } finally {
      setSubmitting(false);
    }
  }

  // After creation — show the frozen instruction summary (OTP step comes next).
  if (created) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <h2 className="font-semibold mb-1">Payment Instruction Created</h2>
        <p className="text-xs text-slate-500 mb-4">
          Instruction <span className="font-mono text-amber-400">{created.instructionId}</span> — awaiting authorisation.
        </p>
        <div className="rounded-xl border border-white/10 bg-slate-900/50 divide-y divide-white/5">
          <div className="flex justify-between px-4 py-3">
            <span className="text-xs text-slate-500">Supplier</span>
            <span className="text-sm text-white">{created.beneficiary.name}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-xs text-slate-500">Beneficiary Bank</span>
            <span className="text-sm text-white">{created.beneficiary.bank}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-xs text-slate-500">Amount</span>
            <span className="text-sm font-bold text-amber-400">{created.amount.toLocaleString()} {created.currency}</span>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs text-amber-300">
            Next: authorise this payment with a one-time code (coming in the next build step). The beneficiary is locked to the verified supplier and cannot be changed.
          </p>
        </div>
        {created.lcCheckPending && (
          <p className="mt-3 text-xs text-slate-600">
            Note: LC beneficiary cross-check will apply once LC capture is enabled.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="border-b border-white/10 bg-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Pay Supplier</h2>
          <p className="text-xs text-slate-500 mt-0.5">Authorise payment to {supplierName} via ROECNY</p>
        </div>
        {!open && (
          <button onClick={() => setOpen(true)}
            className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition">
            Pay Supplier
          </button>
        )}
      </div>

      {open && (
        <div className="p-6 flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-amber-500/5 px-4 py-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              The payment goes only to the verified supplier's account for the chosen settlement currency. You cannot change the beneficiary. KYA does not hold or move your funds — your bank executes the payment under your authorisation.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Settlement Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="rounded-xl bg-slate-900 border border-white/10 p-3.5 text-white focus:outline-none focus:border-amber-400/50 w-full text-sm">
              <option value="USD">USD — US Dollar</option>
              <option value="RMB">RMB — Chinese Yuan</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Amount ({currency})</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 p-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 w-full text-sm"
              placeholder="Enter amount" />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setOpen(false)} disabled={submitting}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 hover:text-white transition disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={submitting}
              className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">
              {submitting ? "Creating Instruction..." : "Create Payment Instruction"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}