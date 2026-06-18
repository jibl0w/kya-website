-- ============================================================
-- KYA Migration 010 — Provider raw response + reference (Phase 3, Dojah KYC/KYB)
-- Stores the complete Dojah verification payload for a full, auditable
-- due-diligence record (relied upon by ROECNY as appointed agent, and shared
-- with Source MFB). Per-check columns already exist; this adds the raw payload
-- and a shared verification reference + consent record.
-- Run on DEVELOPMENT first, verify, then PRODUCTION.
-- ============================================================

-- KYC (individuals)
alter table kyc_profiles add column if not exists provider_raw_response jsonb;
alter table kyc_profiles add column if not exists verification_reference text;       -- Dojah reference_id
alter table kyc_profiles add column if not exists verification_completed_at timestamptz;
alter table kyc_profiles add column if not exists dd_consent_given boolean default false;  -- consent to share due diligence with ROECNY/Source
alter table kyc_profiles add column if not exists dd_consent_at timestamptz;

-- KYB (businesses)
alter table kyb_profiles add column if not exists provider_raw_response jsonb;
alter table kyb_profiles add column if not exists verification_reference text;
alter table kyb_profiles add column if not exists verification_completed_at timestamptz;
alter table kyb_profiles add column if not exists verification_provider text;
alter table kyb_profiles add column if not exists provider_reference_id text;
alter table kyb_profiles add column if not exists liveness_status text;               -- representative liveness
alter table kyb_profiles add column if not exists selfie_url text;
alter table kyb_profiles add column if not exists dd_consent_given boolean default false;
alter table kyb_profiles add column if not exists dd_consent_at timestamptz;
