BEGIN;
SELECT plan(1);

-- Create a scratch table without RLS; the transaction rollback removes it.
CREATE TABLE public._check_rls_fixture_negative (id int);

SELECT ok(
  'public._check_rls_fixture_negative' IN (SELECT table_name FROM public.tables_missing_rls()),
  'tables_missing_rls() flags a public table with RLS disabled'
);

SELECT * FROM finish();
ROLLBACK;
BEGIN;
SELECT plan(1);

-- Create a scratch table with RLS enabled; the transaction rollback removes it.
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