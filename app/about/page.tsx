export default function AboutPage() {
  return (
    
<main className="min-h-screen bg-black text-white">

  {/* TOP NAVIGATION */}
  <div className="px-10 py-6 border-b border-zinc-800">
    <a
      href="/"
      className="text-green-400 font-semibold hover:text-green-300"
    >
      ← Back to Home
    </a>
  </div>
      {/* HERO SECTION */}
      <section className="px-10 py-24 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">

          <p className="text-green-400 uppercase tracking-[0.3em] mb-4 text-sm">
            About KYA
          </p>

          <h1 className="text-6xl font-bold leading-tight max-w-5xl mb-8">
            Building Institutional Trade Infrastructure Between
            Nigeria and Asia
          </h1>

          <p className="text-xl text-gray-300 leading-9 max-w-4xl">
            KYA is a digital trade infrastructure and transaction
            orchestration platform enabling structured, compliant,
            and fully traceable cross-border trade between Nigerian
            businesses, banking institutions, offshore settlement
            infrastructure, and verified Asian suppliers.
          </p>

        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="px-10 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20">

          <div>
            <h2 className="text-4xl font-bold mb-8">
              Who We Are
            </h2>

            <p className="text-gray-300 leading-8 mb-6">
              KYA was established to solve one of the most critical
              challenges facing African cross-border trade:
              fragmented transaction coordination across suppliers,
              financial institutions, logistics providers, compliance
              workflows, and settlement infrastructure.
            </p>

            <p className="text-gray-300 leading-8 mb-6">
              Traditional import and trade processes remain highly
              manual, operationally opaque, fragmented across multiple
              parties, and difficult to monitor institutionally.
              This creates inefficiencies, delays, fraud exposure,
              documentation inconsistencies, and significant banking
              and compliance risks.
            </p>

            <p className="text-gray-300 leading-8">
              KYA addresses this problem by embedding transaction
              visibility, workflow coordination, supplier verification,
              onboarding infrastructure, and compliance orchestration
              into a single digital operating environment.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800">
            <h3 className="text-3xl font-bold mb-8">
              Core Institutional Focus
            </h3>

            <div className="space-y-6">

              <div>
                <h4 className="text-green-400 font-semibold mb-2">
                  Structured Trade Workflows
                </h4>
                <p className="text-gray-400 leading-7">
                  End-to-end orchestration of onboarding,
                  documentation, transaction coordination,
                  and settlement visibility.
                </p>
              </div>

              <div>
                <h4 className="text-green-400 font-semibold mb-2">
                  Banking Coordination
                </h4>
                <p className="text-gray-400 leading-7">
                  Integration of regulated banking institutions,
                  authorised dealer workflows, and compliant
                  transaction processing structures.
                </p>
              </div>

              <div>
                <h4 className="text-green-400 font-semibold mb-2">
                  Supplier Infrastructure
                </h4>
                <p className="text-gray-400 leading-7">
                  Access to verified supplier ecosystems
                  across strategic manufacturing sectors in Asia.
                </p>
              </div>

              <div>
                <h4 className="text-green-400 font-semibold mb-2">
                  Compliance & Visibility
                </h4>
                <p className="text-gray-400 leading-7">
                  Audit trails, transaction monitoring,
                  workflow controls, and digital traceability
                  across the full trade lifecycle.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* WHAT MAKES KYA DIFFERENT */}
      <section className="px-10 py-24 bg-zinc-950 border-y border-zinc-800">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-5xl font-bold mb-16">
            What Makes KYA Different
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="bg-black border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6">
                Technology-Led Transaction Visibility
              </h3>

              <p className="text-gray-400 leading-8">
                Every onboarding process, supplier interaction,
                document submission, compliance workflow,
                and transaction instruction is executed through
                the KYA platform, creating a structured digital
                audit trail across the transaction lifecycle.
              </p>
            </div>

            <div className="bg-black border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6">
                Verified Supplier Ecosystem
              </h3>

              <p className="text-gray-400 leading-8">
                KYA maintains relationships with suppliers across
                multiple manufacturing sectors, enabling customers
                to transact through a controlled and institutionally
                visible supplier environment.
              </p>
            </div>

            <div className="bg-black border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6">
                Institutional Compliance Structure
              </h3>

              <p className="text-gray-400 leading-8">
                KYA operates within a structured banking and trade
                ecosystem involving regulated banking institutions,
                authorised dealer workflows, offshore settlement
                infrastructure, and institutionally controlled
                transaction coordination.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* REGULATORY POSITIONING */}
      <section className="px-10 py-24">
        <div className="max-w-5xl mx-auto">

          <h2 className="text-5xl font-bold mb-10">
            Regulatory & Institutional Positioning
          </h2>

          <div className="space-y-8 text-gray-300 text-lg leading-9">

            <p>
              KYA is not a bank, payment service provider,
              remittance company, or foreign exchange dealer.
            </p>

            <p>
              The platform operates as a digital trade
              infrastructure and transaction orchestration
              environment supporting compliant cross-border
              trade coordination between participating parties.
            </p>

            <p>
              Banking activities, foreign exchange processing,
              settlement functions, and trade finance issuance
              remain the responsibility of regulated financial
              institutions operating within their respective
              regulatory frameworks.
            </p>

            <p>
              KYA’s role is to embed structure, visibility,
              workflow management, supplier coordination,
              onboarding infrastructure, and transaction
              traceability into the broader trade ecosystem.
            </p>

          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="px-10 py-24 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-5xl font-bold mb-10">
            Our Vision
          </h2>

          <p className="text-2xl text-gray-300 leading-10">
            To build the leading institutional trade infrastructure
            platform enabling transparent, compliant, and scalable
            cross-border commerce between Africa and Asia.
          </p>

        </div>
      </section>

    </main>
  );
}