"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Dojah from "react-dojah";

export default function KYCPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState<"form" | "consent" | "verify">("form");
  const [consent, setConsent] = useState(false);
  const [savedData, setSavedData] = useState<{ firstName: string; lastName: string; dob: string; email: string; bvn: string; nin: string } | null>(null);
  const router = useRouter();
  const { user } = useUser();

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const getValue = (id: string) =>
      (document.getElementById(id) as HTMLInputElement | HTMLSelectElement)?.value || "";

    const firstName = getValue("first_name");
    const lastName = getValue("last_name");
    const email = getValue("email");
    const dob = getValue("dob");
    const nationality = getValue("nationality");
    const address = getValue("address");
    const idType = getValue("id_type");
    const idNumber = getValue("id_number");
    const bvn = getValue("bvn");
    const nin = getValue("nin");
    const sourceOfFunds = getValue("source_of_funds");

    if (!firstName.trim()) { setError("First name is required."); setSubmitting(false); return; }
    if (!lastName.trim()) { setError("Last name is required."); setSubmitting(false); return; }
    if (!email.trim()) { setError("Email address is required."); setSubmitting(false); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); setSubmitting(false); return; }
    if (!dob) { setError("Date of birth is required."); setSubmitting(false); return; }
    if (!nationality) { setError("Please select your nationality."); setSubmitting(false); return; }
    if (!address.trim()) { setError("Residential address is required."); setSubmitting(false); return; }
    if (!idType) { setError("Please select an ID type."); setSubmitting(false); return; }
    if (!idNumber.trim()) { setError("ID number is required."); setSubmitting(false); return; }
    if (!bvn.trim() || bvn.length !== 11) { setError("Please enter a valid 11-digit BVN."); setSubmitting(false); return; }
    if (!nin.trim() || nin.length !== 11) { setError("Please enter a valid 11-digit NIN."); setSubmitting(false); return; }
    if (!sourceOfFunds) { setError("Please select your source of funds."); setSubmitting(false); return; }

    const response = await fetch("/api/kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account_type: "individual",
        title: getValue("title"),
        first_name: firstName,
        last_name: lastName,
        email,
        phone: getValue("phone"),
        dob,
        nationality,
        address,
        id_type: idType,
        id_number: idNumber,
        source_of_funds: sourceOfFunds,
        is_joint_account: false,
        joint_full_name: getValue("joint_full_name"),
        bvn,
        nin,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setSavedData({ firstName, lastName, dob, email, bvn, nin });
    setSubmitting(false);
    setStage("consent");
  }

  const appID = process.env.NEXT_PUBLIC_DOJAH_APP_ID || "";
  const publicKey = process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "";
  const widgetID = process.env.NEXT_PUBLIC_DOJAH_WIDGET_ID_KYC || "";

  const dojahConfig = { widget_id: widgetID };
  const dojahUserData = savedData
    ? { first_name: savedData.firstName, last_name: savedData.lastName, dob: savedData.dob, email: savedData.email, residence_country: "NG" }
    : {};
  const dojahGovData = savedData ? { bvn: savedData.bvn, nin: savedData.nin } : {};
  const dojahMetadata = { user_id: user?.id || "" };

  const dojahResponse = (type: string, data: unknown) => {
    console.log("Dojah event:", type, data);
    if (type === "success" || type === "close") {
      router.push("/dashboard/onboarding/kyc/success");
    }
  };

  const inp = "w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50";
  const lbl = "text-xs font-medium text-slate-400 mb-1.5 block";

  if (stage === "verify") {
    return (
      <Dojah
        response={dojahResponse}
        appID={appID}
        publicKey={publicKey}
        type="custom"
        config={dojahConfig}
        userData={dojahUserData}
        govData={dojahGovData}
        metadata={dojahMetadata}
      />
    );
  }

  if (stage === "consent") {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
          <span className="text-sm text-slate-400">KYC Verification</span>
          <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
        </header>
        <div className="mx-auto max-w-2xl px-8 py-12">
          <h1 className="text-3xl font-black mb-2">Identity Verification</h1>
          <p className="text-slate-400 text-sm mb-8">
            Your details have been saved. The final step is a live identity check — verifying your government ID and a live selfie. This confirms you are who you say you are.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">Consent</h2>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 accent-amber-400"
              />
              <span className="text-xs text-slate-400 leading-relaxed">
                I consent to KYA Digital Services Ltd conducting identity verification, liveness and AML checks, and to KYA acting as the appointed due-diligence agent for ROECNY and sharing the verification results with ROECNY and the partner bank (Source MFB) for the sole purpose of facilitating my cross-border trade transactions, in accordance with applicable data-protection law (NDPR).
              </span>
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-6">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="button"
            disabled={!consent || !user?.id}
            onClick={() => {
              if (!user?.id) { setError("Could not identify your session. Please refresh and try again."); return; }
              setStage("verify");
            }}
            className="w-full rounded-xl bg-amber-400 py-4 font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Identity Verification →
          </button>
          <p className="text-xs text-slate-600 mt-3 text-center">
            You&apos;ll need good lighting and your government ID to hand.
          </p>
        </div>
      </main>
    );
  }

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
                <p className="text-xs text-slate-600 mt-1.5">Your ID will be verified against the issuing authority database.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Financial &amp; Identity Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>BVN — Bank Verification Number <span className="text-amber-400">*</span></label>
                <input id="bvn" className={inp} placeholder="Enter your 11-digit BVN" maxLength={11} />
                <p className="text-xs text-slate-600 mt-1.5">Your BVN will be verified against your submitted details via a licensed verification provider.</p>
              </div>
              <div>
                <label className={lbl}>NIN — National Identification Number <span className="text-amber-400">*</span></label>
                <input id="nin" className={inp} placeholder="Enter your 11-digit NIN" maxLength={11} />
                <p className="text-xs text-slate-600 mt-1.5">Your NIN will be verified against the NIMC database.</p>
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
            {submitting ? "Saving..." : "Continue to Identity Verification →"}
          </button>
        </div>
      </div>
    </main>
  );
}