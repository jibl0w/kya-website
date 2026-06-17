-- ============================================================
-- KYA Migration 006 — Add verified_at to transaction_otps
-- Supports binding OTP verification to the action it authorises
-- (verify marks verified_at; the action route consumes it).
-- NOTE: OTP was later removed from transaction creation; this column
-- remains for use in payment-instruction and supplier-bank-change OTP flows.
-- Run on DEVELOPMENT first, verify, then PRODUCTION.
-- ============================================================

alter table transaction_otps add column if not exists verified_at timestamptz;
