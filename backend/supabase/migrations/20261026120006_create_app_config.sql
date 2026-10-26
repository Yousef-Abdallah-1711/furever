CREATE TABLE public.app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER app_config_set_updated_at BEFORE UPDATE ON public.app_config
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY app_config_select_all ON public.app_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY app_config_insert_super_admin ON public.app_config FOR INSERT TO authenticated
WITH CHECK ((select auth.jwt() ->> 'user_role') = 'super_admin');
CREATE POLICY app_config_update_super_admin ON public.app_config FOR UPDATE TO authenticated
USING ((select auth.jwt() ->> 'user_role') = 'super_admin')
WITH CHECK ((select auth.jwt() ->> 'user_role') = 'super_admin');
CREATE POLICY app_config_delete_super_admin ON public.app_config FOR DELETE TO authenticated
USING ((select auth.jwt() ->> 'user_role') = 'super_admin');
GRANT SELECT ON public.app_config TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_config TO authenticated;

CREATE TRIGGER app_config_audit AFTER INSERT OR UPDATE OR DELETE ON public.app_config
FOR EACH ROW EXECUTE FUNCTION public.audit_configuration_change();
