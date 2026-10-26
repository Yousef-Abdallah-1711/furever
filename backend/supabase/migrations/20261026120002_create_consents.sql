CREATE TABLE public.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  type text NOT NULL,
  version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX consents_user_id_idx ON public.consents (user_id);
CREATE TRIGGER consents_set_updated_at BEFORE UPDATE ON public.consents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY consents_select_own ON public.consents FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY consents_insert_own ON public.consents FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
GRANT SELECT, INSERT ON public.consents TO authenticated;

REVOKE UPDATE, DELETE ON public.consents FROM PUBLIC, anon, authenticated;
