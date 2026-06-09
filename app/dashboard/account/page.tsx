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
    colorInputBackground: "#1A2540",
    colorInputText: "#E8E0D0",
    colorText: "#E8E0D0",
    colorTextSecondary: "#94A3B8",
    colorNeutral: "#E8E0D0",
    colorShimmer: "#1A2540",
    borderRadius: "12px",
    fontFamily: "Arial, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    card: "bg-transparent shadow-none border border-white/10 rounded-2xl",
    navbar: "bg-slate-900/50 border-r border-white/10",
    navbarButton: "text-slate-300 hover:text-white",
    navbarButtonActive: "text-amber-400 bg-amber-400/10",
    pageScrollBox: "bg-transparent",
    formButtonPrimary: "bg-amber-400 text-slate-950 hover:bg-amber-300",
    formFieldInput: "bg-slate-800 border-white/20 text-white",
    formFieldLabel: "text-slate-200 font-medium",
    formFieldLabelRow: "text-slate-200",
    headerTitle: "text-white",
    headerSubtitle: "text-slate-300",
    profileSectionTitleText: "text-white font-semibold",
    profileSectionTitle: "border-white/10",
    accordionTriggerButton: "text-white hover:text-amber-400",
    badge: "bg-amber-400/20 text-amber-400",
    tableHead: "text-slate-300",
    timezoneSelectTrigger: "bg-slate-800 border-white/20 text-white",
    selectButton: "bg-slate-800 border-white/20 text-white",
    selectOptionsContainer: "bg-slate-800 border-white/20",
    menuButton: "text-white",
    menuItem: "text-white hover:bg-white/10",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-amber-400",
    userPreviewMainIdentifier: "text-white",
    userPreviewSecondaryIdentifier: "text-slate-300",
    avatarBox: "border-2 border-amber-400/30",
  }
}}
          />
        </div>
      </div>
    </main>
  );
}