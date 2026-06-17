-- ============================================================
-- KYA Migration 005 — Per-Currency Supplier Beneficiaries (Phase 2, Step 2b)
-- A supplier may be paid in USD or RMB, with DIFFERENT beneficiary accounts
-- for each. The transaction's payment currency selects which account freezes.
-- ROECNY (offshore Singapore) handles the RMB rail.
-- Run on DEVELOPMENT first, verify, then PRODUCTION.
-- ============================================================

-- ---------- USD beneficiary set ----------
alter table suppliers add column if not exists usd_beneficiary_name     text;
alter table suppliers add column if not exists usd_beneficiary_account  text;
alter table suppliers add column if not exists usd_beneficiary_bank     text;
alter table suppliers add column if not exists usd_beneficiary_swift    text;
alter table suppliers add column if not exists usd_details_status       text default 'not_provided'
  check (usd_details_status in ('not_provided','provided','locked'));

-- ---------- RMB beneficiary set ----------
alter table suppliers add column if not exists rmb_beneficiary_name     text;
alter table suppliers add column if not exists rmb_beneficiary_account  text;
alter table suppliers add column if not exists rmb_beneficiary_bank     text;
alter table suppliers add column if not exists rmb_beneficiary_swift    text;
alter table suppliers add column if not exists rmb_details_status       text default 'not_provided'
  check (rmb_details_status in ('not_provided','provided','locked'));

-- ---------- Migrate any existing single-beneficiary data into the USD set ----------
-- (003 stored one beneficiary; treat it as the USD account by default.)
update suppliers
set usd_beneficiary_name    = beneficiary_name,
    usd_beneficiary_account = beneficiary_account,
    usd_beneficiary_bank    = beneficiary_bank,
    usd_beneficiary_swift   = beneficiary_swift,
    usd_details_status      = case when bank_details_status = 'provided' then 'provided'
                                   when bank_details_status = 'locked'   then 'locked'
                                   else 'not_provided' end
where beneficiary_account is not null;

-- ---------- Allow RMB on payment instructions (USD / NGN / RMB) ----------
alter table payment_instructions drop constraint if exists payment_instructions_currency_check;
alter table payment_instructions add constraint payment_instructions_currency_check
  check (currency in ('NGN','USD','RMB'));
