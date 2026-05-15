import Link from "next/link";

export default function KYAInstitutionalWebsite() {
const sectors = [
{
title: 'Electronics & Consumer Devices',
icon: '📱',
text: 'Verified suppliers for phones, accessories, appliances, and smart devices.'
},
{
title: 'Solar & Energy Infrastructure',
icon: '☀️',
text: 'Solar Panels, batteries, inverters, and industrial energy systems.'
},
{
title: 'Industrial Machinery',
icon: '🏭',
text: 'Factory systems, automation tools, and production equipment.'
},
{
title: 'Construction Materials',
icon: '🏗️',
text: 'Building materials, fittings, hardware, and electrical systems.'
},
{
title: 'Packaging & Manufacturing Inputs',
icon: '📦',
text: 'Raw materials, plastics, textiles, and packaging solutions.'
}
];

const workflow = [
'Digital Onboarding and Verification',
'Supplier Selection and Transaction Setup',
'Form M and Trade Documentation Processing',
'LC issuance and Shipment Coordination',
'FX Processing through Banking Partners',
'Offshore Supplier Settlement and Audit Closure'
];

return (
<div className="min-h-screen bg-slate-950 text-white">

{/* NAVBAR */}  
  <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">  
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">  

      <div>  
        <h1 className="text-3xl font-black tracking-wide">KYA</h1>  
        <p className="text-xs text-slate-400">  
          Cross-Border Trade Infrastructure  
        </p>  
      </div>  

      <nav className="hidden items-center gap-8 text-sm lg:flex">  
        <Link href="/about" className="hover:text-emerald-400">About</Link>  
        <Link href="/how-it-works" className="hover:text-emerald-400">How It Works</Link>  
        <a href="#marketplace" className="hover:text-emerald-400">Suppliers</a>  
        <a href="#banking" className="hover:text-emerald-400">Banking</a>  
        <Link href="/contact" className="hover:text-emerald-400">Contact</Link>  
      </nav>  

      <div className="flex items-center gap-3">  
        <a
  href="/sign-in"
  className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
>
  Login
</a>  

        <button className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-black hover:bg-emerald-400">  
          Request Demo  
        </button>  
      </div>  
    </div>  
  </header>  

  {/* HERO */}  
  <section className="relative overflow-hidden px-6 py-24 lg:py-32">  

    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98133,transparent_35%)]" />  

    <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">  

      <div>  

        <div className="mb-6 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">  
          Institutional Trade Infrastructure Platform  
        </div>  

        <h1 className="text-5xl font-black leading-tight md:text-6xl xl:text-7xl">  
          Secure Cross-Border Trade Between Nigeria & Asia  
        </h1>  

        <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">  
          KYA connects Nigerian businesses, banking institutions,  
          offshore settlement infrastructure, and verified international  
          suppliers through a fully traceable, compliance-aligned digital ecosystem.  
        </p>  

        <div className="mt-10 flex flex-wrap gap-4">  

          <button className="rounded-2xl bg-emerald-500 px-8 py-4 font-bold text-black hover:bg-emerald-400">  
            Start Trading  
          </button>  

          <button className="rounded-2xl border border-white/20 px-8 py-4 hover:bg-white/10">  
            Explore Suppliers  
          </button>  

        </div>  

      </div>  

      {/* WORKFLOW CARD */}  
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">  

        <div className="mb-8 flex items-center justify-between">  

          <div>  
            <h2 className="text-2xl font-bold">Live Workflow</h2>  
            <p className="text-sm text-slate-400">  
              Platform-controlled trade execution  
            </p>  
          </div>  

          <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">  
            Active  
          </div>  

        </div>  

        <div className="space-y-4">  

          {workflow.map((item, index) => (  
            <div  
              key={index}  
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-5"  
            >  

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-lg font-black text-black">  
                {index + 1}  
              </div>  

              <div>  
                <p className="font-medium">{item}</p>  
              </div>  

            </div>  
          ))}  

        </div>  

      </div>  

              import Link from "next/link";  
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
                        <Link href="/about" className="hover:text-emerald-400">About</Link>  
          banking institutions, offshore settlement infrastructure,  
          and verified international suppliers into a single operating environment.  
        </p>  

      </div>  

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">  

        {[  
          {  
            title: 'Compliance-First',  
            text: 'Embedded onboarding, auditability, and transaction controls.'  
          },  
          {  
            title: 'Bank-Aligned',  
            text: 'Structured banking workflows and transaction traceability.'  
          },  
          {  
            title: 'Supplier Infrastructure',  
            text: 'Verified supplier ecosystem with inspection capabilities.'  
          },  
          {  
            title: 'Transaction Visibility',  
            text: 'Real-time transaction lifecycle tracking and monitoring.'  
          }  
        ].map((card, index) => (  
          <div  
            key={index}  
            className="rounded-[28px] border border-white/10 bg-white/5 p-8"  
          >  

            <h3 className="text-xl font-bold text-emerald-400">  
              {card.title}  
            </h3>  

            <p className="mt-4 leading-7 text-slate-300">  
              {card.text}  
            </p>  

          </div>  
        ))}  

      </div>  

    </div>  

  </section>  

  {/* MARKETPLACE */}  
  <section id="marketplace" className="bg-slate-900 px-6 py-24">  

    <div className="mx-auto max-w-7xl">  

      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">  

        <div>  

          <h2 className="text-4xl font-black md:text-5xl">  
            Verified Supplier Marketplace  
          </h2>  

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">  
            Access verified suppliers across strategic sectors critical to Nigerian trade,  
            infrastructure, manufacturing, and industrial growth.  
          </p>  

        </div>  

        <button className="rounded-2xl bg-emerald-500 px-8 py-4 font-bold text-black hover:bg-emerald-400">  
          Browse Suppliers  
        </button>  

      </div>  

      <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-5">  

        {sectors.map((sector, index) => (  
          <div  
            key={index}  
            className="rounded-[28px] border border-white/10 bg-slate-950 p-8"  
          >  

            <div className="mb-6 flex h-20 items-center justify-center rounded-2xl bg-white/5 text-5xl">  
              {sector.icon}  
            </div>  

            <h3 className="text-xl font-bold">  
              {sector.title}  
            </h3>  

            <p className="mt-4 leading-7 text-slate-400">  
              {sector.text}  
            </p>  

          </div>  
        ))}  

      </div>  

    </div>  

  </section>  

  {/* CTA */}  
  <section className="px-6 py-24">  

    <div className="mx-auto max-w-6xl rounded-[40px] border border-white/10 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-12 text-center md:p-20">  

      <h2 className="text-4xl font-black md:text-6xl">  
        Ready to Trade Smarter?  
      </h2>  

      <p className="mx-auto mt-8 max-w-4xl text-xl leading-9 text-slate-300">  
        Access verified suppliers, structured banking workflows,  
        institutional trade infrastructure, and secure cross-border settlement through a single digital platform.  
      </p>  

      <div className="mt-12 flex flex-wrap justify-center gap-5">  

         

        <button className="rounded-2xl border border-white/20 px-10 py-5 text-lg hover:bg-white/10">  
          Speak to Our Team  
        </button>  

      </div>  

    </div>  

  </section>  

  {/* FOOTER */}  
  <footer id="contact" className="border-t border-white/10 bg-slate-950 px-6 py-20">  

    <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-4">  

      <div>  

        <h3 className="text-3xl font-black">  
          KYA  
        </h3>  

        <p className="mt-6 leading-7 text-slate-400">  
          Digital trade infrastructure enabling fully traceable cross-border trade between Nigeria and Asia.  
        </p>  

      </div>  

      <div>  

        <h4 className="mb-6 text-lg font-bold">  
          Platform  
        </h4>  

        <div className="space-y-4 text-slate-400">  
          <p>Customer Portal</p>  
          <p>Supplier Marketplace</p>  
          <p>Trade Workflows</p>  
          <p>Banking Integration</p>  
        </div>  

      </div>  

      <div>  

        <h4 className="mb-6 text-lg font-bold">  
          Institutional  
        </h4>  

        <div className="space-y-4 text-slate-400">  
          <p>Trade Finance</p>  
          <p>Compliance Infrastructure</p>  
          <p>Bank Partnerships</p>  
          <p>Settlement Coordination</p>  
        </div>  

      </div>  

      <div>  

        <h4 className="mb-6 text-lg font-bold">  
          Contact  
        </h4>  

        <div className="space-y-4 text-slate-400">  
          <p>info@kya.com.ng</p>  
          <p>Banking Partnerships</p>  
          <p>Supplier Onboarding</p>  
          <p>Enterprise Support</p>  
        </div>  

      </div>  

    </div>  

    <div className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-8 text-center text-sm text-slate-500">  
      © 2026 KYA. All rights reserved.  
    </div>  

  </footer>  

</div>

);
}
