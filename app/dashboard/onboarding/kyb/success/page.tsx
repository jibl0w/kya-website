import Link from "next/link";

export default function KybSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">

        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✓</span>
        </div>

        <h1 className="text-3xl font-black mb-3">Verification Submitted</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Your KYB business verification form has been received successfully. A confirmation email has been sent to your registered email address.
        </p>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 mb-8 text-left">
          <p className="text-sm font-semibold text-amber-400 mb-3">Next Step — Upload Your Business Documents</p>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            To complete your business verification you need to upload the following documents:
          </p>
          <ul className="flex flex-col gap-2">
            {[
              "CAC Certificate of Incorporation",
              "Memorandum & Articles of Association (MEMART)",
              "CAC Form 1.1 — Directors & Shareholders",
              "Director Government-Issued ID",
              "Financial Statements or Bank Statements",
            ].map(doc => (
              <li key={doc} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="text-amber-400 text-xs flex-shrink-0">◆</span>
                {doc}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard/documents"
            className="rounded-xl bg-amber-400 py-4 font-bold text-slate-950 hover:bg-amber-300 transition text-center block">
            Upload Documents Now →
          </Link>
          <Link href="/dashboard"
            className="rounded-xl border border-white/10 py-4 text-sm text-slate-400 hover:text-white transition text-center block">
            Return to Dashboard
          </Link>
        </div>

      </div>
    </main>
  );
}