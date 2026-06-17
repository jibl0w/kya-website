"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface Wallet {
  bank: string;
  currency: string;
  accountReference: string | null;
  accountStatus: string;
  balance: number;
  balanceAsOf: string;
  isMock: boolean;
}

const BANK_LABELS: Record<string, string> = {
  source_mfb: "Source MFB",
  roecny: "ROECNY",
};

const WALLET_SUBTITLES: Record<string, string> = {
  NGN: "Naira account · Source MFB",
  USD: "USD account · ROECNY",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending_bank_kyc: { label: "Awaiting bank account opening", color: "text-amber-400" },
  active: { label: "Active", color: "text-emerald-400" },
  restricted: { label: "Restricted", color: "text-amber-400" },
  suspended: { label: "Suspended", color: "text-red-400" },
  closed: { label: "Closed", color: "text-slate-500" },
};

export default function WalletPage() {
  const { user, isLoaded } = useUser();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchWallets();
  }, [isLoaded, user]);

  async function fetchWallets() {
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      setWallets(data.wallets || []);
    } catch (err) {
      console.error("Wallet fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  function formatBalance(currency: string, amount: number) {
    const symbol = currency === "NGN" ? "₦" : "$";
    return symbol + Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm font-medium">Wallets</span>
        </div>
        <span className="text-xl font-black">KY<span className="text-amber-400">A</span></span>
      </header>

      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400 mb-1">Your Accounts</p>
          <h1 className="text-3xl font-black">Wallets</h1>
          <p className="mt-2 text-slate-400 text-sm">
            Your Naira and USD account balances, mirrored from Source MFB and ROECNY.
          </p>
        </div>

        {wallets.some((w) => w.isMock) && (
          <div className="mb-6 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
            <p className="text-xs text-amber-300">
              Simulated balances. Live balances will display once bank connections are active.
            </p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {wallets.map((w) => {
            const status = statusConfig[w.accountStatus] || statusConfig.pending_bank_kyc;
            const isActive = w.accountStatus === "active" && w.accountReference;

            return (
              <div key={w.bank} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-2xl font-black">{w.currency}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{WALLET_SUBTITLES[w.currency]}</p>
                  </div>
                  <span className={"text-xs font-medium " + status.color}>{status.label}</span>
                </div>

                {isActive ? (
                  <>
                    <p className="text-3xl font-black text-white">{formatBalance(w.currency, w.balance)}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Account {w.accountReference} · {BANK_LABELS[w.bank]}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Updated {new Date(w.balanceAsOf).toLocaleString("en-GB")}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-black text-slate-700">{formatBalance(w.currency, 0)}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {BANK_LABELS[w.bank]} will open your account after verification. Your balance appears here once active.
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-slate-500 leading-relaxed">
            KYA mirrors your bank balances for visibility. KYA does not hold or move your funds — all payments are made by your banks under instructions you authorise.
          </p>
        </div>
      </div>
    </main>
  );
}