-- ============================================================
-- KYA Migration 008 — Settlement Ledger (Phase 2, Step E)
-- Append-only audit timeline of each transaction's money journey.
-- Record-keeping only — KYA never moves funds. Every event links to
-- the evidence (notification/confirmation) that proves it.
-- Run on DEVELOPMENT first, verify, then PRODUCTION.
-- ============================================================

create table if not exists settlement_ledger (
  id              uuid primary key default gen_random_uuid(),
  transaction_id  uuid not null references transactions(id),
  instruction_id  text,                       -- payment_instructions.instruction_id, if applicable
  leg             text check (leg in ('source_ngn','roecny_usd')),
  event_type      text not null,              -- e.g. instruction_created, otp_verified, transmitted, roecny_confirmed, customer_confirmed, reconciled, settled
  amount          numeric(20,2),
  currency        text,
  evidence_ref    text,                       -- link/id of the notification or confirmation proving this event
  detail          jsonb,                      -- any extra structured context
  recorded_at     timestamptz not null default now()
);

create index if not exists idx_ledger_txn on settlement_ledger(transaction_id);
create index if not exists idx_ledger_instruction on settlement_ledger(instruction_id);

alter table settlement_ledger enable row level security;
