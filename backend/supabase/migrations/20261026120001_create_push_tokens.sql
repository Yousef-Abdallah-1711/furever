CREATE TABLE public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  locale text NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT push_tokens_token_unique UNIQUE (token)
);
CREATE INDEX push_tokens_user_id_idx ON public.push_tokens (user_id);
CREATE TRIGGER push_tokens_set_updated_at BEFORE UPDATE ON public.push_tokens FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY push_tokens_select_own ON public.push_tokens FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY push_tokens_insert_own ON public.push_tokens FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY push_tokens_update_own ON public.push_tokens FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY push_tokens_delete_own ON public.push_tokens FOR DELETE TO authenticated USING (user_id = (select auth.uid()));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_tokens TO authenticated;
