"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Dojah from "react-dojah";

export default function KYBPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState<"form" | "consent" | "verify">("form");
  const [consent, setConsent] = useState(false);
  const [savedData, setSavedData] = useState<{ repName: string; repEmail: string; cacNumber: string } | null>(null);
  const router = useRouter();
  const { user } = useUser();

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const getValue = (id: string) =>
      (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value || "";

    const companyName = getValue("company_name");
    const cacNumber = getValue("cac_number");
    const businessType = getValue("business_type");
    const registeredAddress = getValue("registered_address");
    const companyEmail = getValue("company_email");
    const representativeName = getValue("representative_name");
    const representativeEmail = getValue("representative_email");

    if (!companyName.trim()) { setError("Company name is required."); setSubmitting(false); return; }
    if (!cacNumber.trim()) { setError("CAC registration number is required."); setSubmitting(false); return; }
    if (!businessType) { setError("Please select a business type."); setSubmitting(false); return; }
    if (!registeredAddress.trim()) { setError("Registered business address is required."); setSubmitting(false); return; }
    if (!companyEmail.trim()) { setError("Company email address is required."); setSubmitting(false); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) { setError("Please enter a valid company email address."); setSubmitting(false); return; }
    if (!representativeName.trim()) { setError("Director or representative name is required."); setSubmitting(false); return; }
    if (!representativeEmail.trim()) { setError("Director email address is required."); setSubmitting(false); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(representativeEmail)) { setError("Please enter a valid director email address."); setSubmitting(false); return; }

    const response = await fetch("/api/kyb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: companyName,
        cac_number: cacNumber,
        tin: getValue("tin"),
        business_type: businessType,
        registered_address: registeredAddress,
        company_email: companyEmail,
        representative_title: getValue("representative_title"),
        representative_name: representativeName,
        representative_email: representativeEmail,
        representative_phone: getValue("representative_phone"),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setSavedData({ repName: representativeName, repEmail: representativeEmail, cacNumber });
    setSubmitting(false);
    setStage("consent");
  }

  // --- Dojah KYB widget config ---
  const appID = process.env.NEXT_PUBLIC_DOJAH_APP_ID || "";
  const publicKey = process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "";
  const widgetID = process.env.NEXT_PUBLIC_DOJAH_WIDGET_ID_KYB || "";

  const dojahConfig = { widget_id: widgetID };
  const repNameParts = savedData ? savedData.repName.trim().split(" ") : [];
  const dojahUserData = savedData
    ? {
        first_name: repNameParts[0] || "",
        last_name: repNameParts.slice(1).join(" ") || "",
        email: savedData.repEmail,
        residence_country: "NG",
      }
    : {};
  // CRITICAL: profile_type routes the webhook to kyb_profiles; user_id ties to THIS business.
  const dojahMetadata = { user_id: user?.id || "", profile_type: "kyb" };

  const dojahResponse = (type: string, data: unknown) => {
    console.log("Dojah KYB event:", type, data);
    if (type === "success" || type === "close") {
      router.push("/dashboard/onboarding/kyb/success");
    }
  };

  const inp = "w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50";
  const lbl = "text-xs font-medium text-slate-400 mb-1.5 block";

  // --- VERIFY STAGE ---
  if (stage === "verify") {
    return (
      <Dojah
        response={dojahResponse}
        appID={appID}
        publicKey={publicKey}
        type="custom"
        config={dojahConfig}
        userData={dojahUserData}
        metadata={dojahMetadata}
      />
    );
  }

  // --- CONSENT STAGE ---
  if (stage === "consent") {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
          <span className="text-sm text-slate-400">Business KYB Verification</span>
          <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
        </header>
        <div className="mx-auto max-w-2xl px-8 py-12">
          <h1 className="text-3xl font-black mb-2">Business &amp; Director Verification</h1>
          <p className="text-slate-400 text-sm mb-8">
            Your company details have been saved. The final step verifies the company registration (CAC) and confirms the identity of the authorised representative with a live check.
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
                I am authorised to act on behalf of this company, and I consent to KYA Digital Services Ltd conducting business (CAC), identity, liveness and AML checks, and to KYA acting as the appointed due-diligence agent for ROECNY and sharing the verification results with ROECNY and the partner bank (Source MFB) for the sole purpose of facilitating the company&apos;s cross-border trade transactions, in accordance with applicable data-protection law (NDPR).
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
            Start Business &amp; Director Verification →
          </button>
          <p className="text-xs text-slate-600 mt-3 text-center">
            The authorised representative will need good lighting and their government ID to hand.
          </p>
        </div>
      </main>
    );
  }

  // --- FORM STAGE (default) ---
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/onboarding" className="text-sm text-slate-400 hover:text-white transition">← Back</Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">Business KYB Verification</span>
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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Company Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Registered Company Name <span className="text-amber-400">*</span></label>
                <input id="company_name" className={inp} placeholder="As registered with CAC" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>CAC Registration Number <span className="text-amber-400">*</span></label>
                  <input id="cac_number" className={inp} placeholder="e.g. RC123456" />
                  <p className="text-xs text-slate-600 mt-1.5">Will be verified against the CAC database.</p>
                </div>
                <div>
                  <label className={lbl}>Tax Identification Number (TIN)</label>
                  <input id="tin" className={inp} placeholder="e.g. 12345678-0001" />
                </div>
              </div>
              <div>
                <label className={lbl}>Business Type <span className="text-amber-400">*</span></label>
                <select id="business_type" className={inp}>
                  <option value="">Select business type</option>
                  <option>Limited Liability Company (Ltd)</option>
                  <option>Public Limited Company (Plc)</option>
                  <option>Business Name</option>
                  <option>Incorporated Trustee</option>
                  <option>Partnership</option>
                  <option>Sole Proprietorship</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Registered Business Address <span className="text-amber-400">*</span></label>
                <input id="registered_address" className={inp} placeholder="Full registered address as on CAC documents" />
              </div>
              <div>
                <label className={lbl}>Company Email Address <span className="text-amber-400">*</span></label>
                <input id="company_email" type="email" className={inp} placeholder="company@business.com" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Director / Authorised Representative</h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Title</label>
                  <select id="representative_title" className={inp}>
                    <option value="">Select title</option>
                    {["Mr", "Mrs", "Miss", "Ms", "Dr", "Chief", "Prof", "Alhaji", "Alhaja", "Pastor", "Other"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Full Name <span className="text-amber-400">*</span></label>
                  <input id="representative_name" className={inp} placeholder="Director or authorised representative" />
                </div>
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
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  The director or authorised representative will be subject to a live identity check and AML/PEP screening in accordance with CBN AML 2025 requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              By submitting this form you confirm that all information provided is accurate and complete, and that you are authorised to submit this application on behalf of the company. KYA Digital Services Ltd is not a bank or PSP. Your data is used solely for compliance and identity verification purposes in accordance with applicable AML/CFT regulations and the CBN 2025 AML Baseline Standards.
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
            {submitting ? "Saving..." : "Continue to Business Verification →"}
          </button>
        </div>
      </div>
    </main>
  );
}