"use client";

import { useState, useEffect } from "react";

interface Props {
  transactionId: string;
  fxRoute?: string;
}

interface SourceStatus {
  sourceLegStatus: string;
  fxAuthorised: boolean;
  adNominated: { name: string; bank: string; accountMasked: string; amountNgn: number | null; fxReference: string | null } | null;
  instruction: {
    instructionId: string;
    status: string;
    amount: number;
    currency: string;
    beneficiaryName: string;
    beneficiaryBank: string;
    beneficiaryAccountMasked: string | null;
    hasBankConfirmation: boolean;
    hasCustomerConfirmation: boolean;
  } | null;
}

export default function PaySource({ transactionId, fxRoute }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SourceStatus | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // in-session OTP phase for a just-created instruction
  const [created, setCreated] = useState<{ instructionId: string; beneficiary: { name: string; bank: string; accountMasked: string }; amount: number } | null>(null);
  const [phase, setPhase] = useState<"idle" | "created" | "otp">("idle");
  const [otp, setOtp] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  async function load() {
    try {
      const res = await fetch("/api/payment-instructions/source-status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });
      const d = await res.json();
      setData(d);
      if (d.adNominated && !amount && d.adNominated.amountNgn) setAmount(String(d.adNominated.amountNgn));
    } catch {
      setData(null);
    } finally { setLoading(false); }
  }

  async function handleCreate() {
    setError(null);
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payment-instructions/create-source", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, amount: amt }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create instruction.");
      setCreated(d); setPhase("created");
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
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to send code.");
      setSentTo(d.sentTo); setPhase("otp");
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
      const vd = await v.json();
      if (!v.ok) throw new Error(vd.error || "Invalid code.");
      const s = await fetch("/api/payment-instructions/sign-transmit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructionId: created.instructionId }),
      });
      const sd = await s.json();
      if (!s.ok) throw new Error(sd.error || "Failed to send.");
      setCreated(null); setPhase("idle"); setOtp("");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally { setSubmitting(false); }
  }

  async function handleUploadConfirmation() {
    if (!data?.instruction || !uploadFile) { setError("Choose a file first."); return; }
    setError(null); setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("instructionId", data.instruction.instructionId);
      const res = await fetch("/api/payment-instructions/upload-confirmation", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload failed.");
      setUploadFile(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally { setSubmitting(false); }
  }

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-6"><p className="text-sm text-slate-500">Loading Source payment status…</p></div>;
  }

  // --- Self-funded: no FX authorisation needed; show funding guidance, allow payment ---
  if (fxRoute === "self_funded" && data && !data.fxAuthorised) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-semibold mb-1">Self-Funded Payment</h2>
        <p className="text-xs text-slate-500 mb-4">You are funding this trade with your own foreign exchange.</p>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4">
          <p className="text-xs text-amber-300">
            Transfer your own foreign exchange to your ROECNY account. Once received, the funds are blocked and secured for payment to this supplier. Enhanced Due Diligence on your source of funds is required before payment can be released.
          </p>
        </div>
        <p className="text-xs text-slate-500">Once your ROECNY account is funded and your source-of-funds documentation is cleared, you will be able to authorise payment to the supplier here.</p>
      </div>
    );
  }

  // --- Not yet FX-authorised: gated (apply-for-FX route) ---
  if (data && !data.fxAuthorised) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-semibold mb-1">Source Payment (NGN)</h2>
        <p className="text-xs text-slate-500 mb-4">Funding the trade via your Source MFB account.</p>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs text-amber-300">
            Awaiting FX authorisation. Once your Form M is processed and the authorised dealer authorises the FX, the destination account will appear here and you can make the NGN payment.
          </p>
        </div>
      </div>
    );
  }

  // --- In-session OTP ---
  if (phase === "otp" && created) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-white/5 p-6">
        <h2 className="font-semibold mb-1">Authorise Source Payment</h2>
        <p className="text-xs text-slate-500 mb-4">
          {sentTo ? "Code sent to " + sentTo + "." : "Enter the code sent to your email."} Authorising{" "}
          <span className="text-amber-400 font-medium">₦{created.amount.toLocaleString()}</span> to {created.beneficiary.name}.
        </p>
        <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric" placeholder="------"
          className="w-full text-center text-2xl font-mono tracking-[0.4em] rounded-xl bg-slate-950 border-2 border-white/20 focus:border-amber-400 text-white py-4 mb-4 outline-none" />
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
        <div className="flex gap-3">
          <button onClick={handleSendOtp} disabled={submitting} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 hover:text-white transition disabled:opacity-50">Resend</button>
          <button onClick={handleVerifyAndSend} disabled={submitting || otp.length !== 6} className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">
            {submitting ? "Authorising..." : "Authorise & Send Payment"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "created" && created) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-semibold mb-1">Source Payment Ready</h2>
        <p className="text-xs text-slate-500 mb-4">Instruction <span className="font-mono text-amber-400">{created.instructionId}</span> — destination locked.</p>
        <div className="rounded-xl border border-white/10 bg-slate-900/50 divide-y divide-white/5 mb-4">
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Destination</span><span className="text-sm text-white">{created.beneficiary.name}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Bank</span><span className="text-sm text-white">{created.beneficiary.bank}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Account</span><span className="text-sm text-slate-500 font-mono">{created.beneficiary.accountMasked}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Amount</span><span className="text-sm font-bold text-amber-400">₦{created.amount.toLocaleString()}</span></div>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
        <button onClick={handleSendOtp} disabled={submitting} className="w-full rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">
          {submitting ? "Sending code..." : "Authorise with One-Time Code →"}
        </button>
      </div>
    );
  }

  // --- Existing instruction (persistent) ---
  if (data?.instruction) {
    const i = data.instruction;
    const statusLabel: Record<string, string> = {
      otp_pending: "Awaiting authorisation", otp_verified: "Authorised — sending", signed: "Signed",
      transmitted: "Sent to Source MFB — awaiting confirmation", confirmation_pending: "Awaiting confirmations",
      reconciled: "Reconciled", settled: "Settled",
    };
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Source Payment (NGN)</h2>
          <span className={"text-xs font-medium " + (i.status === "settled" ? "text-emerald-400" : "text-amber-400")}>{statusLabel[i.status] || i.status}</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/50 divide-y divide-white/5 mb-4">
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Instruction</span><span className="text-sm font-mono text-amber-400">{i.instructionId}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Destination</span><span className="text-sm text-white">{i.beneficiaryName}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Bank</span><span className="text-sm text-white">{i.beneficiaryBank}</span></div>
          {i.beneficiaryAccountMasked && <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Account</span><span className="text-sm text-slate-500 font-mono">{i.beneficiaryAccountMasked}</span></div>}
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Amount</span><span className="text-sm font-bold text-amber-400">₦{i.amount.toLocaleString()}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={"rounded-xl border px-4 py-3 " + (i.hasBankConfirmation ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/5")}>
            <p className="text-xs text-slate-500">Source MFB confirmation</p>
            <p className={"text-xs font-medium mt-1 " + (i.hasBankConfirmation ? "text-emerald-400" : "text-slate-500")}>{i.hasBankConfirmation ? "✓ Received" : "Pending"}</p>
          </div>
          <div className={"rounded-xl border px-4 py-3 " + (i.hasCustomerConfirmation ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/5")}>
            <p className="text-xs text-slate-500">Your confirmation</p>
            <p className={"text-xs font-medium mt-1 " + (i.hasCustomerConfirmation ? "text-emerald-400" : "text-slate-500")}>{i.hasCustomerConfirmation ? "✓ Uploaded" : "Not uploaded"}</p>
          </div>
        </div>
        {i.status === "settled" ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3"><p className="text-xs text-emerald-300">Source payment settled. Both Source MFB's confirmation and your uploaded receipt corroborate this payment.</p></div>
        ) : !i.hasCustomerConfirmation ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400 mb-3">Upload your NGN payment receipt. Reconciliation completes when both Source MFB's confirmation and your upload are present.</p>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="text-xs text-slate-400 mb-3 block" />
            <button onClick={handleUploadConfirmation} disabled={submitting || !uploadFile} className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">{submitting ? "Uploading..." : "Upload Confirmation"}</button>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"><p className="text-xs text-amber-300">Your confirmation is recorded. Awaiting Source MFB's confirmation to reconcile.</p></div>
        )}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  // --- FX authorised, no instruction yet: show the create form ---
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="font-semibold mb-1">Source Payment (NGN)</h2>
      <p className="text-xs text-slate-500 mb-4">FX authorised. Make the NGN payment to the authorised destination account.</p>
      {data?.adNominated && (
        <div className="rounded-xl border border-white/10 bg-slate-900/50 divide-y divide-white/5 mb-4">
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Destination</span><span className="text-sm text-white">{data.adNominated.name}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Bank</span><span className="text-sm text-white">{data.adNominated.bank}</span></div>
          <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">Account</span><span className="text-sm text-slate-500 font-mono">{data.adNominated.accountMasked}</span></div>
          {data.adNominated.fxReference && <div className="flex justify-between px-4 py-3"><span className="text-xs text-slate-500">FX Reference</span><span className="text-sm text-white">{data.adNominated.fxReference}</span></div>}
        </div>
      )}
      <div className="rounded-xl border border-white/10 bg-amber-500/5 px-4 py-3 mb-4">
        <p className="text-xs text-slate-400 leading-relaxed">The destination is the account nominated by the authorised dealer. You cannot change it. KYA does not hold or move your funds.</p>
      </div>
      <label className="text-xs font-medium text-slate-400 mb-1.5 block">Amount (NGN)</label>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
        className="rounded-xl bg-white/5 border border-white/10 p-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 w-full text-sm mb-4" placeholder="Enter NGN amount" />
      {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
      <button onClick={handleCreate} disabled={submitting} className="w-full rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">
        {submitting ? "Creating..." : "Create Source Payment Instruction"}
      </button>
    </div>
  );
}