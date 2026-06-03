"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KYBPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const getValue = (id: string) =>
      (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value || "";

    const response = await fetch("/api/kyb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: getValue("company_name"),
        cac_number: getValue("cac_number"),
        tin: getValue("tin"),
        business_type: getValue("business_type"),
        registered_address: getValue("registered_address"),
        company_email: getValue("company_email"),
        representative_title: getValue("representative_title"),
        representative_name: getValue("representative_name"),
        representative_email: getValue("representative_email"),
        representative_phone: getValue("representative_phone"),
      }),
    });

    if (response.ok) {
      router.push("/dashboard/onboarding/kyb/success");
    } else {
      const data = await response.json();
      setError(data.error || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50";
  const lbl = "text-xs font-medium text-slate-400 mb-1.5 block";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/onboarding" className="text-sm text-slate-400 hover:text-white transition">← Back</Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">KYB Verification</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-2xl px-8 py-12">

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 mb-4">
            Business Account — KYB Verification
          </div>
          <h1 className="text-3xl font-black mb-2">Business Verification</h1>
          <p className="text-slate-400 text-sm">
            Complete your business verification to access the KYA trade platform. All information is kept strictly confidential and used for compliance purposes only.
          </p>
        </div>

        <div className="flex flex-col gap-5">

          {/* Company Details */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Company Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Company Name <span className="text-amber-400">*</span></label>
                <input id="company_name" className={inp} placeholder="Registered company name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>CAC Number <span className="text-amber-400">*</span></label>
                  <input id="cac_number" className={inp} placeholder="e.g. RC123456" />
                </div>
                <div>
                  <label className={lbl}>TIN</label>
                  <input id="tin" className={inp} placeholder="Tax Identification Number" />
                </div>
              </div>
              <div>
                <label className={lbl}>Business Type <span className="text-amber-400">*</span></label>
                <select id="business_type" className={inp}>
                  <option value="">Select business type</option>
                  <option>Private Limited Company (Ltd)</option>
                  <option>Public Limited Company (PLC)</option>
                  <option>Sole Proprietorship</option>
                  <option>Partnership</option>
                  <option>Cooperative</option>
                  <option>NGO / Non-Profit</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Registered Address <span className="text-amber-400">*</span></label>
                <input id="registered_address" className={inp} placeholder="Full registered business address" />
              </div>
              <div>
                <label className={lbl}>Company Email</label>
                <input id="company_email" type="email" className={inp} placeholder="company@business.com" />
              </div>
            </div>
          </div>

          {/* Director / Representative */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Director / Authorised Representative</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Title</label>
                <select id="representative_title" className={inp}>
                  <option value="">Select title</option>
                  {["Mr", "Mrs", "Miss", "Ms", "Dr", "Chief", "Prof", "Alhaji", "Alhaja", "Other"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Full Name <span className="text-amber-400">*</span></label>
                <input id="representative_name" className={inp} placeholder="Director or representative full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Email Address <span className="text-amber-400">*</span></label>
                  <input id="representative_email" type="email" className={inp} placeholder="director@business.com" />
                </div>
                <div>
                  <label className={lbl}>Phone Number</label>
                  <input id="representative_phone" className={inp} placeholder="+234 800 000 0000" />
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              By submitting this form you confirm that all information provided is accurate and complete, and that you are authorised to submit this application on behalf of the company. KYA Digital Services Ltd is not a bank or PSP. Your data is used solely for compliance and business verification purposes in accordance with applicable AML/CFT regulations.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-amber-400 py-4 font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit KYB Verification →"}
          </button>

        </div>
      </div>
    </main>
  );
}