"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Supplier {
  id: string;
  supplier_name: string;
  trade_name?: string | null;
  country: string;
  city?: string | null;
  primary_category: string;
  products_offered?: string | null;
  minimum_order_value: number;
  lead_time_days: number;
  payment_terms: string;
  currencies_accepted: string[];
  verification_status: string;
  verified_at?: string | null;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  website?: string | null;
  year_established?: string | null;
}

const CATEGORIES = [
  "All Categories",
  "Electronics & Consumer Technology",
  "Solar & Energy Infrastructure",
  "Industrial Equipment & Machinery",
  "Construction & Building Materials",
  "Textiles, Packaging & Manufacturing Inputs",
  "Electric Vehicles & Accessories",
  "Agriculture & Farming Equipment",
];

const categoryColors: Record<string, string> = {
  "Electronics & Consumer Technology": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Solar & Energy Infrastructure": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "Industrial Equipment & Machinery": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Construction & Building Materials": "text-stone-400 bg-stone-500/10 border-stone-500/20",
  "Textiles, Packaging & Manufacturing Inputs": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Electric Vehicles & Accessories": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Agriculture & Farming Equipment": "text-green-400 bg-green-500/10 border-green-500/20",
};

const categoryIcons: Record<string, string> = {
  "Electronics & Consumer Technology": "💻",
  "Solar & Energy Infrastructure": "☀️",
  "Industrial Equipment & Machinery": "⚙️",
  "Construction & Building Materials": "🏗️",
  "Textiles, Packaging & Manufacturing Inputs": "🧵",
  "Electric Vehicles & Accessories": "🔋",
  "Agriculture & Farming Equipment": "🌾",
};

export default function SuppliersMarketplace({ suppliers }: { suppliers: Supplier[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const router = useRouter();

  const filtered = suppliers.filter(s => {
    const matchSearch = search === "" ||
      s.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.products_offered || "").toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      (s.city || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All Categories" || s.primary_category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categoryCounts = CATEGORIES.slice(1).reduce((acc, cat) => {
    acc[cat] = suppliers.filter(s => s.primary_category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  function handleStartTransaction(supplier: Supplier) {
    router.push("/transactions/new?supplierName=" + encodeURIComponent(supplier.supplier_name) + "&category=" + encodeURIComponent(supplier.primary_category));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between sticky top-0 bg-slate-950/95 backdrop-blur z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">← Dashboard</Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">Supplier Marketplace</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-1">Verified Supplier Network</p>
          <h1 className="text-3xl font-black mb-2">Supplier Marketplace</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            All suppliers listed here have been verified by the KYA compliance team. Browse by category, review supplier details, and initiate a trade transaction directly.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {CATEGORIES.slice(1).map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === categoryFilter ? "All Categories" : cat)}
              className={"rounded-2xl border p-4 text-left transition " + (categoryFilter === cat ? "border-amber-400/40 bg-amber-400/5" : "border-white/10 bg-white/5 hover:border-white/20")}>
              <span className="text-2xl block mb-2">{categoryIcons[cat]}</span>
              <p className="text-xs font-medium text-white leading-tight">{cat.split(" ")[0]}</p>
              <p className="text-xs text-slate-500 mt-1">{categoryCounts[cat] || 0} supplier{categoryCounts[cat] !== 1 ? "s" : ""}</p>
            </button>
          ))}
        </div>

        {/* Search and filter */}
        <div className="flex gap-3 mb-6 flex-wrap items-center">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, product, or location..."
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-slate-900 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {categoryFilter !== "All Categories" && (
            <button onClick={() => setCategoryFilter("All Categories")}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 hover:text-white transition">
              Clear ×
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-4">{filtered.length} verified supplier{filtered.length !== 1 ? "s" : ""}{categoryFilter !== "All Categories" ? " in " + categoryFilter : ""}</p>

        {suppliers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-16 text-center">
            <p className="text-4xl mb-4">🏭</p>
            <p className="font-semibold text-white mb-2">Supplier network coming soon</p>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">Our team is currently vetting and onboarding verified suppliers. Check back soon or contact us at info@kya.com.ng.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-slate-400 mb-2">No suppliers found matching your search.</p>
            <button onClick={() => { setSearch(""); setCategoryFilter("All Categories"); }}
              className="text-sm text-amber-400 hover:text-amber-300">Clear filters</button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Supplier list */}
            <div className="flex flex-col gap-3">
              {filtered.map(s => (
                <div key={s.id}
                  onClick={() => setSelectedSupplier(selectedSupplier?.id === s.id ? null : s)}
                  className={"rounded-2xl border p-5 cursor-pointer transition " + (selectedSupplier?.id === s.id ? "border-amber-400/40 bg-amber-400/5" : "border-white/10 bg-white/5 hover:border-white/20")}>

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{categoryIcons[s.primary_category] || "🏭"}</span>
                      <div>
                        <p className="font-bold text-white">{s.supplier_name}</p>
                        {s.trade_name && <p className="text-xs text-slate-500">{s.trade_name}</p>}
                        <p className="text-xs text-slate-500 mt-0.5">{s.country}{s.city ? ", " + s.city : ""}{s.year_established ? " · Est. " + s.year_established : ""}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-xs font-medium border rounded-full px-2 py-0.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                        ✓ KYA Verified
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className={"text-xs font-medium border rounded-full px-2 py-0.5 " + (categoryColors[s.primary_category] || "text-slate-400 bg-slate-500/10 border-slate-500/20")}>
                      {s.primary_category}
                    </span>
                  </div>

                  {s.products_offered && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{s.products_offered}</p>
                  )}

                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>MOQ: ${Number(s.minimum_order_value).toLocaleString()}</span>
                    <span>Lead: {s.lead_time_days} days</span>
                    <span>{s.payment_terms}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div className="sticky top-24">
              {!selectedSupplier ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                  <p className="text-4xl mb-4">👆</p>
                  <p className="text-slate-400">Select a supplier to view full details and start a transaction.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden max-h-[80vh] overflow-y-auto">

                  {/* Header */}
                  <div className="border-b border-white/10 bg-white/5 px-6 py-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{categoryIcons[selectedSupplier.primary_category] || "🏭"}</span>
                      <div>
                        <p className="text-xl font-black text-white">{selectedSupplier.supplier_name}</p>
                        {selectedSupplier.trade_name && <p className="text-sm text-slate-400">{selectedSupplier.trade_name}</p>}
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedSupplier.country}{selectedSupplier.city ? ", " + selectedSupplier.city : ""}
                          {selectedSupplier.year_established ? " · Est. " + selectedSupplier.year_established : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs font-medium border rounded-full px-2 py-0.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10">✓ KYA Verified</span>
                      <span className={"text-xs font-medium border rounded-full px-2 py-0.5 " + (categoryColors[selectedSupplier.primary_category] || "text-slate-400 border-slate-500/20 bg-slate-500/10")}>
                        {selectedSupplier.primary_category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-5">

                    {/* Products */}
                    {selectedSupplier.products_offered && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Products & Speciality</p>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-slate-300 leading-relaxed">{selectedSupplier.products_offered}</p>
                        </div>
                      </div>
                    )}

                    {/* Commercial terms */}
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Commercial Terms</p>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-1">Min Order</p>
                          <p className="text-sm font-bold text-amber-400">${Number(selectedSupplier.minimum_order_value).toLocaleString()}</p>
                        </div>
                        <div className="text-center border-x border-white/10">
                          <p className="text-xs text-slate-500 mb-1">Lead Time</p>
                          <p className="text-sm font-bold text-white">{selectedSupplier.lead_time_days} days</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-1">Payment</p>
                          <p className="text-sm font-bold text-white">{selectedSupplier.payment_terms}</p>
                        </div>
                      </div>
                    </div>

                  
            
                    {/* KYA notice */}
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="text-amber-400 font-semibold">KYA Verified Supplier.</span> This supplier has been vetted by the KYA compliance team. All transactions are processed through KYA's trade infrastructure with full LC and FX support.
                      </p>
                    </div>

                    {/* CTA */}
                    <button onClick={() => handleStartTransaction(selectedSupplier)}
                      className="w-full rounded-xl bg-amber-400 py-4 font-bold text-slate-950 hover:bg-amber-300 transition">
                      Start Transaction with {selectedSupplier.supplier_name.split(" ")[0]} →
                    </button>

                    <button onClick={() => setSelectedSupplier(null)}
                      className="w-full rounded-xl border border-white/10 py-3 text-sm text-slate-400 hover:text-white transition">
                      Back to List
                    </button>

                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        <div className="mt-10 text-center border-t border-white/10 pt-6">
          <p className="text-xs text-slate-600">All suppliers are independently verified by KYA Digital Services Ltd · info@kya.com.ng</p>
        </div>

      </div>
    </main>
  );
}