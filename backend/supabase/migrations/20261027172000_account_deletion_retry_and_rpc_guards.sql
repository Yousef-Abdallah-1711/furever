-- Keep the deletion request reversible before cleanup starts, and guard
-- SECURITY DEFINER operations that do not pass through ordinary table RLS.

ALTER TABLE public.account_deletion_requests
  DROP CONSTRAINT account_deletion_requests_state_check;
ALTER TABLE public.account_deletion_requests
  ADD CONSTRAINT account_deletion_requests_state_check
  CHECK (state IN (
    'access_blocked',
    'data_cleanup_pending',
    'storage_cleanup_pending',
    'auth_deletion_pending',
    'completed',
    'cancelled'
  ));

CREATE OR REPLACE FUNCTION public.request_account_deletion(p_user_id uuid)
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
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF FOUND AND v_request.state <> 'cancelled' THEN
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

  IF FOUND THEN
    UPDATE public.account_deletion_requests
    SET state = 'access_blocked', requested_at = now(), updated_at = now(),
        cleanup_attempts = 0, last_error = NULL, completed_at = NULL
    WHERE id = v_request.id
    RETURNING * INTO v_request;
  ELSE
    INSERT INTO public.account_deletion_requests (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_request;
  END IF;

  UPDATE public.profiles
  SET status = 'deleted'::public.user_status, deleted_at = now()
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

CREATE FUNCTION public.cancel_account_deletion(p_user_id uuid)
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

  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ACCOUNT_NOT_FOUND';
  END IF;
  SELECT * INTO v_request
  FROM public.account_deletion_requests
  WHERE user_id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'DELETION_REQUEST_NOT_FOUND';
  END IF;
  IF v_request.state = 'cancelled' THEN
    RETURN jsonb_build_object('request_id', v_request.id, 'state', 'cancelled');
  END IF;
  IF v_request.state <> 'access_blocked'
    OR v_profile.status <> 'deleted'::public.user_status
    OR v_profile.deleted_at IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'DELETION_CANNOT_BE_CANCELLED';
  END IF;

  UPDATE public.account_deletion_requests
  SET state = 'cancelled', updated_at = now()
  WHERE id = v_request.id;
  UPDATE public.profiles
  SET status = 'active'::public.user_status, deleted_at = NULL
  WHERE id = p_user_id;
  PERFORM public.write_audit_log(
    p_user_id,
    'account_deletion_cancelled',
    'profile',
    p_user_id::text,
    jsonb_build_object('request_id', v_request.id)
  );
  RETURN jsonb_build_object('request_id', v_request.id, 'state', 'cancelled');
END;
$$;
REVOKE ALL ON FUNCTION public.cancel_account_deletion(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cancel_account_deletion(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_actor_id uuid,
  p_action text,
  p_entity text,
  p_entity_id text,
  p_diff jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NOT NULL AND NOT public.is_active_account() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'ACCOUNT_NOT_ACTIVE';
  END IF;
  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, diff)
  VALUES (p_actor_id, p_action, p_entity, p_entity_id, p_diff);
END;
$$;
REVOKE ALL ON FUNCTION public.write_audit_log(uuid, text, text, text, jsonb)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.write_audit_log(uuid, text, text, text, jsonb)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_user_status(
  p_user_id uuid,
  p_status public.user_status,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_old_status public.user_status;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = 'PT401';
  END IF;
  IF NOT public.is_active_account() THEN
    RAISE EXCEPTION 'ACTOR_NOT_ACTIVE' USING ERRCODE = 'PT403';
  END IF;
  IF coalesce((SELECT auth.jwt() ->> 'user_role'), '') NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED' USING ERRCODE = 'PT403';
  END IF;
  IF p_user_id IS NULL OR p_status IS NULL OR p_status NOT IN ('active', 'suspended') THEN
    RAISE EXCEPTION 'INVALID_STATUS_REQUEST' USING ERRCODE = 'PT400';
  END IF;
  IF p_user_id = v_actor_id THEN
    RAISE EXCEPTION 'SELF_STATUS_CHANGE_FORBIDDEN' USING ERRCODE = 'PT403';
  END IF;
  IF p_status = 'suspended' AND nullif(btrim(p_reason), '') IS NULL THEN
    RAISE EXCEPTION 'SUSPENSION_REASON_REQUIRED' USING ERRCODE = 'PT400';
  END IF;

  SELECT p.status INTO v_old_status
  FROM public.profiles AS p
  WHERE p.id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_NOT_FOUND' USING ERRCODE = 'PT404';
  END IF;
  IF v_old_status = 'deleted' THEN
    RAISE EXCEPTION 'DELETED_USER_STATUS_IMMUTABLE' USING ERRCODE = 'PT409';
  END IF;

  IF v_old_status IS DISTINCT FROM p_status THEN
    UPDATE public.profiles SET status = p_status WHERE id = p_user_id;
    PERFORM public.write_audit_log(
      v_actor_id,
      CASE WHEN p_status = 'suspended' THEN 'user_suspended' ELSE 'user_restored' END,
      'profile',
      p_user_id::text,
      jsonb_build_object(
        'old_status', v_old_status,
        'new_status', p_status,
        'reason', nullif(btrim(p_reason), '')
      )
    );
  END IF;
  RETURN jsonb_build_object('user_id', p_user_id, 'old_status', v_old_status, 'new_status', p_status);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_user_status(uuid, public.user_status, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_status(uuid, public.user_status, text)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_staff_invitation(p_invitation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_invitation public.staff_invitations%ROWTYPE;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = 'PT401';
  END IF;
  IF NOT public.is_active_account() THEN
    RAISE EXCEPTION 'ACTOR_NOT_ACTIVE' USING ERRCODE = 'PT403';
  END IF;
  SELECT * INTO v_invitation FROM public.staff_invitations
  WHERE id = p_invitation_id FOR UPDATE;
  IF NOT FOUND OR v_invitation.invited_by <> v_actor_id
    OR v_invitation.accepted_at IS NOT NULL OR v_invitation.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'INVITATION_NOT_CANCELLABLE' USING ERRCODE = 'PT403';
  END IF;
  UPDATE public.staff_invitations SET revoked_at = now() WHERE id = p_invitation_id;
  PERFORM public.write_audit_log(
    v_actor_id, 'staff_invite_cancelled', 'staff_invitation', p_invitation_id::text,
    jsonb_build_object('clinic_id', v_invitation.clinic_id, 'staff_level', v_invitation.staff_level::text)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.cancel_staff_invitation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_staff_invitation(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_staff_invitation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_email text;
  v_email_confirmed_at timestamptz;
  v_invitation public.staff_invitations%ROWTYPE;
  v_clinic_ids uuid[] := ARRAY[]::uuid[];
  v_levels text[] := ARRAY[]::text[];
  v_existing_role public.app_role;
  v_existing_status public.user_status;
  v_existing_deleted_at timestamptz;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = 'PT401';
  END IF;
  SELECT lower(email), email_confirmed_at INTO v_email, v_email_confirmed_at
  FROM auth.users WHERE id = v_user_id FOR UPDATE;
  IF v_email IS NULL OR v_email_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'VERIFIED_INVITE_EMAIL_REQUIRED' USING ERRCODE = 'PT403';
  END IF;

  SELECT role, status, deleted_at
  INTO v_existing_role, v_existing_status, v_existing_deleted_at
  FROM public.profiles WHERE id = v_user_id;
  IF FOUND THEN
    IF v_existing_status <> 'active' OR v_existing_deleted_at IS NOT NULL THEN
      RAISE EXCEPTION 'ACTOR_NOT_ACTIVE' USING ERRCODE = 'PT403';
    END IF;
    IF v_existing_role = 'clinic_staff' AND EXISTS (
      SELECT 1 FROM public.staff_invitations
      WHERE accepted_user_id = v_user_id AND accepted_at IS NOT NULL
    ) THEN
      RETURN jsonb_build_object('user_id', v_user_id, 'status', 'accepted');
    END IF;
    RAISE EXCEPTION 'ACCOUNT_ALREADY_PROVISIONED' USING ERRCODE = 'PT409';
  END IF;

  PERFORM 1 FROM public.staff_invitations
  WHERE email = v_email AND accepted_at IS NULL AND revoked_at IS NULL
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVITATION_NOT_FOUND' USING ERRCODE = 'PT404';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, status)
  SELECT v_user_id, v_email, min(full_name), 'clinic_staff', 'active'
  FROM public.staff_invitations
  WHERE email = v_email AND accepted_at IS NULL AND revoked_at IS NULL;

  FOR v_invitation IN
    UPDATE public.staff_invitations
    SET accepted_at = now(), accepted_user_id = v_user_id
    WHERE email = v_email AND accepted_at IS NULL AND revoked_at IS NULL
    RETURNING *
  LOOP
    INSERT INTO public.clinic_staff (clinic_id, user_id, staff_level)
    VALUES (v_invitation.clinic_id, v_user_id, v_invitation.staff_level);
    v_clinic_ids := array_append(v_clinic_ids, v_invitation.clinic_id);
    v_levels := array_append(v_levels, v_invitation.staff_level::text);
    PERFORM public.write_audit_log(
      v_user_id,
      'staff_invite_accepted',
      'clinic_staff',
      v_invitation.clinic_id::text || ':' || v_user_id::text,
      jsonb_build_object('clinic_id', v_invitation.clinic_id, 'staff_level', v_invitation.staff_level::text)
    );
  END LOOP;

  RETURN jsonb_build_object(
    'user_id', v_user_id,
    'status', 'accepted',
    'clinic_ids', to_jsonb(v_clinic_ids),
    'staff_levels', to_jsonb(v_levels)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.accept_staff_invitation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_staff_invitation() TO authenticated;
