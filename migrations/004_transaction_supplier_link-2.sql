-- ============================================================
-- KYA Migration 004 — Bind Transactions to Verified Suppliers (Phase 2, Step 2b)
-- Transactions must reference a verified supplier by ID (not a free-text name).
-- This is the foundation for the frozen-beneficiary / triple-mirror control.
-- Run on DEVELOPMENT first, verify, then PRODUCTION.
-- ============================================================

alter table transactions add column if not exists supplier_id uuid references suppliers(id);

create index if not exists idx_transactions_supplier on transactions(supplier_id);

-- Note: existing rows keep supplier_name as-is; supplier_id is null for them.
-- New transactions are required (in the app layer) to bind a verified supplier_id.
