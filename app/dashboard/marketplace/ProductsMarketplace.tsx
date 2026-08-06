"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Supplier {
  id: string;
  supplier_name: string;
  country: string;
  verification_status: string;
}

interface Product {
  id: string;
  product_name: string;
  category: string;
  keywords: string | null;
  model_number: string | null;
  description: string | null;
  specifications: string | null;
  assembly_options: string | null;
  pricing: string | null;
  moq: string | null;
  lead_time: string | null;
  certifications: string | null;
  country_of_origin: string | null;
  warranty: string | null;
  media_link: string | null;
  status: string;
  supplier_id: string;
  suppliers: Supplier;
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
  "Electronics & Consumer Technology": "\uD83D\uDCBB",
  "Solar & Energy Infrastructure": "\u2600\uFE0F",
  "Industrial Equipment & Machinery": "\u2699\uFE0F",
  "Construction & Building Materials": "\uD83C\uDFD7\uFE0F",
  "Textiles, Packaging & Manufacturing Inputs": "\uD83E\uDDF5",
  "Electric Vehicles & Accessories": "\uD83D\uDD0B",
  "Agriculture & Farming Equipment": "\uD83C\uDF3E",
};

export default function ProductsMarketplace({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter();

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = search === "" ||
      p.product_name.toLowerCase().includes(q) ||
      (p.keywords || "").toLowerCase().includes(q) ||
      (p.model_number || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.suppliers?.supplier_name || "").toLowerCase().includes(q);
    const matchCategory = categoryFilter === "All Categories" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categoryCounts = CATEGORIES.slice(1).reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  function handleStartTransaction(product: Product) {
    const params = new URLSearchParams({
      supplierId: product.supplier_id,
      supplierName: product.suppliers?.supplier_name || "",
      category: product.category,
      product: product.product_name,
    });
    router.push("/transactions/new?" + params.toString());
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between sticky top-0 bg-slate-950/95 backdrop-blur z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">&larr; Dashboard</Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">Product Marketplace</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-1">Verified Product Catalogue</p>
          <h1 className="text-3xl font-black mb-2">Product Marketplace</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Browse products from KYA-verified suppliers. Search by product, model, or supplier, review the details, and start a trade transaction directly.
          </p>
        </div>

        {/* Category tiles */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          {CATEGORIES.slice(1).map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === categoryFilter ? "All Categories" : cat)}
              className={"rounded-2xl border p-4 text-left transition " + (categoryFilter === cat ? "border-amber-400/40 bg-amber-400/5" : "border-white/10 bg-white/5 hover:border-white/20")}>
              <span className="text-2xl block mb-2">{categoryIcons[cat]}</span>
              <p className="text-xs font-medium text-white leading-tight">{cat.split(" ")[0]}</p>
              <p className="text-xs text-slate-500 mt-1">{categoryCounts[cat] || 0} product{categoryCounts[cat] !== 1 ? "s" : ""}</p>
            </button>
          ))}
        </div>

        {/* Search and filter */}
        <div className="flex gap-3 mb-6 flex-wrap items-center">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by product, model, supplier, or keyword..."
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-slate-900 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {categoryFilter !== "All Categories" && (
            <button onClick={() => setCategoryFilter("All Categories")}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 hover:text-white transition">Clear</button>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-4">{filtered.length} product{filtered.length !== 1 ? "s" : ""}{categoryFilter !== "All Categories" ? " in " + categoryFilter : ""}</p>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-16 text-center">
            <p className="text-4xl mb-4">{"\uD83D\uDCE6"}</p>
            <p className="font-semibold text-white mb-2">Product catalogue coming soon</p>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">Our team is currently onboarding verified suppliers and their products. Check back soon or contact us at info@kya.com.ng.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-slate-400 mb-2">No products found matching your search.</p>
            <button onClick={() => { setSearch(""); setCategoryFilter("All Categories"); }}
              className="text-sm text-amber-400 hover:text-amber-300">Clear filters</button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Product list */}
            <div className="flex flex-col gap-3">
              {filtered.map(p => (
                <div key={p.id}
                  onClick={() => setSelectedProduct(selectedProduct?.id === p.id ? null : p)}
                  className={"rounded-2xl border p-5 cursor-pointer transition " + (selectedProduct?.id === p.id ? "border-amber-400/40 bg-amber-400/5" : "border-white/10 bg-white/5 hover:border-white/20")}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{categoryIcons[p.category] || "\uD83D\uDCE6"}</span>
                      <div>
                        <p className="font-bold text-white">{p.product_name}</p>
                        {p.model_number && <p className="text-xs text-slate-500">Model: {p.model_number}</p>}
                        <p className="text-xs text-slate-500 mt-0.5">{p.suppliers?.supplier_name}{p.suppliers?.country ? " \u00B7 " + p.suppliers.country : ""}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className={"text-xs font-medium border rounded-full px-2 py-0.5 " + (categoryColors[p.category] || "text-slate-400 bg-slate-500/10 border-slate-500/20")}>
                      {p.category}
                    </span>
                  </div>
                  {p.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{p.description}</p>}
                  <div className="flex gap-4 text-xs text-slate-500">
                    {p.pricing && <span className="text-amber-400 font-medium">{p.pricing.split("/")[0].trim()}</span>}
                    {p.moq && <span>MOQ: {p.moq}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div>
              {!selectedProduct ? (
                <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                  <p className="text-4xl mb-4">{"\uD83D\uDC46"}</p>
                  <p className="text-slate-400">Select a product to view full details and start a transaction.</p>
                </div>
              ) : (
                <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 overflow-hidden max-h-[80vh] overflow-y-auto">
                  <div className="border-b border-white/10 bg-white/5 px-6 py-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{categoryIcons[selectedProduct.category] || "\uD83D\uDCE6"}</span>
                      <div>
                        <p className="text-xl font-black text-white">{selectedProduct.product_name}</p>
                        {selectedProduct.model_number && <p className="text-sm text-slate-400">Model: {selectedProduct.model_number}</p>}
                        <p className="text-xs text-slate-500 mt-0.5">{selectedProduct.suppliers?.supplier_name}{selectedProduct.suppliers?.country ? " \u00B7 " + selectedProduct.suppliers.country : ""}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs font-medium border rounded-full px-2 py-0.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10">{"\u2713"} Verified Supplier</span>
                      <span className={"text-xs font-medium border rounded-full px-2 py-0.5 " + (categoryColors[selectedProduct.category] || "text-slate-400 border-slate-500/20 bg-slate-500/10")}>
                        {selectedProduct.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-5">
                    {selectedProduct.description && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Description</p>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-slate-300 leading-relaxed">{selectedProduct.description}</p>
                        </div>
                      </div>
                    )}

                    {selectedProduct.specifications && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Specifications</p>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-slate-300 leading-relaxed">{selectedProduct.specifications}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Commercial Terms</p>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
                        {selectedProduct.pricing && (
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-xs text-slate-500 flex-shrink-0">Pricing</p>
                            <p className="text-sm text-amber-400 font-semibold text-right">{selectedProduct.pricing}</p>
                          </div>
                        )}
                        {selectedProduct.moq && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">Min Order</p>
                            <p className="text-sm text-white">{selectedProduct.moq}</p>
                          </div>
                        )}
                        {selectedProduct.lead_time && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">Lead Time</p>
                            <p className="text-sm text-white">{selectedProduct.lead_time}</p>
                          </div>
                        )}
                        {selectedProduct.assembly_options && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">Assembly</p>
                            <p className="text-sm text-white text-right">{selectedProduct.assembly_options}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Product Details</p>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
                        {selectedProduct.certifications && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">Certifications</p>
                            <p className="text-sm text-white text-right">{selectedProduct.certifications}</p>
                          </div>
                        )}
                        {selectedProduct.country_of_origin && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">Origin</p>
                            <p className="text-sm text-white">{selectedProduct.country_of_origin}</p>
                          </div>
                        )}
                        {selectedProduct.warranty && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">Warranty</p>
                            <p className="text-sm text-white text-right">{selectedProduct.warranty}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedProduct.media_link && (
                      <a href={selectedProduct.media_link} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-amber-400 hover:text-amber-300 underline text-center">View product photos &amp; videos &rarr;</a>
                    )}

                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="text-amber-400 font-semibold">KYA Verified Supplier.</span> This product is offered by a supplier vetted by the KYA compliance team. All transactions are processed through KYA&apos;s trade infrastructure with full LC and FX support.
                      </p>
                    </div>

                    <button onClick={() => handleStartTransaction(selectedProduct)}
                      className="w-full rounded-xl bg-amber-400 py-4 font-bold text-slate-950 hover:bg-amber-300 transition">
                      Start Transaction &rarr;
                    </button>
                    <button onClick={() => setSelectedProduct(null)}
                      className="w-full rounded-xl border border-white/10 py-3 text-sm text-slate-400 hover:text-white transition">
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 text-center border-t border-white/10 pt-6">
          <p className="text-xs text-slate-600">All products are from suppliers independently verified by KYA Digital Services Ltd &middot; info@kya.com.ng</p>
        </div>
      </div>
    </main>
  );
}