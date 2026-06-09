import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black text-white">
          KY<span className="text-amber-400">A</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
      </div>
      <SignIn
        routing="hash"
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-600">
          KYA Digital Services Ltd · Not a PSP · Not a Bank
        </p>
      </div>
    </main>
  );
}