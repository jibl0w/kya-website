-- ============================================================
-- KYA Migration 003 — Supplier Bank Details + Change Audit (Phase 2, Step 2b)
-- The supplier-provided beneficiary details (source of truth for the ROECNY leg),
-- with OTP-gated, logged changes. Validated against the LC at payment time
-- (triple-mirror: supplier record = LC = frozen instruction).
-- Run on DEVELOPMENT first, verify, then PRODUCTION.
-- ============================================================

-- ---------- Supplier beneficiary fields ----------
alter table suppliers add column if not exists beneficiary_name        text;
alter table suppliers add column if not exists beneficiary_account     text;
alter table suppliers add column if not exists beneficiary_bank        text;
alter table suppliers add column if not exists beneficiary_swift       text;
alter table suppliers add column if not exists beneficiary_currency    text;
alter table suppliers add column if not exists bank_details_status     text default 'not_provided'
  check (bank_details_status in ('not_provided','provided','locked'));
alter table suppliers add column if not exists bank_details_updated_at timestamptz;

-- ---------- Supplier bank-detail change audit ----------
create table if not exists supplier_bank_changes (
  id                 uuid primary key default gen_random_uuid(),
  supplier_id        uuid not null references suppliers(id),
  change_type        text not null check (change_type in ('initial','update')),
  previous_details   jsonb,
  new_details        jsonb,
  otp_verified       boolean not null default false,
  otp_verified_at    timestamptz,
  changed_by         text,
  change_hash        text,
  created_at         timestamptz not null default now()
);

create index if not exists idx_sbc_supplier on supplier_bank_changes(supplier_id);

alter table supplier_bank_changes enable row level security;
