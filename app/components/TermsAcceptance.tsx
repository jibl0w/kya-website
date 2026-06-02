"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  onAccept: () => void;
}

export default function TermsAcceptance({ onAccept }: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-3">KY<span className="text-amber-400">A</span></h1>
          <p className="text-slate-400">Before you begin — please read and accept our terms</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-6">

          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <p className="text-sm font-semibold text-amber-400 mb-2">Important — Please Read</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              KYA Digital Services Ltd is a technology and transaction orchestration platform. We are <strong className="text-white">not a bank</strong>, payment service provider, or financial institution. We do not hold, transfer, or process customer funds. All financial activities are conducted by licensed banking and settlement partners.
            </p>
          </div>

          <h2 className="text-lg font-bold mb-4">Platform Terms Summary</h2>

          <div className="flex flex-col gap-4 mb-8">
            {[
              { title: "KYA is not a bank or PSP", desc: "KYA orchestrates trade transactions but does not hold or process your funds. All financial activities are handled by CBN-licensed and MAS-regulated institutions." },
              { title: "Your funds are held by licensed partners", desc: "Naira payments are held by our licensed Nigerian banking partner. USD settlement funds are held in your name at a MAS-regulated offshore digital bank." },
              { title: "Payment instructions are transmitted — not executed", desc: "When you authorise a payment through KYA, we transmit your instruction to the licensed settlement institution. KYA does not execute or control the payment." },
              { title: "You remain the transaction owner", desc: "You are the importer and trade owner throughout the entire transaction. KYA coordinates the process but you retain full ownership of the transaction." },
              { title: "Accurate information is required", desc: "You must provide accurate and complete identity and business information during onboarding. Providing false information may result in account suspension and regulatory referral." },
              { title: "Compliance with Nigerian law", desc: "All transactions are subject to CBN regulations and applicable Nigerian law. You are responsible for ensuring your import activities comply with all relevant regulations." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center mt-0.5">
                  <span className="text-amber-400 text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer" onClick={() => setChecked(!checked)}>
            <div className={"flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition " + (checked ? "bg-amber-400 border-amber-400" : "border-white/30")}>
              {checked && <span className="text-slate-950 text-xs font-bold">✓</span>}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              I have read and understand the above terms. I confirm that KYA Digital Services Ltd is a technology platform and not a bank or financial institution. I agree to the full{" "}
              <Link href="/terms" target="_blank" className="text-amber-400 hover:text-amber-300 underline">
                Platform Terms of Service
              </Link>{" "}
              and confirm that all information I provide will be accurate and complete.
            </p>
          </div>

          <button
            onClick={() => { if (checked) onAccept(); }}
            disabled={!checked}
            className={"w-full rounded-xl py-4 text-sm font-semibold transition " + (checked ? "bg-amber-400 text-slate-950 hover:bg-amber-300" : "bg-white/10 text-slate-600 cursor-not-allowed")}>
            {checked ? "Accept & Continue →" : "Please tick the box above to continue"}
          </button>

        </div>

        <p className="text-center text-xs text-slate-600">
          By continuing you agree to the KYA Platform Terms of Service · KYA Digital Services Ltd · CAC Registered · Nigeria
        </p>

      </div>
    </div>
  );
}