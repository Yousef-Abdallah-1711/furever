-- D02: record an account deletion request and block the account at database
-- authorization boundaries. Final data/storage/Auth cleanup remains a separate
-- retryable workflow and is intentionally not performed by this migration.

CREATE TABLE public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  state text NOT NULL DEFAULT 'access_blocked'
    CHECK (state IN (
      'access_blocked',
      'data_cleanup_pending',
      'storage_cleanup_pending',
      'auth_deletion_pending',
      'completed'
    )),
  requested_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  cleanup_attempts integer NOT NULL DEFAULT 0 CHECK (cleanup_attempts >= 0),
  last_error text,
  completed_at timestamptz
);

CREATE INDEX account_deletion_requests_state_requested_at_idx
  ON public.account_deletion_requests (state, requested_at);

CREATE TRIGGER account_deletion_requests_set_updated_at
BEFORE UPDATE ON public.account_deletion_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.account_deletion_requests
  FROM PUBLIC, anon, authenticated, service_role;

-- RLS calls this helper with the current user's JWT. The SECURITY DEFINER
-- query avoids recursive profile RLS evaluation and returns only the caller's
-- active-state boolean.
CREATE FUNCTION public.is_active_account()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    WHERE profile.id = (SELECT auth.uid())
      AND profile.status = 'active'::public.user_status
      AND profile.deleted_at IS NULL
  );
$$;

REVOKE ALL ON FUNCTION public.is_active_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_account() TO authenticated;

-- The Edge Function verifies the user's bearer and five-minute AMR freshness,
-- then invokes this service-role-only RPC. The user id comes from the verified
-- token, never from an untrusted request body.
CREATE FUNCTION public.request_account_deletion(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_request public.account_deletion_requests%ROWTYPE;
BEGIN
  IF coalesce((SELECT auth.jwt() ->> 'role'), '') <> 'service_role' THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'SERVICE_ROLE_REQUIRED';
  END IF;
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'USER_ID_REQUIRED';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ACCOUNT_NOT_FOUND';
  END IF;

  SELECT * INTO v_request
  FROM public.account_deletion_requests
  WHERE user_id = p_user_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'request_id', v_request.id,
      'state', v_request.state,
      'requested_at', v_request.requested_at
    );
  END IF;

  IF v_profile.status <> 'active'::public.user_status
    OR v_profile.deleted_at IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ACCOUNT_NOT_ACTIVE';
  END IF;

  INSERT INTO public.account_deletion_requests (user_id)
  VALUES (p_user_id)
  RETURNING * INTO v_request;

  UPDATE public.profiles
  SET status = 'deleted'::public.user_status,
      deleted_at = coalesce(deleted_at, now())
  WHERE id = p_user_id;

  PERFORM public.write_audit_log(
    p_user_id,
    'account_deletion_requested',
    'profile',
    p_user_id::text,
    jsonb_build_object('request_id', v_request.id, 'state', v_request.state)
  );

  RETURN jsonb_build_object(
    'request_id', v_request.id,
    'state', v_request.state,
    'requested_at', v_request.requested_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.request_account_deletion(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.request_account_deletion(uuid) TO service_role;

-- Deleted accounts may continue to hold a cryptographically valid access JWT
-- until exp. Stop Auth from issuing or refreshing another application token.
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

  -- Keep the existing no-profile behavior for the staff invitation flow, which
  -- creates its profile only after a verified invitee accepts the invitation.
  IF NOT FOUND THEN
    RETURN event;
  END IF;
  IF v_status <> 'active'::public.user_status OR v_deleted_at IS NOT NULL THEN
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

-- Only an Edge Function carrying the server-only service role may transition a
-- profile to deleted. Ordinary authenticated role/status protections remain.
CREATE OR REPLACE FUNCTION public.protect_profile_role_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF coalesce((SELECT auth.jwt() ->> 'role'), '') = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF coalesce((SELECT auth.jwt() ->> 'user_role'), '') NOT IN ('admin', 'super_admin') THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.status IS DISTINCT FROM 'active'::public.user_status OR (
        NEW.role IS DISTINCT FROM 'owner'::public.app_role
        AND NOT (
          NEW.role = 'clinic_staff'::public.app_role
          AND EXISTS (
            SELECT 1 FROM public.staff_invitations AS invitation
            WHERE invitation.email = NEW.email
              AND invitation.accepted_at IS NULL
              AND invitation.revoked_at IS NULL
          )
        )
      ) THEN
        RAISE EXCEPTION 'Only an admin or a matching pending staff invite can set profile role or status';
      END IF;
    ELSIF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Only an admin can change profile role or status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Apply the active-account gate to every authenticated data policy in the
-- current D02 schema. Public catalog/config reads remain available to anon.
DROP POLICY profiles_select_self_or_admin ON public.profiles;
CREATE POLICY profiles_select_self_or_admin ON public.profiles
FOR SELECT TO authenticated
USING (
  public.is_active_account()
  AND (
    id = (SELECT auth.uid())
    OR (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
  )
);

DROP POLICY profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self ON public.profiles
FOR UPDATE TO authenticated
USING (id = (SELECT auth.uid()) AND public.is_active_account())
WITH CHECK (id = (SELECT auth.uid()) AND public.is_active_account());

DROP POLICY cities_select_all ON public.cities;
CREATE POLICY cities_select_all ON public.cities
FOR SELECT TO anon, authenticated
USING ((SELECT auth.role()) = 'anon' OR public.is_active_account());

DROP POLICY cities_insert_admin ON public.cities;
CREATE POLICY cities_insert_admin ON public.cities
FOR INSERT TO authenticated
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);
DROP POLICY cities_update_admin ON public.cities;
CREATE POLICY cities_update_admin ON public.cities
FOR UPDATE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
)
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);
DROP POLICY cities_delete_admin ON public.cities;
CREATE POLICY cities_delete_admin ON public.cities
FOR DELETE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);

DROP POLICY clinics_select_public_active ON public.clinics;
CREATE POLICY clinics_select_public_active ON public.clinics
FOR SELECT TO anon, authenticated
USING (
  status = 'active'::public.clinic_status
  AND ((SELECT auth.role()) = 'anon' OR public.is_active_account())
);
DROP POLICY clinics_select_admin_all ON public.clinics;
CREATE POLICY clinics_select_admin_all ON public.clinics
FOR SELECT TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);
DROP POLICY clinics_insert_admin ON public.clinics;
CREATE POLICY clinics_insert_admin ON public.clinics
FOR INSERT TO authenticated
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);
DROP POLICY clinics_update_admin ON public.clinics;
CREATE POLICY clinics_update_admin ON public.clinics
FOR UPDATE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
)
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);
DROP POLICY clinics_delete_admin ON public.clinics;
CREATE POLICY clinics_delete_admin ON public.clinics
FOR DELETE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);

DROP POLICY clinic_staff_select_self_or_admin ON public.clinic_staff;
CREATE POLICY clinic_staff_select_self_or_admin ON public.clinic_staff
FOR SELECT TO authenticated
USING (
  public.is_active_account()
  AND (
    user_id = (SELECT auth.uid())
    OR (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
  )
);
DROP POLICY clinic_staff_insert_admin ON public.clinic_staff;
CREATE POLICY clinic_staff_insert_admin ON public.clinic_staff
FOR INSERT TO authenticated
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);
DROP POLICY clinic_staff_update_admin ON public.clinic_staff;
CREATE POLICY clinic_staff_update_admin ON public.clinic_staff
FOR UPDATE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
)
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);
DROP POLICY clinic_staff_delete_admin ON public.clinic_staff;
CREATE POLICY clinic_staff_delete_admin ON public.clinic_staff
FOR DELETE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);

DROP POLICY push_tokens_select_own ON public.push_tokens;
CREATE POLICY push_tokens_select_own ON public.push_tokens
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) AND public.is_active_account());
DROP POLICY push_tokens_insert_own ON public.push_tokens;
CREATE POLICY push_tokens_insert_own ON public.push_tokens
FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()) AND public.is_active_account());
DROP POLICY push_tokens_update_own ON public.push_tokens;
CREATE POLICY push_tokens_update_own ON public.push_tokens
FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()) AND public.is_active_account())
WITH CHECK (user_id = (SELECT auth.uid()) AND public.is_active_account());
DROP POLICY push_tokens_delete_own ON public.push_tokens;
CREATE POLICY push_tokens_delete_own ON public.push_tokens
FOR DELETE TO authenticated
USING (user_id = (SELECT auth.uid()) AND public.is_active_account());

DROP POLICY consents_select_own ON public.consents;
CREATE POLICY consents_select_own ON public.consents
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) AND public.is_active_account());
DROP POLICY consents_insert_own ON public.consents;
CREATE POLICY consents_insert_own ON public.consents
FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()) AND public.is_active_account());

DROP POLICY staff_invitations_select_related ON public.staff_invitations;
CREATE POLICY staff_invitations_select_related ON public.staff_invitations
FOR SELECT TO authenticated
USING (
  public.is_active_account()
  AND (
    invited_by = (SELECT auth.uid())
    OR lower(email) = lower(coalesce((SELECT auth.jwt() ->> 'email'), ''))
    OR (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
  )
);

DROP POLICY audit_logs_select_admin ON public.audit_logs;
CREATE POLICY audit_logs_select_admin ON public.audit_logs
FOR SELECT TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);

DROP POLICY feature_flags_select_all ON public.feature_flags;
CREATE POLICY feature_flags_select_all ON public.feature_flags
FOR SELECT TO anon, authenticated
USING ((SELECT auth.role()) = 'anon' OR public.is_active_account());
DROP POLICY feature_flags_insert_super_admin ON public.feature_flags;
CREATE POLICY feature_flags_insert_super_admin ON public.feature_flags
FOR INSERT TO authenticated
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') = 'super_admin'
);
DROP POLICY feature_flags_update_super_admin ON public.feature_flags;
CREATE POLICY feature_flags_update_super_admin ON public.feature_flags
FOR UPDATE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') = 'super_admin'
)
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') = 'super_admin'
);
DROP POLICY feature_flags_delete_super_admin ON public.feature_flags;
CREATE POLICY feature_flags_delete_super_admin ON public.feature_flags
FOR DELETE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') = 'super_admin'
);

DROP POLICY app_config_select_all ON public.app_config;
CREATE POLICY app_config_select_all ON public.app_config
FOR SELECT TO anon, authenticated
USING ((SELECT auth.role()) = 'anon' OR public.is_active_account());
DROP POLICY app_config_insert_super_admin ON public.app_config;
CREATE POLICY app_config_insert_super_admin ON public.app_config
FOR INSERT TO authenticated
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') = 'super_admin'
);
DROP POLICY app_config_update_super_admin ON public.app_config;
CREATE POLICY app_config_update_super_admin ON public.app_config
FOR UPDATE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') = 'super_admin'
)
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') = 'super_admin'
);
DROP POLICY app_config_delete_super_admin ON public.app_config;
CREATE POLICY app_config_delete_super_admin ON public.app_config
FOR DELETE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') = 'super_admin'
);
