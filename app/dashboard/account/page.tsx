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

        <div className="rounded-2xl overflow-hidden">
          <UserProfile
            appearance={{
              variables: {
                colorPrimary: "#C9A84C",
                colorBackground: "#0D1420",
                colorInputBackground: "#0A0E1A",
                colorInputText: "#E8E0D0",
                colorText: "#E8E0D0",
                colorTextSecondary: "#8A9AB5",
                colorNeutral: "#4A5568",
                borderRadius: "12px",
              },
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border border-white/10 rounded-2xl",
                navbar: "bg-slate-900/50 border-r border-white/10",
                navbarButton: "text-slate-400 hover:text-white",
                navbarButtonActive: "text-amber-400",
                pageScrollBox: "bg-transparent",
                formButtonPrimary: "bg-amber-400 text-slate-950 hover:bg-amber-300",
                formFieldInput: "bg-slate-900 border-white/10 text-white",
                formFieldLabel: "text-slate-400",
                headerTitle: "text-white",
                headerSubtitle: "text-slate-400",
                profileSectionTitleText: "text-white",
                badge: "bg-amber-400/20 text-amber-400",
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}