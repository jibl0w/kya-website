import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function PlatformPage() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-3">
          KY<span className="text-amber-400">A</span>
        </h1>
        <p className="text-slate-400 text-sm">Trade Platform</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {userId ? (
          <Link href="/dashboard"
            className="rounded-xl bg-amber-400 py-4 text-center font-bold text-slate-950 hover:bg-amber-300 transition">
            Go to Dashboard →
          </Link>
        ) : (
          <>
            <Link href="/sign-in"
              className="rounded-xl bg-amber-400 py-4 text-center font-bold text-slate-950 hover:bg-amber-300 transition">
              Sign In
            </Link>
            <Link href="/sign-up"
              className="rounded-xl border border-white/10 py-4 text-center font-medium hover:bg-white/5 transition">
              Create Account
            </Link>
          </>
        )}
      </div>

      <p className="mt-12 text-xs text-slate-700">
        KYA Digital Services · Trade Platform
      </p>
    </main>
  );
}