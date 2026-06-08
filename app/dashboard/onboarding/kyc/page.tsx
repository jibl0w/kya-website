"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KYCPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const getValue = (id: string) =>
      (document.getElementById(id) as HTMLInputElement | HTMLSelectElement)?.value || "";

    const firstName = getValue("first_name");
    const lastName = getValue("last_name");
    const dob = getValue("dob");
    const bvn = getValue("bvn");

    const response = await fetch("/api/kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account_type: "individual",
        title: getValue("title"),
        first_name: firstName,
        last_name: lastName,
        email: getValue("email"),
        phone: getValue("phone"),
        dob,
        nationality: getValue("nationality"),
        address: getValue("address"),
        id_type: getValue("id_type"),
        id_number: getValue("id_number"),
        source_of_funds: getValue("source_of_funds"),
        is_joint_account: false,
        joint_full_name: getValue("joint_full_name"),
        bvn,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    // Run BVN verification in background
    if (bvn && bvn.length === 11) {
      try {
        await fetch("/api/verify/bvn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bvn, first_name: firstName, last_name: lastName, dob }),
        });
      } catch (err) {
        console.error("BVN verification error:", err);
      }
    }

    router.push("/dashboard/onboarding/kyc/success");
  }

  const inp = "w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50";
  const lbl = "text-xs font-medium text-slate-400 mb-1.5 block";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/onboarding" className="text-sm text-slate-400 hover:text-white transition">← Back</Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">KYC Verification</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-2xl px-8 py-12">

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 mb-4">
            Personal Account — KYC Verification
          </div>
          <h1 className="text-3xl font-black mb-2">Personal Verification</h1>
          <p className="text-slate-400 text-sm">
            Complete your identity verification to access the KYA trade platform. All information is kept strictly confidential and used for compliance purposes only.
          </p>
        </div>

        <div className="flex flex-col gap-5">

          {/* Personal Details */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Personal Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Title</label>
                <select id="title" className={inp}>
                  <option value="">Select title</option>
                  {["Mr", "Mrs", "Miss", "Ms", "Dr", "Chief", "Prof", "Alhaji", "Alhaja", "Pastor", "Other"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>First Name <span className="text-amber-400">*</span></label>
                  <input id="first_name" className={inp} placeholder="Your first name" />
                </div>
                <div>
                  <label className={lbl}>Last Name <span className="text-amber-400">*</span></label>
                  <input id="last_name" className={inp} placeholder="Your last name" />
                </div>
              </div>
              <div>
                <label className={lbl}>Date of Birth <span className="text-amber-400">*</span></label>
                <input id="dob" type="date" className={inp} />
              </div>
              <div>
                <label className={lbl}>Nationality <span className="text-amber-400">*</span></label>
                <select id="nationality" className={inp}>
                  <option value="">Select nationality</option>
                  {["Nigerian", "Ghanaian", "South African", "Kenyan", "British", "American", "Canadian", "Chinese", "Indian", "Pakistani", "Emirati", "Saudi Arabian", "Turkish", "French", "German", "Italian", "Spanish", "Portuguese", "Dutch", "Belgian", "Irish", "Australian", "New Zealander", "Brazilian", "Egyptian", "Moroccan", "Senegalese", "Cameroonian", "Ivorian", "Togolese", "Beninese", "Other"].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Contact Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Email Address <span className="text-amber-400">*</span></label>
                <input id="email" type="email" className={inp} placeholder="your@email.com" />
              </div>
              <div>
                <label className={lbl}>Phone Number</label>
                <input id="phone" className={inp} placeholder="+234 800 000 0000" />
              </div>
              <div>
                <label className={lbl}>Residential Address <span className="text-amber-400">*</span></label>
                <input id="address" className={inp} placeholder="Your full residential address" />
              </div>
            </div>
          </div>

          {/* Identity Document */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Identity Document</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>ID Type <span className="text-amber-400">*</span></label>
                <select id="id_type" className={inp}>
                  <option value="">Select ID type</option>
                  <option>International Passport</option>
                  <option>National ID</option>
                  <option>Driver&apos;s Licence</option>
                  <option>Voter&apos;s Card</option>
                </select>
              </div>
              <div>
                <label className={lbl}>ID Number <span className="text-amber-400">*</span></label>
                <input id="id_number" className={inp} placeholder="Enter your ID number" />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Financial Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>BVN — Bank Verification Number <span className="text-amber-400">*</span></label>
                <input id="bvn" className={inp} placeholder="Enter your 11-digit BVN" maxLength={11} />
                <p className="text-xs text-slate-600 mt-1.5">Your BVN will be verified against your submitted details via a licensed verification provider.</p>
              </div>
              <div>
                <label className={lbl}>Source of Funds <span className="text-amber-400">*</span></label>
                <select id="source_of_funds" className={inp}>
                  <option value="">Select source of funds</option>
                  <option>Salary / Employment Income</option>
                  <option>Business Income</option>
                  <option>Savings</option>
                  <option>Investment Income</option>
                  <option>Family Support</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Joint Applicant Full Name (if applicable)</label>
                <input id="joint_full_name" className={inp} placeholder="Leave blank if not a joint account" />
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              By submitting this form you confirm that all information provided is accurate and complete. KYA Digital Services Ltd is not a bank or PSP. Your data is used solely for compliance and identity verification purposes in accordance with applicable AML/CFT regulations and the CBN 2025 AML Baseline Standards.
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
            {submitting ? "Submitting & Verifying..." : "Submit KYC Verification →"}
          </button>

        </div>
      </div>
    </main>
  );
}