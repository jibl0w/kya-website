import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-amber-400 hover:text-amber-300">
          ← Back to Dashboard
        </Link>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Customer Onboarding
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Choose Verification Type
          </h1>

          <p className="mt-3 text-slate-400">
            Select the correct onboarding route. Personal customers complete KYC.
            Business customers complete KYB.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href="/dashboard/onboarding/kyc"
            className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 hover:border-amber-400/50"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Personal Customer
            </p>
            <h2 className="mt-3 text-3xl font-black">KYC Verification</h2>
            <p className="mt-4 text-slate-400">
              For individuals onboarding personally to use the KYA platform.
            </p>
          </Link>

          <Link
            href="/dashboard/onboarding/kyb"
            className="rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-amber-400/50"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Business Customer
            </p>
            <h2 className="mt-3 text-3xl font-black">KYB Verification</h2>
            <p className="mt-4 text-slate-400">
              For companies, SMEs, enterprises, and corporate importers.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}