"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TermsAcceptance from "@/app/components/TermsAcceptance";

export default function OnboardingWithTerms() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if terms already accepted in this session
    const accepted = sessionStorage.getItem("kya-terms-accepted");
    if (accepted === "true") setTermsAccepted(true);
    setChecking(false);
  }, []);

  function handleAccept() {
    sessionStorage.setItem("kya-terms-accepted", "true");
    setTermsAccepted(true);
  }

  if (checking) return null;

  if (!termsAccepted) return <TermsAcceptance onAccept={handleAccept} />;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-amber-400 hover:text-amber-300">
          ← Back to Dashboard
        </Link>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Customer Onboarding
          </p>
          <h1 className="mt-2 text-4xl font-black">Choose Verification Type</h1>
          <p className="mt-3 text-slate-400">
            Select the correct onboarding route. Personal customers complete KYC. Business customers complete KYB.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link href="/dashboard/onboarding/kyc"
            className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 hover:border-amber-400/50 transition">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Personal Customer</p>
            <h2 className="mt-3 text-3xl font-black">KYC Verification</h2>
            <p className="mt-4 text-slate-400">For individuals onboarding personally to use the KYA platform.</p>
            <div className="mt-6 flex flex-col gap-2">
              {["Government-issued ID", "Proof of address", "Selfie with ID", "NIN and BVN"].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-amber-400">◆</span>{item}
                </div>
              ))}
            </div>
          </Link>

          <Link href="/dashboard/onboarding/kyb"
            className="rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-amber-400/50 transition">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Business Customer</p>
            <h2 className="mt-3 text-3xl font-black">KYB Verification</h2>
            <p className="mt-4 text-slate-400">For companies, SMEs, enterprises, and corporate importers.</p>
            <div className="mt-6 flex flex-col gap-2">
              {["CAC Certificate", "MEMART", "Director ID", "Financial statements"].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-amber-400">◆</span>{item}
                </div>
              ))}
            </div>
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500 text-center">
            ✓ You have accepted the KYA Platform Terms of Service · KYA is not a bank or PSP · All funds held by licensed banking partners
          </p>
        </div>

      </div>
    </main>
  );
}