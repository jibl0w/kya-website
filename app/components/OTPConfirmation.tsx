"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  purpose: string;
  transactionId?: string;
  onVerified: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export default function OTPConfirmation({ purpose, transactionId, onVerified, onCancel, title, description }: Props) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    sendOTP();
  }, []);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  async function sendOTP() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose, transactionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSent(true);
        setExpiresAt(new Date(data.expiresAt));
        setTimeLeft(600);
        setTimeout(() => inputs.current[0]?.focus(), 100);
      } else {
        setError("Failed to send verification code. Please try again.");
      }
    } finally { setSending(false); }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    if (newOtp.every(d => d !== "") && newOtp.join("").length === 6) {
      verifyOTP(newOtp.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      verifyOTP(pasted);
    }
  }

  async function verifyOTP(code: string) {
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpCode: code, purpose, transactionId }),
      });
      const data = await res.json();
      if (data.verified) {
        onVerified();
      } else {
        setError(data.error || "Invalid verification code.");
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => inputs.current[0]?.focus(), 100);
      }
    } finally { setVerifying(false); }
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur px-6">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/20 bg-slate-900 p-8">

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-xl font-black text-white mb-2">{title || "Verification Required"}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {description || "A 6-digit verification code has been sent to your registered email address."}
          </p>
        </div>

        {sent && (
          <>
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={verifying}
                  className={"w-12 h-14 text-center text-xl font-black rounded-xl border-2 bg-slate-950 text-white transition focus:outline-none " +
                    (digit ? "border-amber-400 text-amber-400" : "border-white/20 focus:border-amber-400/50")}
                />
              ))}
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="text-center mb-6">
              {timeLeft > 0 ? (
                <p className="text-xs text-slate-500">
                  Code expires in <span className="text-amber-400 font-mono">{minutes}:{seconds.toString().padStart(2, "0")}</span>
                </p>
              ) : (
                <p className="text-xs text-red-400">Code expired</p>
              )}
            </div>

            {verifying && (
              <div className="text-center mb-4">
                <div className="h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Verifying...</p>
              </div>
            )}
          </>
        )}

        {sending && (
          <div className="text-center mb-6">
            <div className="h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Sending verification code...</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {(timeLeft === 0 || !sent) && (
            <button onClick={sendOTP} disabled={sending}
              className="w-full rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">
              {sending ? "Sending..." : "Resend Code"}
            </button>
          )}
          <button onClick={onCancel}
            className="w-full rounded-xl border border-white/10 py-3 text-sm text-slate-400 hover:text-white transition">
            Cancel
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Do not share this code with anyone — KYA staff will never ask for your OTP
        </p>
      </div>
    </div>
  );
}