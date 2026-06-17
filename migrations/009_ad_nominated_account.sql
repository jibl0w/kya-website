-- ============================================================
-- KYA Migration 009 — AD-Nominated Account on Transactions (Phase 2, Source leg)
-- The NGN beneficiary for the Source leg comes ONLY from the AD's authenticated
-- ad_fx_authorised notification. Frozen onto the transaction the moment that
-- notification is verified and ingested. Never staff-entered.
-- Run on DEVELOPMENT first, verify, then PRODUCTION.
-- ============================================================

alter table transactions add column if not exists ad_nominated_name        text;
alter table transactions add column if not exists ad_nominated_account     text;
alter table transactions add column if not exists ad_nominated_bank        text;
alter table transactions add column if not exists ad_fx_authorised_at      timestamptz;
alter table transactions add column if not exists ad_fx_amount_ngn         numeric(20,2);
alter table transactions add column if not exists ad_fx_reference          text;

-- Status of the Source-leg FX authorisation for this transaction.
alter table transactions add column if not exists source_leg_status        text default 'awaiting_ad_authorisation'
  check (source_leg_status in ('awaiting_ad_authorisation','fx_authorised','payment_initiated','payment_executed','ad_confirmed','fx_released','usd_received'));
