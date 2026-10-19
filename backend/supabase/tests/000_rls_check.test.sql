CREATE OR REPLACE FUNCTION public.tables_missing_rls()
RETURNS TABLE (table_name text)
LANGUAGE sql
STABLE
SET search_path = pg_catalog
AS $function$
    SELECT format('%I.%I', n.nspname, c.relname)::text
    FROM pg_catalog.pg_class AS c
    JOIN pg_catalog.pg_namespace AS n
        ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
      AND c.relrowsecurity = false
    ORDER BY c.relname;
$function$;

BEGIN;
SELECT plan(2);

-- Negative case: a scratch table without RLS.
CREATE TABLE public._check_rls_fixture_negative (id int);

SELECT ok(
  'public._check_rls_fixture_negative' IN (SELECT table_name FROM public.tables_missing_rls()),
  'tables_missing_rls() flags a public table with RLS disabled'
);

-- Positive case: a different scratch table, with RLS enabled.
CREATE TABLE public._check_rls_fixture_positive (id int);
ALTER TABLE public._check_rls_fixture_positive ENABLE ROW LEVEL SECURITY;

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.tables_missing_rls()
    WHERE table_name = 'public._check_rls_fixture_positive'
  ),
  'tables_missing_rls() does not flag a public table with RLS enabled'
);

SELECT * FROM finish();
ROLLBACK;
