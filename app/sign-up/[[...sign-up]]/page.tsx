import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
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
        <h2 className="text-xl font-bold text-white">Create your KYA account</h2>
        <p className="text-slate-400 text-sm mt-1">
          Start your Nigeria — Asia trade journey
        </p>
      </div>

      <SignUp />

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-600 max-w-sm">
          By creating an account you agree to KYA's terms of service. All accounts are subject to KYC or KYB verification before trade access is granted.
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-700">
          Not a PSP · Not a Bank · CAC Registered · Nigeria
        </p>
      </div>

    </main>
  );
}