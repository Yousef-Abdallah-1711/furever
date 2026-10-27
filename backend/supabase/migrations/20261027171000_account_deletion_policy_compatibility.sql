-- Preserve the established suspended-user behavior: a suspended user may read
-- their own status so guards can route them safely, while other data policies
-- remain closed by is_active_account(). Only deletion blocks token refresh.

GRANT SELECT ON TABLE public.account_deletion_requests TO service_role;

DROP POLICY profiles_select_self_or_admin ON public.profiles;
CREATE POLICY profiles_select_self_or_admin ON public.profiles
FOR SELECT TO authenticated
USING (
  (
    id = (SELECT auth.uid())
    AND status = 'suspended'::public.user_status
    AND deleted_at IS NULL
  )
  OR (
    public.is_active_account()
    AND (
      id = (SELECT auth.uid())
      OR (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
    )
  )
);

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role text;
  v_status public.user_status;
  v_deleted_at timestamptz;
BEGIN
  SELECT profile.role::text, profile.status, profile.deleted_at
  INTO v_role, v_status, v_deleted_at
  FROM public.profiles AS profile
  WHERE profile.id = (event ->> 'user_id')::uuid;

  IF NOT FOUND THEN
    RETURN event;
  END IF;
  IF v_status = 'deleted'::public.user_status OR v_deleted_at IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'ACCOUNT_UNAVAILABLE';
  END IF;
  RETURN jsonb_set(event, '{claims,user_role}', to_jsonb(v_role), true);
END;
$$;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb)
  TO supabase_auth_admin;
