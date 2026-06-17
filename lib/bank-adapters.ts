// ============================================================
// KYA Bank Adapters
// ------------------------------------------------------------
// Abstraction over Source MFB (NGN) and ROECNY (USD).
// CURRENTLY MOCKED — returns simulated balances so the wallet
// mirror can be built and tested without live bank APIs.
//
// When live: replace the mock bodies with authenticated API
// calls to each bank. The function signatures stay the same,
// so nothing else in the app changes.
//
// KYA never holds funds. These adapters READ balances and
// (later) TRANSMIT signed instructions. They never move money.
// ============================================================

export type Bank = "source_mfb" | "roecny";
export type Currency = "NGN" | "USD";

export interface BankBalance {
  bank: Bank;
  currency: Currency;
  accountReference: string | null;
  balance: number;
  asOf: string; // ISO timestamp
  isMock: boolean;
}

// ---- MOCK DATA ----
// Deterministic simulated balances keyed by account reference, so the
// same customer sees a stable balance during testing. Falls back to 0
// when no account reference exists yet (bank hasn't opened the account).
const MOCK_BALANCES: Record<string, number> = {};

function mockBalanceFor(reference: string | null, currency: Currency): number {
  if (!reference) return 0;
  if (MOCK_BALANCES[reference] !== undefined) return MOCK_BALANCES[reference];
  // Derive a stable pseudo-balance from the reference string so it doesn't
  // change on every call during a demo/test.
  let hash = 0;
  for (let i = 0; i < reference.length; i++) {
    hash = (hash * 31 + reference.charCodeAt(i)) % 1000000;
  }
  const base = currency === "NGN" ? 5_000_000 : 12_000;
  const value = base + (hash % (currency === "NGN" ? 5_000_000 : 8_000));
  MOCK_BALANCES[reference] = value;
  return value;
}

/**
 * Fetch the current balance for a customer's bank account.
 * MOCKED: returns a simulated balance.
 * LIVE (future): authenticated GET to the bank's balance endpoint.
 */
export async function getBankBalance(
  bank: Bank,
  currency: Currency,
  accountReference: string | null
): Promise<BankBalance> {
  // Simulate light network latency so the UI's loading states are exercised.
  await new Promise((r) => setTimeout(r, 150));

  return {
    bank,
    currency,
    accountReference,
    balance: mockBalanceFor(accountReference, currency),
    asOf: new Date().toISOString(),
    isMock: true,
  };
}