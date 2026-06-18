"use client";

import Link from "next/link";

export default function KYCSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">← Dashboard</Link>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-lg px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Verification Submitted</h1>
          <p className="text-slate-400 text-sm">
            Your identity verification — including your government ID, BVN/NIN, and live selfie — has been submitted successfully.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">What happens next</p>
          <p className="text-lg font-bold">Our compliance team will review your submission.</p>
          <p className="text-sm text-slate-400 mt-2">This usually takes up to 2 business days. You&apos;ll be notified once your account is approved.</p>
        </div>

        <Link href="/dashboard/documents"
          className="block w-full rounded-xl bg-amber-400 py-4 font-bold text-slate-950 text-center hover:bg-amber-300 transition mb-3">
          Upload Supporting Documents →
        </Link>
        <Link href="/dashboard"
          className="block w-full rounded-xl border border-white/10 py-3 text-sm text-slate-400 text-center hover:text-white transition">
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}