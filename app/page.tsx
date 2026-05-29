import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

const sectors = [
  { title: "Electronics & Consumer Devices", icon: "📱", text: "Verified suppliers for phones, accessories, appliances, and smart devices." },
  { title: "Solar & Energy Infrastructure", icon: "☀️", text: "Solar panels, batteries, inverters, and industrial energy systems." },
  { title: "Industrial Machinery", icon: "🏭", text: "Factory systems, automation tools, and production equipment." },
  { title: "Construction Materials", icon: "🏗️", text: "Building materials, fittings, hardware, and electrical systems." },
  { title: "Packaging & Manufacturing Inputs", icon: "📦", text: "Raw materials, plastics, textiles, and packaging solutions." },
];

const workflow = [
  "Digital Onboarding and Verification",
  "Supplier Selection and Transaction Setup",
  "Form M and Trade Documentation Processing",
  "LC Issuance and Shipment Coordination",
  "FX Processing through Banking Partners",
  "Offshore Supplier Settlement and Audit Closure",
];

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-3xl font-black tracking-wide">
              KY<span className="text-amber-400">A</span>
            </h1>
            <p className="text-xs text-slate-400">Cross-Border Trade Infrastructure</p>
          </div>

          <nav className="hidden items-center gap-8 text-sm lg:flex">
            <a href="#about" className="hover:text-amber-400 transition">About</a>
            <a href="#how-it-works" className="hover:text-amber-400 transition">How It Works</a>
            <a href="#marketplace" className="hover:text-amber-400 transition">Suppliers</a>
            <a href="#banking" className="hover:text-amber-400 transition">Banking</a>
            <a href="#contact" className="hover:text-amber-400 transition">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            {userId ? (
              <Link href="/dashboard"
                className="rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-in"
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition">
                  Login
                </Link>
                <Link href="/sign-up"
                  className="rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f59e0b22,transparent_35%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">

          <div>
            <div className="mb-6 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
              Institutional Trade Infrastructure Platform
            </div>
            <h1 className="text-5xl font-black leading-tight md:text-6xl xl:text-7xl">
              Secure Cross-Border Trade Between Nigeria &amp; Asia
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
              KYA connects Nigerian businesses, banking institutions, offshore settlement infrastructure, and verified international suppliers through a fully traceable, compliance-aligned digital ecosystem.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {userId ? (
                <Link href="/dashboard"
                  className="rounded-2xl bg-amber-400 px-8 py-4 font-bold text-slate-950 hover:bg-amber-300 transition">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link href="/sign-up"
                    className="rounded-2xl bg-amber-400 px-8 py-4 font-bold text-slate-950 hover:bg-amber-300 transition">
                    Start Trading →
                  </Link>
                  <Link href="/sign-in"
                    className="rounded-2xl border border-white/20 px-8 py-4 hover:bg-white/10 transition">
                    Explore Suppliers
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* WORKFLOW CARD */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Live Workflow</h2>
                <p className="text-sm text-slate-400">Platform-controlled trade execution</p>
              </div>
              <div className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300">
                Active
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {workflow.map((item, index) => (
                <div key={index}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-slate-950">
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-black md:text-5xl">
              Building the Infrastructure Layer for Cross-Border Trade
            </h2>
            <p className="mt-8 text-lg leading-8 text-slate-300">
              KYA integrates Nigerian banking institutions, offshore settlement infrastructure, and verified international suppliers into a single operating environment. Every transaction is structured, traceable, and compliant from initiation to settlement.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Compliance-First", text: "Embedded onboarding, auditability, and transaction controls." },
              { title: "Bank-Aligned", text: "Structured banking workflows and transaction traceability." },
              { title: "Supplier Infrastructure", text: "Verified supplier ecosystem with inspection capabilities." },
              { title: "Transaction Visibility", text: "Real-time transaction lifecycle tracking and monitoring." },
            ].map((card, index) => (
              <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <h3 className="text-xl font-bold text-amber-400">{card.title}</h3>
                <p className="mt-4 leading-7 text-slate-300">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-white/10 bg-slate-900 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-black md:text-5xl mb-4">How KYA Works</h2>
          <p className="text-lg text-slate-400 mb-16 max-w-3xl">
            A 13-step platform-controlled process from customer verification to supplier settlement.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { step: "01", title: "KYC / KYB Verification", text: "Customers complete identity or business verification through our compliance-first onboarding." },
              { step: "02", title: "Supplier Selection", text: "Browse and select from KYA-verified suppliers across 5 key trade categories." },
              { step: "03", title: "Form M Submission", text: "CBN Form M submitted through our appointed Authorised Dealer bank." },
              { step: "04", title: "Naira Funding", text: "Customer funds the transaction in naira through our Nigerian Banking Partner." },
              { step: "05", title: "LC Issuance", text: "Letter of Credit issued through Unity Bank to secure the trade." },
              { step: "06", title: "Pre-Shipment Inspection", text: "KYA-appointed inspectors verify goods before shipment from China." },
              { step: "07", title: "Shipment & Documents", text: "Shipping documents verified — Bill of Lading, Commercial Invoice, Packing List." },
              { step: "08", title: "FX Processing", text: "CBN releases FX through the Authorised Dealer after document verification." },
              { step: "09", title: "USD Settlement", text: "USD credited to customer ROECNY account held in Singapore." },
              { step: "10", title: "Payment Instruction", text: "Customer authorises payment to supplier from the ROECNY platform." },
              { step: "11", title: "RMB Conversion", text: "USD converted to RMB via CIPS and settled to the Chinese supplier." },
              { step: "12", title: "LC Liquidation", text: "Letter of Credit discharged and trade documents archived." },
              { step: "13", title: "Transaction Complete", text: "Full audit trail generated. Transaction closed and archived." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/10 bg-slate-950 p-6">
                <p className="font-mono text-xs text-amber-400 mb-2">{s.step}</p>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section id="marketplace" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-4xl font-black md:text-5xl">Verified Supplier Marketplace</h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
                Access verified suppliers across strategic sectors critical to Nigerian trade, infrastructure, manufacturing, and industrial growth.
              </p>
            </div>
            <Link
              href={userId ? "/dashboard/suppliers" : "/sign-up"}
              className="rounded-2xl bg-amber-400 px-8 py-4 font-bold text-slate-950 hover:bg-amber-300 transition whitespace-nowrap">
              Browse Suppliers
            </Link>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {sectors.map((sector, index) => (
              <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <div className="mb-6 flex h-16 items-center justify-center rounded-2xl bg-white/5 text-4xl">
                  {sector.icon}
                </div>
                <h3 className="text-lg font-bold">{sector.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{sector.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANKING */}
      <section id="banking" className="border-t border-white/10 bg-slate-900 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-black md:text-5xl mb-4">Banking & Settlement Partners</h2>
          <p className="text-lg text-slate-400 mb-16 max-w-3xl">
            KYA operates through a multi-bank structure designed to satisfy CBN requirements and international settlement standards.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "CBN-Licensed Collection Bank", role: "Naira Collection", detail: "A CBN-licensed Nigerian bank receives and holds naira funding from customers before FX processing." },
              { name: "CBN-Licensed Issuing Bank", role: "LC Issuance", detail: "A CBN-licensed Nigerian bank issues Letters of Credit for all KYA trade transactions." },
              { name: "MAS-Regulated Digital Bank", role: "Offshore Settlement", detail: "A MAS-regulated Singapore digital bank holds USD and executes RMB settlement via CIPS to Chinese suppliers." },
            ].map((partner) => (
              <div key={partner.name} className="rounded-3xl border border-white/10 bg-slate-950 p-8">
                <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-3">{partner.role}</p>
                <h3 className="text-xl font-bold mb-3">{partner.name}</h3>
                <p className="text-sm text-slate-400 leading-7">{partner.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-6xl rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-12 text-center md:p-20">
          <h2 className="text-4xl font-black md:text-6xl">Ready to Trade Smarter?</h2>
          <p className="mx-auto mt-8 max-w-4xl text-xl leading-9 text-slate-300">
            Access verified suppliers, structured banking workflows, institutional trade infrastructure, and secure cross-border settlement through a single digital platform.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-5">
            {userId ? (
              <Link href="/dashboard"
                className="rounded-2xl bg-amber-400 px-10 py-5 text-lg font-bold text-slate-950 hover:bg-amber-300 transition">
                Go to Dashboard →
              </Link>
            ) : (
              <Link href="/sign-up"
                className="rounded-2xl bg-amber-400 px-10 py-5 text-lg font-bold text-slate-950 hover:bg-amber-300 transition">
                Start Onboarding →
              </Link>
            )}
            <a href="#contact"
              className="rounded-2xl border border-white/20 px-10 py-5 text-lg hover:bg-white/10 transition">
              Speak to Our Team
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-white/10 bg-slate-950 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-4">
          <div>
            <h3 className="text-3xl font-black">KY<span className="text-amber-400">A</span></h3>
            <p className="mt-6 leading-7 text-slate-400">
              Digital trade infrastructure enabling fully traceable cross-border trade between Nigeria and Asia.
            </p>
          </div>
          <div>
            <h4 className="mb-6 text-lg font-bold">Platform</h4>
            <div className="flex flex-col gap-3 text-sm text-slate-400">
              <Link href={userId ? "/dashboard" : "/sign-up"} className="hover:text-white transition">Customer Portal</Link>
              <Link href={userId ? "/dashboard/suppliers" : "/sign-up"} className="hover:text-white transition">Supplier Marketplace</Link>
              <Link href={userId ? "/transactions/new" : "/sign-up"} className="hover:text-white transition">Trade Workflows</Link>
              <Link href={userId ? "/dashboard/documents" : "/sign-up"} className="hover:text-white transition">Document Management</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-lg font-bold">Institutional</h4>
            <div className="flex flex-col gap-3 text-sm text-slate-400">
              <p>Trade Finance</p>
              <p>Compliance Infrastructure</p>
              <p>Bank Partnerships</p>
              <p>Settlement Coordination</p>
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-lg font-bold">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-slate-400">
              <p>info@kya.ng</p>
              <p>Banking Partnerships</p>
              <p>Supplier Onboarding</p>
              <p>Enterprise Support</p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-8 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-slate-500">© 2026 KYA Digital Services Ltd. CAC Registered. Nigeria.</p>
          <p className="text-xs text-slate-700">Not a PSP · Not a Bank · Trade Infrastructure Platform</p>
        </div>
      </footer>

    </div>
  );
}