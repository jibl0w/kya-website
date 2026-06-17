import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getBankBalance, type Bank, type Currency } from "@/lib/bank-adapters";

// The two wallets every verified customer has.
const WALLET_DEFS: { bank: Bank; currency: Currency }[] = [
  { bank: "source_mfb", currency: "NGN" },
  { bank: "roecny", currency: "USD" },
];

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  // Load existing wallet rows for this customer.
  const { data: existing } = await supabaseServer
    .from("wallet_accounts")
    .select("*")
    .eq("user_id", userId);

  const wallets = existing || [];

  // Ensure both wallet rows exist (create any missing ones in pending state).
  for (const def of WALLET_DEFS) {
    const has = wallets.find((w) => w.bank === def.bank);
    if (!has) {
      const { data: created } = await supabaseServer
        .from("wallet_accounts")
        .insert({
          user_id: userId,
          bank: def.bank,
          currency: def.currency,
          account_status: "pending_bank_kyc",
        })
        .select()
        .single();
      if (created) wallets.push(created);
    }
  }

  // Fetch (mock) balances and refresh the mirror for active accounts.
  const result = await Promise.all(
    wallets.map(async (w) => {
      const live = await getBankBalance(w.bank, w.currency, w.account_reference);

      // Only mirror a balance once the bank has actually opened the account.
      const showBalance = w.account_status === "active" && w.account_reference;
      const balance = showBalance ? live.balance : 0;

      // Update the cached mirror (best-effort; not authoritative).
      if (showBalance) {
        await supabaseServer
          .from("wallet_accounts")
          .update({ mirrored_balance: balance, balance_updated_at: live.asOf })
          .eq("id", w.id);
      }

      return {
        bank: w.bank,
        currency: w.currency,
        accountReference: w.account_reference,
        accountStatus: w.account_status,
        balance,
        balanceAsOf: live.asOf,
        isMock: live.isMock,
      };
    })
  );

  return NextResponse.json({ wallets: result });
}