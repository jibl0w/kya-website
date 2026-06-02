import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <Link href="/">
          <h1 className="text-2xl font-black">KY<span className="text-amber-400">A</span></h1>
        </Link>
        <p className="text-xs text-slate-500">Platform Terms of Service</p>
      </header>

      <div className="mx-auto max-w-3xl px-8 py-16">

        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-3">Legal</p>
          <h1 className="text-4xl font-black mb-4">Platform Terms of Service</h1>
          <div className="flex gap-4 text-xs text-slate-500">
            <span>Version 1.0</span>
            <span>•</span>
            <span>Effective: June 2026</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">Subject to legal review before go-live</span>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="mb-10 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <p className="text-sm font-semibold text-amber-400 mb-2">Important Notice</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            KYA Digital Services Ltd is a technology and transaction orchestration platform. We are not a bank, payment service provider, financial institution, or money transfer operator. We do not hold, transfer, convert, or process customer funds in any form. All financial activities conducted through this platform are performed exclusively by licensed banking and settlement institutions.
          </p>
        </div>

        <div className="flex flex-col gap-10 text-slate-300">

          {[
            {
              number: "1",
              title: "About KYA Digital Services",
              content: `KYA Digital Services Ltd ("KYA", "we", "us") is a technology company registered in Nigeria under the Companies and Allied Matters Act (CAMA). KYA operates a digital trade infrastructure and transaction orchestration platform.

KYA is not a bank, financial institution, payment service provider, or money transfer operator. KYA does not hold, transfer, convert, or process customer funds in any form.`
            },
            {
              number: "2",
              title: "Nature of the Platform",
              content: `The KYA platform is a technology and orchestration service that:

• Facilitates customer onboarding and identity verification
• Provides access to a verified supplier network
• Manages trade documentation workflows
• Coordinates transaction steps between licensed banking and settlement institutions
• Provides transaction tracking, monitoring, and audit trail services

All financial activities conducted in connection with transactions facilitated through the KYA platform are performed exclusively by licensed banking and settlement institutions. KYA coordinates these activities but does not participate in them as a financial principal.`
            },
            {
              number: "3",
              title: "Banking and Settlement Partners",
              content: `KYA works with licensed and regulated banking and settlement institutions to facilitate the financial components of trade transactions. These institutions are independently licensed and regulated by their respective regulatory authorities.

KYA is not liable for the actions, decisions, errors, or omissions of any banking or settlement partner. Customers engage with banking partners directly, and KYA's role is limited to coordinating the flow of information and documentation between parties.`
            },
            {
              number: "4",
              title: "Customer Funds",
              content: `KYA does not at any time hold, control, or have access to customer funds. All funds transferred in connection with a trade transaction are held by licensed banking institutions. KYA has no authority to instruct, freeze, or release customer funds.

Balance information displayed within the KYA platform is provided for reference and tracking purposes only. It does not constitute a statement of account and does not imply that KYA holds or controls the referenced funds.`
            },
            {
              number: "5",
              title: "Payment Instructions",
              content: `When a customer submits a payment instruction through the KYA platform, KYA transmits that instruction to the relevant licensed settlement institution on the customer's behalf. KYA does not execute the payment, does not hold the funds being transferred, and is not a party to the payment transaction.

The customer remains the transaction applicant and trade owner at all times. KYA's transmission of a payment instruction does not create any financial obligation on the part of KYA.`
            },
            {
              number: "6",
              title: "Trade Transactions",
              content: `All trade transactions facilitated through the KYA platform are subject to applicable Nigerian law, CBN regulations, and the regulations of any other relevant regulatory authority. Customers are responsible for ensuring that their import activities comply with all applicable laws and regulations.

KYA does not provide legal, financial, tax, or regulatory advice. Customers should seek independent professional advice where required.`
            },
            {
              number: "7",
              title: "Verification and Compliance",
              content: `KYA operates a compliance framework for customer onboarding including identity verification, business verification, and risk assessment. This framework is designed to meet applicable AML and CFT requirements. Customers must provide accurate and complete information during onboarding.

KYA reserves the right to suspend or terminate platform access where a customer fails to meet verification requirements or where KYA has reasonable grounds to suspect misuse of the platform.`
            },
            {
              number: "8",
              title: "Supplier Network",
              content: `Suppliers listed on the KYA platform have been subject to KYA's supplier verification process. However KYA does not guarantee the quality, delivery, or performance of any goods or services provided by suppliers. Customers transact with suppliers at their own risk subject to the protections provided by the trade finance structure.`
            },
            {
              number: "9",
              title: "Platform Fees",
              content: `KYA charges fees for platform services as disclosed to the customer prior to transaction confirmation. Fees may include platform orchestration fees, trade structuring fees, and compliance processing fees. All fees are disclosed before the customer commits to a transaction.`
            },
            {
              number: "10",
              title: "Limitation of Liability",
              content: `To the maximum extent permitted by law, KYA's liability in connection with any transaction or platform service is limited to the platform fees paid by the customer for that specific transaction. KYA is not liable for any loss arising from the actions of banking partners, suppliers, regulatory authorities, or any other third party.`
            },
            {
              number: "11",
              title: "Data Protection",
              content: `KYA collects and processes personal data in accordance with the Nigeria Data Protection Regulation (NDPR) and applicable data protection laws. By using this platform you consent to the collection and processing of your personal data for the purposes of identity verification, compliance, and transaction management.

KYA will not sell or share your personal data with third parties except as required for the operation of the platform, compliance with applicable law, or as required by regulatory authorities.`
            },
            {
              number: "12",
              title: "Governing Law",
              content: `These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from the use of the KYA platform shall be subject to the exclusive jurisdiction of the Nigerian courts.`
            },
            {
              number: "13",
              title: "Amendments",
              content: `KYA reserves the right to amend these terms at any time. Customers will be notified of material changes. Continued use of the platform following notification constitutes acceptance of the amended terms.`
            },
            {
              number: "14",
              title: "Contact",
              content: `KYA Digital Services Ltd\nLagos, Nigeria\ninfo@kya.ng\nkya.ng`
            },
          ].map(section => (
            <div key={section.number} className="flex gap-6">
              <div className="flex-shrink-0 w-8">
                <span className="text-xs font-mono text-amber-400">{section.number}.</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
                <div className="text-sm leading-relaxed text-slate-400 whitespace-pre-line">{section.content}</div>
              </div>
            </div>
          ))}

        </div>

        <div className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-xs text-slate-500 mb-2">
            These terms are subject to legal review and approval by a qualified Nigerian solicitor before this platform is made available to real customers.
          </p>
          <p className="text-xs text-slate-600">
            © 2026 KYA Digital Services Ltd · CAC Registered · Nigeria · Not a PSP · Not a Bank
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-sm text-amber-400 hover:text-amber-300 transition">
            ← Return to Dashboard
          </Link>
        </div>

      </div>
    </main>
  );
}