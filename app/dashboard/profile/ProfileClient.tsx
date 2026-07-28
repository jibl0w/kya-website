"use client";

import { useState } from "react";
import Link from "next/link";

interface KycProfile {
  title?: string;
  first_name?: string;
  last_name?: string;
  dob?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  address?: string;
  id_type?: string;
  id_number?: string;
  bvn?: string;
  nin?: string;
  kyc_status?: string;
}

interface KybProfile {
  company_name?: string;
  cac_number?: string;
  tin?: string;
  business_type?: string;
  registered_address?: string;
  company_email?: string;
  representative_title?: string;
  representative_name?: string;
  representative_email?: string;
  representative_phone?: string;
  kyb_status?: string;
}

interface Props {
  kyc: KycProfile | null;
  kyb: KybProfile | null;
}

const inp = "w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50";
const lockedInp = "w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-500 cursor-not-allowed";
const lbl = "text-xs font-medium text-slate-400 mb-1.5 block";

function LockedField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className={lbl}>{label} <span className="text-slate-600">🔒</span></label>
      <div className={lockedInp}>{value || "—"}</div>
    </div>
  );
}

export default function ProfileClient({ kyc, kyb }: Props) {
  const [tab, setTab] = useState<"personal" | "business">(kyc ? "personal" : "business");

  // KYC editable state
  const [kycPhone, setKycPhone] = useState(kyc?.phone || "");
  const [kycAddress, setKycAddress] = useState(kyc?.address || "");

  // KYB editable state
  const [kybPhone, setKybPhone] = useState(kyb?.representative_phone || "");
  const [kybEmail, setKybEmail] = useState(kyb?.company_email || "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveKyc() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType: "personal", phone: kycPhone, address: kycAddress }),
      });
      setMessage(res.ok ? "Your details have been updated." : "Could not save. Please try again.");
    } catch {
      setMessage("Could not save. Please try again.");
    } finally { setSaving(false); }
  }

  async function saveKyb() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType: "business", representative_phone: kybPhone, company_email: kybEmail }),
      });
      setMessage(res.ok ? "Your details have been updated." : "Could not save. Please try again.");
    } catch {
      setMessage("Could not save. Please try again.");
    } finally { setSaving(false); }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-amber-400 hover:text-amber-300">← Back to Dashboard</Link>

        <div className="mt-8 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">My Account</p>
          <h1 className="mt-2 text-4xl font-black">Personal Details</h1>
          <p className="mt-3 text-slate-400 text-sm">
            You can update your contact details below. Identity fields verified during onboarding are locked 🔒 and cannot be changed here.
          </p>
        </div>

        {/* Tabs (only show if customer has both) */}
        {kyc && kyb && (
          <div className="flex gap-2 mb-6">
            <button onClick={() => setTab("personal")}
              className={"rounded-lg px-5 py-2.5 text-sm font-medium transition " + (tab === "personal" ? "bg-amber-400 text-slate-950" : "border border-white/10 text-slate-400 hover:text-white")}>
              Personal (KYC)
            </button>
            <button onClick={() => setTab("business")}
              className={"rounded-lg px-5 py-2.5 text-sm font-medium transition " + (tab === "business" ? "bg-amber-400 text-slate-950" : "border border-white/10 text-slate-400 hover:text-white")}>
              Business (KYB)
            </button>
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <p className="text-sm text-amber-400">{message}</p>
          </div>
        )}

        {/* KYC panel */}
        {kyc && (tab === "personal" || !kyb) && (
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Editable Contact Details</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={lbl}>Phone Number</label>
                  <input value={kycPhone} onChange={e => setKycPhone(e.target.value)} className={inp} placeholder="+234 800 000 0000" />
                </div>
                <div>
                  <label className={lbl}>Residential Address</label>
                  <input value={kycAddress} onChange={e => setKycAddress(e.target.value)} className={inp} placeholder="Your residential address" />
                </div>
                <button onClick={saveKyc} disabled={saving}
                  className="rounded-xl bg-amber-400 py-3 font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">
                  {saving ? "Saving..." : "Save Contact Details"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">Verified Identity (Locked)</h2>
              <div className="grid grid-cols-2 gap-4">
                <LockedField label="Title" value={kyc.title} />
                <LockedField label="First Name" value={kyc.first_name} />
                <LockedField label="Last Name" value={kyc.last_name} />
                <LockedField label="Date of Birth" value={kyc.dob} />
                <LockedField label="Nationality" value={kyc.nationality} />
                <LockedField label="Email" value={kyc.email} />
                <LockedField label="ID Type" value={kyc.id_type} />
                <LockedField label="ID Number" value={kyc.id_number} />
                <LockedField label="BVN" value={kyc.bvn} />
                <LockedField label="NIN" value={kyc.nin} />
              </div>
              <p className="text-xs text-slate-600 mt-4">To change your email or any locked field, please contact support.</p>
            </div>
          </div>
        )}

        {/* KYB panel */}
        {kyb && (tab === "business" || !kyc) && (
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">Editable Contact Details</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={lbl}>Company Email</label>
                  <input value={kybEmail} onChange={e => setKybEmail(e.target.value)} className={inp} placeholder="company@email.com" />
                </div>
                <div>
                  <label className={lbl}>Representative Phone</label>
                  <input value={kybPhone} onChange={e => setKybPhone(e.target.value)} className={inp} placeholder="+234 800 000 0000" />
                </div>
                <button onClick={saveKyb} disabled={saving}
                  className="rounded-xl bg-amber-400 py-3 font-bold text-slate-950 hover:bg-amber-300 transition disabled:opacity-50">
                  {saving ? "Saving..." : "Save Contact Details"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">Verified Business Identity (Locked)</h2>
              <div className="grid grid-cols-2 gap-4">
                <LockedField label="Company Name" value={kyb.company_name} />
                <LockedField label="CAC Number" value={kyb.cac_number} />
                <LockedField label="TIN" value={kyb.tin} />
                <LockedField label="Business Type" value={kyb.business_type} />
                <LockedField label="Registered Address" value={kyb.registered_address} />
                <LockedField label="Director Name" value={(kyb.representative_title || "") + " " + (kyb.representative_name || "")} />
                <LockedField label="Director Email" value={kyb.representative_email} />
              </div>
              <p className="text-xs text-slate-600 mt-4">The registered address and other CAC-verified fields are locked. To change them, please contact support.</p>
            </div>
          </div>
        )}

        {!kyc && !kyb && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-slate-400">No verification profile found. Please complete onboarding first.</p>
            <Link href="/dashboard/onboarding" className="mt-4 inline-block text-amber-400 hover:text-amber-300">Go to Onboarding →</Link>
          </div>
        )}

      </div>
    </main>
  );
}