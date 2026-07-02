"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TermsAcceptance from "@/app/components/TermsAcceptance";

interface Props {
  kycStatus?: string | null;
  kybStatus?: string | null;
}

// Decide how a verification track should be presented based on its status.
function trackState(status?: string | null) {
  if (status === "approved") {
    return { locked: true, badge: "✓ Verified", badgeClass: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", action: "" };
  }
  if (status === "pending") {
    return { locked: true, badge: "Under Review", badgeClass: "bg-amber-500/20 text-amber-400 border border-amber-500/30", action: "" };
  }
  if (status === "rejected") {
    return { locked: false, badge: "Action Required", badgeClass: "bg-red-500/20 text-red-400 border border-red-500/30", action: "Retry Verification" };
  }
  // No profile yet / not started
  return { locked: false, badge: "", badgeClass: "", action: "Start Verification" };
}

export default function OnboardingWithTerms({ kycStatus = null, kybStatus = null }: Props) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
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

  const kyc = trackState(kycStatus);
  const kyb = trackState(kybStatus);

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
            Select the correct onboarding route. Personal customers complete KYC. Business customers complete KYB. You may complete either or both.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {/* KYC card */}
          {kyc.locked ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 opacity-70">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Personal Customer</p>
                <span className={"text-xs font-medium rounded-full px-3 py-1 " + kyc.badgeClass}>{kyc.badge}</span>
              </div>
              <h2 className="mt-3 text-3xl font-black">KYC Verification</h2>
              <p className="mt-4 text-slate-400">
                {kycStatus === "approved"
                  ? "Your personal verification is complete. No further action is needed."
                  : "Your personal verification has been submitted and is being reviewed by our compliance team."}
              </p>
            </div>
          ) : (
            <Link href="/dashboard/onboarding/kyc"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 hover:border-amber-400/50 transition">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Personal Customer</p>
                {kyc.badge && <span className={"text-xs font-medium rounded-full px-3 py-1 " + kyc.badgeClass}>{kyc.badge}</span>}
              </div>
              <h2 className="mt-3 text-3xl font-black">KYC Verification</h2>
              <p className="mt-4 text-slate-400">For individuals onboarding personally to use the KYA platform.</p>
              <div className="mt-6 flex flex-col gap-2">
                {["Government-issued ID", "Proof of address", "Selfie with ID", "NIN and BVN"].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-amber-400">◆</span>{item}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm font-semibold text-amber-400">{kyc.action} →</p>
            </Link>
          )}

          {/* KYB card */}
          {kyb.locked ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 opacity-70">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Business Customer</p>
                <span className={"text-xs font-medium rounded-full px-3 py-1 " + kyb.badgeClass}>{kyb.badge}</span>
              </div>
              <h2 className="mt-3 text-3xl font-black">KYB Verification</h2>
              <p className="mt-4 text-slate-400">
                {kybStatus === "approved"
                  ? "Your business verification is complete. No further action is needed."
                  : "Your business verification has been submitted and is being reviewed by our compliance team."}
              </p>
            </div>
          ) : (
            <Link href="/dashboard/onboarding/kyb"
              className="rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-amber-400/50 transition">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Business Customer</p>
                {kyb.badge && <span className={"text-xs font-medium rounded-full px-3 py-1 " + kyb.badgeClass}>{kyb.badge}</span>}
              </div>
              <h2 className="mt-3 text-3xl font-black">KYB Verification</h2>
              <p className="mt-4 text-slate-400">For companies, SMEs, enterprises, and corporate importers.</p>
              <div className="mt-6 flex flex-col gap-2">
                {["CAC Certificate", "MEMART", "Director ID", "Financial statements"].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-amber-400">◆</span>{item}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm font-semibold text-amber-400">{kyb.action} →</p>
            </Link>
          )}

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