-- ============================================================
-- KYA Migration 002 — Payment Instructions (Phase 2, Step 2)
-- The authenticated instruction record + confirmations + inbound notifications.
-- KYA captures, authenticates (OTP), signs, and transmits instructions.
-- KYA never moves money. Beneficiary is frozen from an authenticated source.
-- Run on DEVELOPMENT first, verify, then PRODUCTION.
-- ============================================================

-- ---------- payment_instructions ----------
create table if not exists payment_instructions (
  id                     uuid primary key default gen_random_uuid(),
  instruction_id         text not null unique,
  transaction_id         uuid not null references transactions(id),
  user_id                text not null,
  leg                    text not null check (leg in ('source_ngn','roecny_usd')),
  beneficiary_type       text not null check (beneficiary_type in ('ad_nominated_account','lc_supplier')),
  beneficiary_name       text,
  beneficiary_account    text,
  beneficiary_bank       text,
  beneficiary_frozen_at  timestamptz,
  amount                 numeric(20,2) not null,
  currency               text not null check (currency in ('NGN','USD')),
  lc_reference           text,
  form_m_reference       text,
  status                 text not null default 'draft'
                          check (status in (
                            'draft','otp_pending','otp_verified','signed',
                            'transmitted','acknowledged','executed',
                            'confirmation_pending','reconciled','settled',
                            'expired','rejected','failed')),
  instruction_hash       text,
  otp_attestation_hash   text,
  otp_verified_at        timestamptz,
  signature              text,
  expires_at             timestamptz,
  transmitted_at         timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists idx_pi_user on payment_instructions(user_id);
create index if not exists idx_pi_txn on payment_instructions(transaction_id);
create index if not exists idx_pi_status on payment_instructions(status);

drop trigger if exists trg_pi_updated on payment_instructions;
create trigger trg_pi_updated
  before update on payment_instructions
  for each row execute function set_updated_at();

-- ---------- payment_confirmations ----------
create table if not exists payment_confirmations (
  id                     uuid primary key default gen_random_uuid(),
  instruction_id         text not null references payment_instructions(instruction_id),
  source                 text not null check (source in ('bank_notification','customer_upload')),
  bank                   text check (bank in ('source_mfb','roecny')),
  confirmation_reference text,
  document_path          text,
  signature_verified     boolean default false,
  reconciliation_status  text not null default 'pending'
                          check (reconciliation_status in ('pending','matched','discrepancy')),
  received_at            timestamptz not null default now()
);

create index if not exists idx_pc_instruction on payment_confirmations(instruction_id);

-- ---------- bank_notifications (inbound) ----------
create table if not exists bank_notifications (
  id                 uuid primary key default gen_random_uuid(),
  notification_type  text not null check (notification_type in (
                       'ad_fx_authorised',
                       'source_payment_executed',
                       'ad_payment_received',
                       'ad_fx_released_to_roecny',
                       'roecny_usd_received',
                       'roecny_supplier_paid')),
  from_party         text not null check (from_party in ('source_mfb','ad','roecny')),
  transaction_id     uuid references transactions(id),
  payload            jsonb,
  signature_verified boolean default false,
  ingested_note      text,
  received_at        timestamptz not null default now()
);

create index if not exists idx_bn_txn on bank_notifications(transaction_id);
create index if not exists idx_bn_type on bank_notifications(notification_type);

-- ---------- RLS ----------
alter table payment_instructions enable row level security;
alter table payment_confirmations enable row level security;
alter table bank_notifications enable row level security;
