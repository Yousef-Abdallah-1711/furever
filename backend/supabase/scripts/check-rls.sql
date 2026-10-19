-- Returns every ordinary or partitioned public table that has RLS disabled.
-- pgTAP tests can call this function directly to inspect the same check used below.
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

DO $check_rls$
DECLARE
    offending_tables text;
BEGIN
    SELECT string_agg(table_name, ', ' ORDER BY table_name)
    INTO offending_tables
    FROM public.tables_missing_rls();

    IF offending_tables IS NOT NULL THEN
        RAISE EXCEPTION 'Public tables without row-level security: %', offending_tables
            USING ERRCODE = 'check_violation';
    END IF;
END;
$check_rls$;
