"use client";

import { useState } from "react";
import Link from "next/link";

export default function KYCPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setMessage("Submitting...");

    const response = await fetch("/api/kyc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_type: "individual",
        title: (document.getElementById("title") as HTMLSelectElement).value,
        first_name: (document.getElementById("first_name") as HTMLInputElement).value,
        last_name: (document.getElementById("last_name") as HTMLInputElement).value,
        email: (document.getElementById("email") as HTMLInputElement).value,
        phone: (document.getElementById("phone") as HTMLInputElement).value,
        dob: (document.getElementById("dob") as HTMLInputElement).value,
        nationality: (document.getElementById("nationality") as HTMLInputElement).value,
        address: (document.getElementById("address") as HTMLInputElement).value,
        id_type: (document.getElementById("id_type") as HTMLSelectElement).value,
        id_number: (document.getElementById("id_number") as HTMLInputElement).value,
        source_of_funds: (document.getElementById("source_of_funds") as HTMLSelectElement).value,
        is_joint_account: false,
        joint_full_name: (document.getElementById("joint_full_name") as HTMLInputElement).value,
      }),
    });

    if (response.ok) {
      setMessage("KYC submitted successfully.");
    } else {
     const data = await response.json();
setMessage(data.error || "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard/onboarding" className="text-amber-400 hover:text-amber-300">
          ← Back to Onboarding
        </Link>

        <h1 className="mt-8 text-4xl font-black">KYC Verification</h1>
        <p className="mt-3 text-slate-400">
          Complete personal verification for individual or joint account access.
        </p>

        <form className="mt-10 space-y-6">
          <select
  id="title"
  className="w-full rounded-xl border border-white/10 bg-slate-900 p-4"
>
  <option>Mr</option>
  <option>Mrs</option>
  <option>Miss</option>
  <option>Ms</option>
  <option>Dr</option>
  <option>Chief</option>
  <option>Prof</option>
  <option>Alhaji</option>
  <option>Alhaja</option>
  <option>Pastor</option>
  <option>Other</option>
</select>
          <input id="first_name" className="w-full rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="First Name" />
          <input id="last_name" className="w-full rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Last Name" />
          <input id="email" className="w-full rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Email Address" />
          <input id="phone" className="w-full rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Phone Number" />
          <input id="dob" type="date" className="w-full rounded-xl border border-white/10 bg-slate-900 p-4"/>
          <select
  id="nationality"
  className="w-full rounded-xl border border-white/10 bg-slate-900 p-4"
>
  <option value="">Select Nationality</option>
  {[
    "Nigerian",
    "Ghanaian",
    "South African",
    "Kenyan",
    "British",
    "American",
    "Canadian",
    "Chinese",
    "Indian",
    "Pakistani",
    "Emirati",
    "Saudi Arabian",
    "Turkish",
    "French",
    "German",
    "Italian",
    "Spanish",
    "Portuguese",
    "Dutch",
    "Belgian",
    "Irish",
    "Australian",
    "New Zealander",
    "Brazilian",
    "Egyptian",
    "Moroccan",
    "Senegalese",
    "Cameroonian",
    "Ivorian",
    "Togolese",
    "Beninese",
    "Other",
  ].map((nationality) => (
    <option key={nationality} value={nationality}>
      {nationality}
    </option>
  ))}
</select>
          <input id="address" className="w-full rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Residential Address" />

          <select id="id_type" className="w-full rounded-xl border border-white/10 bg-slate-900 p-4">
            <option>International Passport</option>
            <option>National ID</option>
            <option>Driver’s Licence</option>
            <option>Voter’s Card</option>
          </select>

          <input id="id_number" className="w-full rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="ID Number" />

          <select id="source_of_funds" className="w-full rounded-xl border border-white/10 bg-slate-900 p-4">
            <option>Salary / Employment Income</option>
            <option>Business Income</option>
            <option>Savings</option>
            <option>Investment Income</option>
            <option>Family Support</option>
            <option>Other</option>
          </select>

          <input id="joint_full_name" className="w-full rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Joint Applicant Full Name, if applicable" />

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-xl bg-amber-400 py-4 font-bold text-slate-950 hover:bg-amber-300"
          >
            Submit KYC Verification
          </button>

          {message && (
            <p className="text-center text-sm text-amber-400">{message}</p>
          )}
        </form>
      </div>
    </main>
  );
}