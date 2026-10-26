CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  platform text,
  min_app_version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER feature_flags_set_updated_at BEFORE UPDATE ON public.feature_flags
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY feature_flags_select_all ON public.feature_flags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY feature_flags_insert_super_admin ON public.feature_flags FOR INSERT TO authenticated
WITH CHECK ((select auth.jwt() ->> 'user_role') = 'super_admin');
CREATE POLICY feature_flags_update_super_admin ON public.feature_flags FOR UPDATE TO authenticated
USING ((select auth.jwt() ->> 'user_role') = 'super_admin')
WITH CHECK ((select auth.jwt() ->> 'user_role') = 'super_admin');
CREATE POLICY feature_flags_delete_super_admin ON public.feature_flags FOR DELETE TO authenticated
USING ((select auth.jwt() ->> 'user_role') = 'super_admin');
GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;

INSERT INTO public.feature_flags (key, enabled) VALUES
  ('shop_enabled', false), ('mating_enabled', false), ('adoption_enabled', false),
  ('payments_enabled', false), ('video_enabled', false);

CREATE FUNCTION public.audit_configuration_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  row_data jsonb;
  row_id text;
  row_diff jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    row_data := to_jsonb(OLD);
    row_id := coalesce(row_data ->> 'key', row_data ->> 'id');
    row_diff := row_data;
    PERFORM public.write_audit_log((select auth.uid()), lower(TG_OP), TG_TABLE_NAME, row_id, row_diff);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    row_data := to_jsonb(NEW);
    row_id := coalesce(row_data ->> 'key', row_data ->> 'id');
    row_diff := jsonb_build_object('old', to_jsonb(OLD), 'new', row_data);
  ELSE
    row_data := to_jsonb(NEW);
    row_id := coalesce(row_data ->> 'key', row_data ->> 'id');
    row_diff := row_data;
  END IF;

  PERFORM public.write_audit_log((select auth.uid()), lower(TG_OP), TG_TABLE_NAME, row_id, row_diff);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_configuration_change() FROM PUBLIC, anon, authenticated, service_role;
CREATE TRIGGER feature_flags_audit AFTER INSERT OR UPDATE OR DELETE ON public.feature_flags
FOR EACH ROW EXECUTE FUNCTION public.audit_configuration_change();
