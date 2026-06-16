-- ============================================================
-- KYA Migration 001 — Wallets & Bank Provisioning (Phase 2, Step 1)
-- ------------------------------------------------------------
-- Read-only wallet mirrors of customer bank balances (Source MFB / ROECNY)
-- and the "notify bank of verified customer" provisioning record.
--
-- KYA never holds funds. mirrored_balance is a CACHED COPY of the bank's
-- balance, NOT an authoritative ledger. The bank is always the source of truth.
--
-- Run on DEVELOPMENT Supabase first, verify, then PRODUCTION.
-- ============================================================

-- ---------- Table: wallet_accounts ----------
-- One row per customer per currency/bank. The mirror.
create table if not exists wallet_accounts (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  text not null,                 -- Clerk user id
  bank                     text not null check (bank in ('source_mfb','roecny')),
  currency                 text not null check (currency in ('NGN','USD')),

  -- Real bank account reference. Populated ONLY from an authenticated bank
  -- notification (never staff-entered). Null until the bank opens the account.
  account_reference        text,

  account_status           text not null default 'pending_bank_kyc'
                            check (account_status in
                              ('pending_bank_kyc','active','restricted','suspended','closed')),

  -- Cached mirror of the bank balance. NOT authoritative.
  mirrored_balance         numeric(20,2) not null default 0,
  balance_updated_at       timestamptz,

  -- When KYA sent the "verified customer" provisioning notice to this bank.
  provisioning_notified_at timestamptz,

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  -- One wallet per customer per bank.
  unique (user_id, bank)
);

create index if not exists idx_wallet_accounts_user on wallet_accounts(user_id);

-- ---------- Table: bank_provisioning_notifications ----------
-- Records the "notify bank that this customer passed KYA KYC/KYB" event.
-- Provisioning = a NOTIFICATION to the bank, NOT account creation by KYA.
create table if not exists bank_provisioning_notifications (
  id                     uuid primary key default gen_random_uuid(),
  user_id                text not null,
  bank                   text not null check (bank in ('source_mfb','roecny')),

  notified_by            text not null,         -- staff Clerk id who triggered it
  notified_at            timestamptz not null default now(),

  -- Hash of the customer payload that was sent (non-repudiation / tamper-evidence).
  customer_payload_hash  text not null,

  status                 text not null default 'sent'
                          check (status in ('sent','acknowledged','account_opened','rejected')),
  status_updated_at      timestamptz,

  created_at             timestamptz not null default now()
);

create index if not exists idx_provisioning_user on bank_provisioning_notifications(user_id);

-- ---------- updated_at trigger for wallet_accounts ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_wallet_accounts_updated on wallet_accounts;
create trigger trg_wallet_accounts_updated
  before update on wallet_accounts
  for each row execute function set_updated_at();
