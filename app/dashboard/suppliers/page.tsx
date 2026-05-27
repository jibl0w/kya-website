"use client";

import { useState } from "react";
import Link from "next/link";

const SUPPLIERS = [
  {
    id: "sup_001",
    name: "Shenzhen TechSource Electronics Co.",
    category: "electronics",
    categoryLabel: "Electronics & Consumer Technology",
    location: "Shenzhen, Guangdong",
    speciality: "Consumer electronics, mobile accessories, smart home devices",
    verified: true,
    audited: true,
    minOrder: "$5,000",
    leadTime: "21-35 days",
    description: "Tier 1 electronics manufacturer with 12 years export experience. Specialises in consumer electronics, mobile phone accessories, LED lighting, and smart home devices. ISO 9001 certified.",
    products: ["Mobile Accessories", "LED Lighting", "Smart Home Devices", "Consumer Electronics"],
    paymentTerms: "30% deposit, 70% against BL",
  },
  {
    id: "sup_002",
    name: "Guangzhou PowerTech Solar Ltd.",
    category: "solar",
    categoryLabel: "Solar & Energy Infrastructure",
    location: "Guangzhou, Guangdong",
    speciality: "Solar panels, inverters, battery storage systems",
    verified: true,
    audited: true,
    minOrder: "$15,000",
    leadTime: "28-45 days",
    description: "Leading solar energy equipment supplier with MCS certification and MNRE approval. Supplies mono and poly crystalline solar panels, hybrid inverters, and lithium battery storage systems.",
    products: ["Solar Panels", "Hybrid Inverters", "Battery Storage", "Mounting Systems"],
    paymentTerms: "40% deposit, 60% against BL",
  },
  {
    id: "sup_003",
    name: "Foshan Industrial Machinery Works",
    category: "industrial",
    categoryLabel: "Industrial Equipment & Machinery",
    location: "Foshan, Guangdong",
    speciality: "CNC machines, packaging equipment, food processing machinery",
    verified: true,
    audited: false,
    minOrder: "$20,000",
    leadTime: "35-60 days",
    description: "Established industrial equipment manufacturer supplying CNC machining centres, hydraulic presses, packaging lines, and food processing equipment. CE certified products available.",
    products: ["CNC Machines", "Hydraulic Presses", "Packaging Lines", "Food Processing Equipment"],
    paymentTerms: "30% deposit, 70% against BL",
  },
  {
    id: "sup_004",
    name: "Yiwu BuildMart International",
    category: "construction",
    categoryLabel: "Construction & Building Materials",
    location: "Yiwu, Zhejiang",
    speciality: "Steel structures, roofing materials, tiles, sanitary ware",
    verified: true,
    audited: true,
    minOrder: "$8,000",
    leadTime: "21-40 days",
    description: "Full-range building materials supplier covering structural steel, colour-coated roofing sheets, ceramic tiles, and sanitary ware. Trusted by Nigerian construction firms for 8 years.",
    products: ["Roofing Sheets", "Ceramic Tiles", "Structural Steel", "Sanitary Ware"],
    paymentTerms: "30% deposit, 70% against BL",
  },
  {
    id: "sup_005",
    name: "Hangzhou TextilePro Manufacturing",
    category: "textiles",
    categoryLabel: "Textiles, Packaging & Manufacturing Inputs",
    location: "Hangzhou, Zhejiang",
    speciality: "Woven fabrics, PP woven bags, BOPP films, packaging materials",
    verified: true,
    audited: false,
    minOrder: "$3,000",
    leadTime: "14-28 days",
    description: "Specialist in industrial textiles and packaging materials. Products include PP woven bags, BOPP laminated sacks, stretch wrap films, and woven polypropylene fabrics for agricultural and industrial use.",
    products: ["PP Woven Bags", "BOPP Films", "Stretch Wrap", "Woven Fabrics"],
    paymentTerms: "30% deposit, 70% against BL",
  },
  {
    id: "sup_006",
    name: "Ningbo AutoParts & Components Co.",
    category: "industrial",
    categoryLabel: "Industrial Equipment & Machinery",
    location: "Ningbo, Zhejiang",
    speciality: "Auto spare parts, engine components, electrical parts",
    verified: true,
    audited: true,
    minOrder: "$5,000",
    leadTime: "21-35 days",
    description: "OEM and aftermarket automotive parts supplier covering engine components, brake systems, suspension parts, and electrical components. Supplies parts for Toyota, Honda, Hyundai, and Chinese vehicle brands.",
    products: ["Engine Parts", "Brake Systems", "Suspension Parts", "Electrical Components"],
    paymentTerms: "30% deposit, 70% against BL",
  },
  {
    id: "sup_007",
    name: "Dongguan SolarMax Energy Systems",
    category: "solar",
    categoryLabel: "Solar & Energy Infrastructure",
    location: "Dongguan, Guangdong",
    speciality: "Off-grid solar systems, solar street lights, solar water pumps",
    verified: true,
    audited: false,
    minOrder: "$10,000",
    leadTime: "21-35 days",
    description: "Specialist in off-grid solar solutions for African markets. Products include complete solar home systems, solar street lighting, solar water pumping systems, and solar-powered refrigeration units.",
    products: ["Solar Home Systems", "Solar Street Lights", "Solar Water Pumps", "Solar Refrigeration"],
    paymentTerms: "40% deposit, 60% against BL",
  },
  {
    id: "sup_008",
    name: "Shanghai ConsumerGoods Direct Ltd.",
    category: "electronics",
    categoryLabel: "Electronics & Consumer Technology",
    location: "Shanghai",
    speciality: "Home appliances, kitchen electronics, personal care devices",
    verified: true,
    audited: true,
    minOrder: "$8,000",
    leadTime: "18-30 days",
    description: "Premium home appliance and consumer electronics exporter. Products include blenders, fans, air conditioners, water dispensers, refrigerators, and personal care electronics. Brands available on request.",
    products: ["Home Appliances", "Air Conditioners", "Kitchen Electronics", "Personal Care Devices"],
    paymentTerms: "30% deposit, 70% against BL",
  },
];

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics & Consumer Technology" },
  { value: "solar", label: "Solar & Energy Infrastructure" },
  { value: "industrial", label: "Industrial Equipment & Machinery" },
  { value: "construction", label: "Construction & Building Materials" },
  { value: "textiles", label: "Textiles, Packaging & Manufacturing Inputs" },
];

export default function SuppliersPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<typeof SUPPLIERS[0] | null>(null);

  const filtered = SUPPLIERS.filter(s => {
    const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
    const matchesSearch = search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.speciality.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">Supplier Marketplace</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-6xl px-8 py-10">

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-1">
            Verified Suppliers
          </p>
          <h1 className="text-4xl font-black">Supplier Marketplace</h1>
          <p className="mt-2 text-slate-400">
            All suppliers are KYA-verified, factory-audited where indicated, and pre-approved for LC-backed transactions.
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Verified Suppliers", value: SUPPLIERS.length },
            { label: "Factory Audited", value: SUPPLIERS.filter(s => s.audited).length },
            { label: "Categories", value: CATEGORIES.length - 1 },
            { label: "Avg Lead Time", value: "28 days" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-2xl font-black text-amber-400">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search and filter */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search suppliers by name, product, or location..."
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50"
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50 md:w-72"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setSelectedCategory(c.value)}
              className={"rounded-full px-4 py-1.5 text-xs font-medium transition " +
                (selectedCategory === c.value
                  ? "bg-amber-400 text-slate-950"
                  : "border border-white/10 text-slate-400 hover:text-white hover:border-white/20")}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-6">
          Showing {filtered.length} supplier{filtered.length !== 1 ? "s" : ""}
          {selectedCategory !== "all" ? " in " + CATEGORIES.find(c => c.value === selectedCategory)?.label : ""}
        </p>

        {/* Supplier grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(supplier => (
            <div
              key={supplier.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-amber-400/30 transition cursor-pointer"
              onClick={() => setSelectedSupplier(supplier)}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{supplier.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500">{supplier.location}</p>
                </div>
                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  {supplier.verified && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      ✓ Verified
                    </span>
                  )}
                  {supplier.audited && (
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                      Audited
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-amber-400 mb-2">{supplier.categoryLabel}</p>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{supplier.description}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {supplier.products.slice(0, 3).map(p => (
                  <span key={p} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                    {p}
                  </span>
                ))}
                {supplier.products.length > 3 && (
                  <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-500">
                    +{supplier.products.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Min Order</p>
                    <p className="text-xs font-medium text-white">{supplier.minOrder}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Lead Time</p>
                    <p className="text-xs font-medium text-white">{supplier.leadTime}</p>
                  </div>
                </div>
                <button className="text-xs text-amber-400 hover:text-amber-300 transition font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-slate-400">No suppliers found matching your search.</p>
            <button onClick={() => { setSearch(""); setSelectedCategory("all"); }}
              className="mt-4 text-sm text-amber-400 hover:text-amber-300 transition">
              Clear filters
            </button>
          </div>
        )}

      </div>

      {/* Supplier detail modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 overflow-hidden max-h-screen overflow-y-auto">

            <div className="border-b border-white/10 px-6 py-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {selectedSupplier.verified && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      ✓ KYA Verified
                    </span>
                  )}
                  {selectedSupplier.audited && (
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                      Factory Audited
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedSupplier.name}</h2>
                <p className="text-sm text-slate-400 mt-0.5">{selectedSupplier.location}</p>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-slate-500 hover:text-white transition text-xl flex-shrink-0 ml-4"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5">

              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-2">Category</p>
                <p className="text-sm text-white">{selectedSupplier.categoryLabel}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-2">About</p>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedSupplier.description}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-2">Products</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSupplier.products.map(p => (
                    <span key={p} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-500 mb-1">Min Order Value</p>
                  <p className="font-semibold text-white">{selectedSupplier.minOrder}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-500 mb-1">Lead Time</p>
                  <p className="font-semibold text-white">{selectedSupplier.leadTime}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-500 mb-1">Payment Terms</p>
                  <p className="font-semibold text-white text-xs">{selectedSupplier.paymentTerms}</p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-xs font-medium text-amber-400 mb-1">KYA Platform Note</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All transactions with this supplier are processed through the KYA platform under a Letter of Credit structure. Payment is only released to the supplier after pre-shipment inspection is completed and shipping documents are verified.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href={"/transactions/new?supplier=" + selectedSupplier.id + "&supplierName=" + encodeURIComponent(selectedSupplier.name) + "&category=" + selectedSupplier.category}
                  className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition text-center"
                >
                  Start Transaction with this Supplier
                </Link>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 hover:text-white hover:border-white/20 transition"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}