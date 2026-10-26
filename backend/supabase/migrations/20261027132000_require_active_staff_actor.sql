CREATE OR REPLACE FUNCTION public.create_staff_invitation(
  p_email text,
  p_full_name text,
  p_clinic_id uuid,
  p_staff_level public.staff_level
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_claim_role text := coalesce((SELECT auth.jwt() ->> 'user_role'), '');
  v_profile_role public.app_role;
  v_profile_status public.user_status;
  v_actor_email text;
  v_email text := lower(btrim(p_email));
  v_invitation_id uuid;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = 'PT401';
  END IF;
  SELECT profile.role, profile.status, profile.email
  INTO v_profile_role, v_profile_status, v_actor_email
  FROM public.profiles AS profile WHERE profile.id = v_actor_id;
  IF NOT FOUND OR v_profile_role::text <> v_claim_role THEN
    RAISE EXCEPTION 'STALE_OR_INVALID_ROLE' USING ERRCODE = 'PT403';
  END IF;
  IF v_profile_status <> 'active' THEN
    RAISE EXCEPTION 'ACTOR_NOT_ACTIVE' USING ERRCODE = 'PT403';
  END IF;
  IF p_clinic_id IS NULL OR p_staff_level IS NULL
     OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
     OR length(v_email) > 254
     OR (p_full_name IS NOT NULL AND length(btrim(p_full_name)) > 120) THEN
    RAISE EXCEPTION 'INVALID_INVITATION' USING ERRCODE = 'PT400';
  END IF;
  IF v_email = lower(v_actor_email) THEN
    RAISE EXCEPTION 'SELF_INVITATION_FORBIDDEN' USING ERRCODE = 'PT403';
  END IF;

  IF v_profile_role IN ('admin', 'super_admin') THEN
    NULL;
  ELSIF v_profile_role = 'clinic_staff' THEN
    IF p_staff_level = 'manager' OR NOT EXISTS (
      SELECT 1 FROM public.clinic_staff AS membership
      WHERE membership.user_id = v_actor_id
        AND membership.clinic_id = p_clinic_id
        AND membership.staff_level = 'manager'
    ) THEN
      RAISE EXCEPTION 'CLINIC_MANAGER_INVITE_FORBIDDEN' USING ERRCODE = 'PT403';
    END IF;
  ELSE
    RAISE EXCEPTION 'INVITE_FORBIDDEN' USING ERRCODE = 'PT403';
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = v_email) THEN
    RAISE EXCEPTION 'ACCOUNT_ALREADY_EXISTS' USING ERRCODE = 'PT409';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.staff_invitations
    WHERE email = v_email AND accepted_at IS NULL AND revoked_at IS NULL
  ) THEN
    RAISE EXCEPTION 'INVITATION_ALREADY_PENDING' USING ERRCODE = 'PT409';
  END IF;

  INSERT INTO public.staff_invitations (email, full_name, clinic_id, staff_level, invited_by)
  VALUES (v_email, nullif(btrim(p_full_name), ''), p_clinic_id, p_staff_level, v_actor_id)
  RETURNING id INTO v_invitation_id;
  PERFORM public.write_audit_log(
    v_actor_id, 'staff_invited', 'staff_invitation', v_invitation_id::text,
    jsonb_build_object('clinic_id', p_clinic_id, 'staff_level', p_staff_level::text)
  );
  RETURN v_invitation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_clinic_staff_level(
  p_clinic_id uuid,
  p_user_id uuid,
  p_staff_level public.staff_level
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_claim_role text := coalesce((SELECT auth.jwt() ->> 'user_role'), '');
  v_actor_role public.app_role;
  v_actor_status public.user_status;
  v_old_level public.staff_level;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = 'PT401';
  END IF;
  SELECT role, status INTO v_actor_role, v_actor_status FROM public.profiles WHERE id = v_actor_id;
  IF NOT FOUND OR v_actor_role::text <> v_claim_role THEN
    RAISE EXCEPTION 'STALE_OR_INVALID_ROLE' USING ERRCODE = 'PT403';
  END IF;
  IF v_actor_status <> 'active' THEN
    RAISE EXCEPTION 'ACTOR_NOT_ACTIVE' USING ERRCODE = 'PT403';
  END IF;
  IF p_clinic_id IS NULL OR p_user_id IS NULL OR p_staff_level IS NULL THEN
    RAISE EXCEPTION 'INVALID_STAFF_CHANGE' USING ERRCODE = 'PT400';
  END IF;
  IF p_user_id = v_actor_id THEN
    RAISE EXCEPTION 'SELF_STAFF_CHANGE_FORBIDDEN' USING ERRCODE = 'PT403';
  END IF;
  IF v_actor_role IN ('admin', 'super_admin') THEN
    NULL;
  ELSIF v_actor_role = 'clinic_staff' AND p_staff_level <> 'manager' AND EXISTS (
    SELECT 1 FROM public.clinic_staff AS actor_membership
    WHERE actor_membership.clinic_id = p_clinic_id
      AND actor_membership.user_id = v_actor_id
      AND actor_membership.staff_level = 'manager'
  ) THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'STAFF_CHANGE_FORBIDDEN' USING ERRCODE = 'PT403';
  END IF;
  SELECT staff_level INTO v_old_level FROM public.clinic_staff
  WHERE clinic_id = p_clinic_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'STAFF_ASSIGNMENT_NOT_FOUND' USING ERRCODE = 'PT404';
  END IF;
  IF v_actor_role = 'clinic_staff' AND v_old_level = 'manager' THEN
    RAISE EXCEPTION 'CLINIC_MANAGER_CHANGE_FORBIDDEN' USING ERRCODE = 'PT403';
  END IF;
  IF v_old_level IS DISTINCT FROM p_staff_level THEN
    UPDATE public.clinic_staff SET staff_level = p_staff_level
    WHERE clinic_id = p_clinic_id AND user_id = p_user_id;
    PERFORM public.write_audit_log(
      v_actor_id, 'staff_level_changed', 'clinic_staff', p_clinic_id::text || ':' || p_user_id::text,
      jsonb_build_object('clinic_id', p_clinic_id, 'old_staff_level', v_old_level::text, 'new_staff_level', p_staff_level::text)
    );
  END IF;
  RETURN jsonb_build_object('clinic_id', p_clinic_id, 'user_id', p_user_id, 'staff_level', p_staff_level);
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_clinic_staff(p_clinic_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_claim_role text := coalesce((SELECT auth.jwt() ->> 'user_role'), '');
  v_actor_role public.app_role;
  v_actor_status public.user_status;
  v_old_level public.staff_level;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = 'PT401';
  END IF;
  SELECT role, status INTO v_actor_role, v_actor_status FROM public.profiles WHERE id = v_actor_id;
  IF NOT FOUND OR v_actor_role::text <> v_claim_role THEN
    RAISE EXCEPTION 'STALE_OR_INVALID_ROLE' USING ERRCODE = 'PT403';
  END IF;
  IF v_actor_status <> 'active' THEN
    RAISE EXCEPTION 'ACTOR_NOT_ACTIVE' USING ERRCODE = 'PT403';
  END IF;
  IF p_clinic_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_STAFF_REMOVAL' USING ERRCODE = 'PT400';
  END IF;
  IF p_user_id = v_actor_id THEN
    RAISE EXCEPTION 'SELF_STAFF_CHANGE_FORBIDDEN' USING ERRCODE = 'PT403';
  END IF;
  IF v_actor_role IN ('admin', 'super_admin') THEN
    NULL;
  ELSIF v_actor_role = 'clinic_staff' AND EXISTS (
    SELECT 1 FROM public.clinic_staff AS actor_membership
    WHERE actor_membership.clinic_id = p_clinic_id
      AND actor_membership.user_id = v_actor_id
      AND actor_membership.staff_level = 'manager'
  ) THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'STAFF_CHANGE_FORBIDDEN' USING ERRCODE = 'PT403';
  END IF;
  SELECT staff_level INTO v_old_level FROM public.clinic_staff
  WHERE clinic_id = p_clinic_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'STAFF_ASSIGNMENT_NOT_FOUND' USING ERRCODE = 'PT404';
  END IF;
  IF v_actor_role = 'clinic_staff' AND v_old_level = 'manager' THEN
    RAISE EXCEPTION 'CLINIC_MANAGER_CHANGE_FORBIDDEN' USING ERRCODE = 'PT403';
  END IF;
  DELETE FROM public.clinic_staff WHERE clinic_id = p_clinic_id AND user_id = p_user_id;
  PERFORM public.write_audit_log(
    v_actor_id, 'staff_removed', 'clinic_staff', p_clinic_id::text || ':' || p_user_id::text,
    jsonb_build_object('clinic_id', p_clinic_id, 'old_staff_level', v_old_level::text)
  );
  RETURN jsonb_build_object('clinic_id', p_clinic_id, 'user_id', p_user_id, 'removed', true);
END;
$$;
