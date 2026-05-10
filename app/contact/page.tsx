"use client";
export default function ContactPage() {
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

      {/* HERO */}
      <section className="px-10 py-24 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">

          <p className="uppercase tracking-[0.3em] text-green-400 mb-4 text-sm">
            Contact KYA
          </p>

          <h1 className="text-6xl font-bold leading-tight max-w-5xl mb-8">
            Let’s Build Structured Cross-Border Trade Together
          </h1>

          <p className="text-xl text-gray-300 leading-9 max-w-4xl">
            KYA works with customers, suppliers, financial institutions,
            trade partners, and strategic stakeholders across the
            cross-border commerce ecosystem.
          </p>

        </div>
      </section>

      {/* CONTACT GRID */}
      <section className="px-10 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">

          {/* LEFT */}
          <div>

            <h2 className="text-4xl font-bold mb-10">
              Get In Touch
            </h2>

            <div className="space-y-10">

              <div>
                <p className="text-green-400 uppercase text-sm tracking-[0.2em] mb-3">
                  General Enquiries
                </p>

                <p className="text-2xl font-semibold">
                  info@kya.com.ng
                </p>
              </div>

              <div>
                <p className="text-green-400 uppercase text-sm tracking-[0.2em] mb-3">
                  Institutional & Banking Engagements
                </p>

                <p className="text-2xl font-semibold">
                  banking@kya.com.ng
                </p>
              </div>

              <div>
                <p className="text-green-400 uppercase text-sm tracking-[0.2em] mb-3">
                  Supplier & Trade Partnerships
                </p>

                <p className="text-2xl font-semibold">
                  suppliers@kya.com.ng
                </p>
              </div>

              <div>
                <p className="text-green-400 uppercase text-sm tracking-[0.2em] mb-3">
                  Operating Region
                </p>

                <p className="text-2xl font-semibold">
                  Lagos, Nigeria
                </p>
              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">

            <h3 className="text-3xl font-bold mb-8">
              Send Us A Message
            </h3>

            <form className="space-y-6">

              <div>
                <label className="block mb-3 text-gray-300">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-5 py-4 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-3 text-gray-300">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-5 py-4 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-3 text-gray-300">
                  Organisation
                </label>

                <input
                  type="text"
                  placeholder="Company / Institution"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-5 py-4 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-3 text-gray-300">
                  Message
                </label>

                <textarea
                  rows={6}
                  placeholder="How can we help?"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-5 py-4 text-white focus:outline-none"
                ></textarea>
              </div>

              <button
                type="button"
                onClick={() => alert("Message functionality coming soon")}
                className="bg-green-500 hover:bg-green-400 text-black font-semibold px-8 py-4 rounded-xl transition"
              >
                Submit Enquiry
              </button>

            </form>

          </div>

        </div>
      </section>

      {/* INSTITUTIONAL FOOTNOTE */}
      <section className="px-10 py-20 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto text-center">

          <p className="text-gray-400 text-lg leading-8">
            KYA operates as a digital trade infrastructure and
            transaction orchestration platform supporting structured
            cross-border trade coordination between participating
            stakeholders across Africa and Asia.
          </p>

        </div>
      </section>

    </main>
  );
}