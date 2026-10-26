CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  diff jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_entity_entity_id_idx ON public.audit_logs (entity, entity_id);
CREATE INDEX audit_logs_actor_created_at_idx ON public.audit_logs (actor_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_select_admin ON public.audit_logs FOR SELECT TO authenticated
USING ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));

REVOKE ALL ON TABLE public.audit_logs FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.audit_logs TO authenticated;
