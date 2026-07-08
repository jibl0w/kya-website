"use client";

import { useState, useEffect } from "react";

interface Props {
  transactionId: string;
  fxRoute?: string;
  eddCleared?: boolean;
  supplierName: string;
  defaultCurrency: string;
  totalValue: number;
}

interface InstructionState {
  instructionId: string;
  status: string;
  amount: number;
  currency: string;
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryAccountMasked: string | null;
  hasBankConfirmation: boolean;
  hasCustomerConfirmation: boolean;
}

export default function PaySupplier({ transactionId, supplierName, defaultCurrency, totalValue, fxRoute, eddCleared }: Props) {
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<InstructionState | null>(null);

  // create form
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState(defaultCurrency === "RMB" ? "RMB" : "USD");
  const [amount, setAmount] = useState(String(totalValue || ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // newly-created instruction (in-session, pre-authorisation)
  const [created, setCreated] = useState<{ instructionId: string; beneficiary: { name: string; bank: string; accountMasked?: string }; amount: number; currency: string } | null>(null);
  const [phase, setPhase] = useState<"idle" | "created" | "otp">("idle");
  const [otp, setOtp] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  // confirmation upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  async function loadExisting() {
    try {
      const res = await fetch("/api/payment-instructions/by-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });
      const data = await res.json();
      setExisting(data.instruction || null);
    } catch {
      setExisting(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setError(null);
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payment-instructions/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, amount: amt, currency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payment instruction.");
      setCreated(data);
      setPhase("created");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally { setSubmitting(false); }
  }

  async function handleSendOtp() {
    if (!created) return;
    setError(null); setSubmitting(true);
    try {
      const res = await fetch("/api/payment-instructions/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructionId: created.instructionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code.");
      setSentTo(data.sentTo); setPhase("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally { setSubmitting(false); }
  }

  async function handleVerifyAndSend() {
    if (!created) return;
    setError(null);
    if (otp.length !== 6) { setError("Enter the 6-digit code."); return; }
    setSubmitting(true);
    try {
      const v = await fetch("/api/payment-instructions/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructionId: created.instructionId, otpCode: otp }),
      });
      const vData = await v.json();
      if (!v.ok) throw new Error(vData.error || "Invalid code.");

      const s = await fetch("/api/payment-instructions/sign-transmit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructionId: created.instructionId }),
      });
      const sData = await s.json();
      if (!s.ok) throw new Error(sData.error || "Failed to send.");

      // Reload to show the persistent post-transmission state.
      setCreated(null); setPhase("idle"); setOpen(false);
      await loadExisting();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally { setSubmitting(false); }
  }

  async function handleUploadConfirmation() {
    if (!existing || !uploadFile) { setError("Choose a file first."); return; }
    setError(null); setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("instructionId", existing.instructionId);
      const res = await fetch("/api/payment-instructions/upload-confirmation", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setUploadFile(null);
      await loadExisting();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally { setSubmitting(false); }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-slate-500">Loading payment status…</p>
      </div>
    );
  }
  if (fxRoute === "self_funded" && !eddCleared) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-semibold mb-1">Supplier Payment Locked</h2>
        <p className="text-xs text-amber-300 mt-2">
          This is a self-funded transaction. Payment to the supplier is locked until our compliance team clears the Enhanced Due Diligence (source of funds) review. You will be able to authorise payment here once EDD is cleared.
        </p>
      </div>
    );
  }

  // ---- EXISTING INSTRUCTION (persistent state) ----
  if (existing && phase === "idle") {
    const s = existing.status;

    const statusLabel: Record<string, string> = {
      otp_pending: "Awaiting authorisation",
      otp_verified: "Authorised — sending",
      signed: "Signed",
      transmitted: "Sent to ROECNY — awaiting payment confirmation",
      acknowledged: "Acknowledged by ROECNY",
      executed: "Executed",
      confirmation_pending: "Awaiting confirmations",
      reconciled: "Reconciled",
      settled: "Settled",
    };

    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Supplier Payment</h2>
          <span className={"text-xs font-medium " + (s === "settled" ? "text-emerald-400" : "text-amber-400")}>
            {statusLabel[s] || s}
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/50 divide-y divide-white/5 mb-4">
          <div className="flex justify-between px-4 py-3">
            <span className="text-xs text-slate-500">Instruction</span>
            <span className="text-sm font-mono text-amber-400">{existing.instructionId}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-xs text-slate-500">Supplier</span>
            <span className="text-sm text-white">{existing.beneficiaryName}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-xs text-slate-500">Beneficiary Bank</span>
            <span className="text-sm text-white">{existing.beneficiaryBank}</span>
          </div>
          {existing.beneficiaryAccountMasked && (
            <div className="flex justify-between px-4 py-3">
              <span className="text-xs text-slate-500">Account</span>
              <span className="text-sm text-slate-500 font-mono">{existing.beneficiaryAccountMasked}</span>
            </div>
          )}
          <div className="flex justify-between px-4 py-3">
            <span className="text-xs text-slate-500">Amount</span>
            <span className="text-sm font-bold text-amber-400">{existing.amount.toLocaleString()} {existing.currency}</span>
          </div>
        </div>

        {/* Reconciliation status */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={"rounded-xl border px-4 py-3 " + (existing.hasBankConfirmation ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/5")}>
            <p className="text-xs text-slate-500">ROECNY confirmation</p>
            <p className={"text-xs font-medium mt-1 " + (existing.hasBankConfirmation ? "text-emerald-400" : "text-slate-500")}>
              {existing.hasBankConfirmation ? "✓ Received" : "Pending"}
            </p>
          </div>
          <div className={"rounded-xl border px-4 py-3 " + (existing.hasCustomerConfirmation ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/5")}>
            <p className="text-xs text-slate-500">Your confirmation</p>
            <p className={"text-xs font-medium mt-1 " + (existing.hasCustomerConfirmation ? "text-emerald-400" : "text-slate-500")}>
              {existing.hasCustomerConfirmation ? "✓ Uploaded" : "Not uploaded"}
            </p>
          </div>
        </div>

        {s === "settled" ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <p className="text-xs text-emerald-300">
              Payment settled. Both ROECNY's confirmation and your uploaded receipt corroborate this payment. KYA did not hold or move the funds.
            </p>
          </div>
        ) : (
          <>
            {!existing.hasCustomerConfirmation && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400 mb-3">
                  Upload your payment confirmation (receipt) for this payment. Reconciliation completes when both ROECNY's confirmation and your upload are present.
                </p>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-400 mb-3 block" />
                <button onClick={handleUploadConfirmation} disabled={submitting || !uploadFile}
                  className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">
                  {submitting ? "Uploading..." : "Upload Confirmation"}
                </button>
              </div>
            )}
            {existing.hasCustomerConfirmation && !existing.hasBankConfirmation && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <p className="text-xs text-amber-300">Your confirmation is recorded. Awaiting ROECNY's payment confirmation to reconcile.</p>
              </div>
            )}
          </>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  // ---- IN-SESSION CREATE → OTP ----
  if (phase === "otp" && created) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-white/5 p-6">
        <h2 className="font-semibold mb-1">Authorise Payment</h2>
        <p className="text-xs text-slate-500 mb-4">
          {sentTo ? "Code sent to " + sentTo + "." : "Enter the code sent to your email."} Authorising{" "}
          <span className="text-amber-400 font-medium">{created.amount.toLocaleString()} {created.currency}</span> to {created.beneficiary.name}.
        </p>
        <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric" placeholder="------"
          className="w-full text-center text-2xl font-mono tracking-[0.4em] rounded-xl bg-slate-950 border-2 border-white/20 focus:border-amber-400 text-white py-4 mb-4 outline-none" />
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
        <div className="flex gap-3">
          <button onClick={handleSendOtp} disabled={submitting}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 hover:text-white transition disabled:opacity-50">Resend</button>
          <button onClick={handleVerifyAndSend} disabled={submitting || otp.length !== 6}
            className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">
            {submitting ? "Authorising..." : "Authorise & Send Payment"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "created" && created) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-semibold mb-1">Payment Instruction Ready</h2>
        <p className="text-xs text-slate-500 mb-4">Instruction <span className="font-mono text-amber-400">{created.instructionId}</span> — beneficiary locked.</p>
        <div className="rounded-xl border border-white/10 bg-slate-900/50 divide-y divide-white/5 mb-4">
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Supplier</span><span className="text-sm text-white">{created.beneficiary.name}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Bank</span><span className="text-sm text-white">{created.beneficiary.bank}</span></div>
          {created.beneficiary.accountMasked && (
            <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Account</span><span className="text-sm text-slate-500 font-mono">{created.beneficiary.accountMasked}</span></div>
          )}
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Amount</span><span className="text-sm font-bold text-amber-400">{created.amount.toLocaleString()} {created.currency}</span></div>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
        <button onClick={handleSendOtp} disabled={submitting}
          className="w-full rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">
          {submitting ? "Sending code..." : "Authorise with One-Time Code →"}
        </button>
      </div>
    );
  }

  // ---- INITIAL FORM (no existing instruction) ----
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="border-b border-white/10 bg-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Pay Supplier</h2>
          <p className="text-xs text-slate-500 mt-0.5">Authorise payment to {supplierName} via ROECNY</p>
        </div>
        {!open && (
          <button onClick={() => setOpen(true)}
            className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition">Pay Supplier</button>
        )}
      </div>
      {open && (
        <div className="p-6 flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-amber-500/5 px-4 py-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Payment goes only to the verified supplier's account for the chosen settlement currency. You cannot change the beneficiary. KYA does not hold or move your funds.
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
          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
          <div className="flex gap-3">
            <button onClick={() => setOpen(false)} disabled={submitting}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 hover:text-white transition disabled:opacity-50">Cancel</button>
            <button onClick={handleCreate} disabled={submitting}
              className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">
              {submitting ? "Creating..." : "Create Payment Instruction"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}