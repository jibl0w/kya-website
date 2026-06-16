-- ============================================================
-- KYA Migration 007 — Enable deny-all RLS on all public tables
-- Closes the Supabase "RLS disabled" security advisory.
-- App access is server-side via service_role (bypasses RLS), so this
-- does not break the app. No permissive policies => anon key has no access.
-- Run on DEVELOPMENT first, verify the app still works, then PRODUCTION.
-- ============================================================

do $$
declare
  t record;
begin
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security;', t.tablename);
  end loop;
end $$;
