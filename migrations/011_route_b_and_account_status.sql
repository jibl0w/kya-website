-- Migration 011: Route B (self-funded) + account status / review columns
-- Captures schema changes made during development that were applied directly
-- to the dev database and must also be applied to production.
--
-- Safe to run multiple times: all statements use IF NOT EXISTS.
-- Additive only — no existing data is modified or dropped.

-- Route B (self-funded transaction route)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS fx_route text DEFAULT 'apply_fx';
ALTER TABLE edd_requests
  ADD COLUMN IF NOT EXISTS transaction_id uuid;

-- Account status + compliance review columns (kyc_profiles)
ALTER TABLE kyc_profiles
  ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active';
ALTER TABLE kyc_profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE kyc_profiles
  ADD COLUMN IF NOT EXISTS id_document_url text;
ALTER TABLE kyc_profiles
  ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE kyc_profiles
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp without time zone;
ALTER TABLE kyc_profiles
  ADD COLUMN IF NOT EXISTS reviewed_by text;

-- Account status + compliance review columns (kyb_profiles)
ALTER TABLE kyb_profiles
  ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active';
ALTER TABLE kyb_profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE kyb_profiles
  ADD COLUMN IF NOT EXISTS id_document_url text;
ALTER TABLE kyb_profiles
  ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE kyb_profiles
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp without time zone;
ALTER TABLE kyb_profiles
  ADD COLUMN IF NOT EXISTS reviewed_by text;