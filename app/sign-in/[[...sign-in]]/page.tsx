import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">

      <div className="mb-8 text-center">
        <Link href="/">
          <h1 className="text-4xl font-black text-white">
            KY<span className="text-amber-400">A</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Cross-Border Trade Infrastructure</p>
        </Link>
      </div>

      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white">Sign in to your KYA account</h2>
        <p className="text-slate-400 text-sm mt-1">
          Access your trade dashboard
        </p>
      </div>

      <SignIn />

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-600 max-w-sm">
          New to KYA? <Link href="/sign-up" className="text-amber-400 hover:text-amber-300 transition">Create an account →</Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-700">
          Not a PSP · Not a Bank · CAC Registered · Nigeria
        </p>
      </div>

    </main>
  );
}