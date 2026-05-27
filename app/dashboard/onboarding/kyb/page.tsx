"use client";

import { useState } from "react";
import Link from "next/link";

export default function KYBPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setMessage("Submitting...");

    const response = await fetch("/api/kyb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secretary_title: (document.getElementById("secretary_title") as HTMLSelectElement).value,
        company_name: (document.getElementById("company_name") as HTMLInputElement).value,
        cac_number: (document.getElementById("cac_number") as HTMLInputElement).value,
        tin: (document.getElementById("tin") as HTMLInputElement).value,
        business_type: (document.getElementById("business_type") as HTMLSelectElement).value,
        business_sector: (document.getElementById("business_sector") as HTMLInputElement).value,
        registered_address: (document.getElementById("registered_address") as HTMLInputElement).value,
        company_email: (document.getElementById("company_email") as HTMLInputElement).value,

        representative_title: (document.getElementById("representative_title") as HTMLSelectElement).value,
        representative_name: (document.getElementById("representative_name") as HTMLInputElement).value,
        representative_email: (document.getElementById("representative_email") as HTMLInputElement).value,
        representative_phone: (document.getElementById("representative_phone") as HTMLInputElement).value,

        director_name: (document.getElementById("director_name") as HTMLInputElement).value,
        director_email: (document.getElementById("director_email") as HTMLInputElement).value,
        director_phone: (document.getElementById("director_phone") as HTMLInputElement).value,

        additional_directors: (document.getElementById("additional_directors") as HTMLTextAreaElement).value,
        secretary_name: (document.getElementById("secretary_name") as HTMLInputElement).value,
        secretary_email: (document.getElementById("secretary_email") as HTMLInputElement).value,
        secretary_phone: (document.getElementById("secretary_phone") as HTMLInputElement).value,

        ubo_details: (document.getElementById("ubo_details") as HTMLTextAreaElement).value,
        trade_sector: (document.getElementById("trade_sector") as HTMLSelectElement).value,
        source_of_funds: (document.getElementById("source_of_funds") as HTMLSelectElement).value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("KYB submitted successfully.");
    } else {
      setMessage(data.error || "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard/onboarding" className="text-amber-400 hover:text-amber-300">
          ← Back to Onboarding
        </Link>

        <h1 className="mt-8 text-4xl font-black">KYB Verification</h1>
        <p className="mt-3 text-slate-400">
          Complete business verification before initiating trade transactions.
        </p>

        <form className="mt-10 space-y-8">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Company Information</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input id="company_name" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Company / Business Name" />
              <input id="cac_number" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="CAC Registration Number" />
              <input id="tin" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Tax Identification Number" />

              <select id="business_type" className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <option>Limited Liability Company</option>
                <option>Business Name / Enterprise</option>
                <option>Partnership</option>
                <option>Sole Proprietorship</option>
                <option>Other</option>
              </select>

              <input id="business_sector" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Business Sector" />
              <input id="company_email" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Company Email Address" />
              <input id="registered_address" className="rounded-xl border border-white/10 bg-slate-900 p-4 md:col-span-2" placeholder="Registered Business Address" />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Authorised Representative</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <select id="representative_title" className="rounded-xl border border-white/10 bg-slate-900 p-4">
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

              <input id="representative_name" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Full Name" />
              <input id="representative_email" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Email Address" />
              <input id="representative_phone" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Phone Number" />
            </div>
          </section>

          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <h2 className="text-xl font-bold">Directors</h2>
            <p className="mt-2 text-sm text-slate-400">
              At least one director must be provided with email and phone number.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input id="director_name" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Director 1 Full Name" />
              <input id="director_email" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Director 1 Email Address" />
              <input id="director_phone" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Director 1 Phone Number" />

              <textarea
                id="additional_directors"
                className="rounded-xl border border-white/10 bg-slate-900 p-4 md:col-span-2"
                rows={5}
                placeholder="Additional directors: include full name, email address, phone number, role/title and address for each director"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Company Secretary</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <select
  id="secretary_title"
  className="rounded-xl border border-white/10 bg-slate-900 p-4"
>
  <option value="">Select Title</option>
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
              <input id="secretary_name" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Secretary Full Name" />
              <input id="secretary_email" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Secretary Email Address" />
              <input id="secretary_phone" className="rounded-xl border border-white/10 bg-slate-900 p-4" placeholder="Secretary Phone Number" />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Shareholders & Beneficial Owners</h2>

            <textarea
              id="ubo_details"
              className="mt-6 w-full rounded-xl border border-white/10 bg-slate-900 p-4"
              rows={6}
              placeholder="List shareholders and UBOs: full name, ownership %, email, phone number, nationality/country and address"
            />
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Trade Profile</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <select id="trade_sector" className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <option>Solar & Energy Infrastructure</option>
                <option>Electronics & Consumer Devices</option>
                <option>Industrial Machinery</option>
                <option>Construction Materials</option>
                <option>Packaging & Manufacturing Inputs</option>
              </select>

              <select id="source_of_funds" className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <option>Business Revenue</option>
                <option>Shareholder Funds</option>
                <option>Bank Facility</option>
                <option>Investor Funding</option>
                <option>Other</option>
              </select>
            </div>
          </section>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-xl bg-amber-400 py-4 font-bold text-slate-950 hover:bg-amber-300"
          >
            Submit KYB Verification
          </button>

          {message && (
            <p className="text-center text-sm text-amber-400">{message}</p>
          )}
        </form>
      </div>
    </main>
  );
}