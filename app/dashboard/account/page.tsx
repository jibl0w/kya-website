import { UserProfile } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AccountPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-slate-400">Account Settings</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-4xl px-8 py-12">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-1">Account</p>
          <h1 className="text-3xl font-black mb-2">Account Settings</h1>
          <p className="text-slate-400 text-sm">
            Manage your email address, password, phone number, and security settings.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden bg-white">
          <UserProfile
            appearance={{
              variables: {
                colorPrimary: "#C9A84C",
                colorBackground: "#ffffff",
                colorInputBackground: "#f8fafc",
                colorInputText: "#0f172a",
                colorText: "#0f172a",
                colorTextSecondary: "#475569",
                colorNeutral: "#0f172a",
                colorDanger: "#EF4444",
                colorSuccess: "#10B981",
                borderRadius: "12px",
                fontFamily: "Arial, sans-serif",
                fontSize: "14px",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}