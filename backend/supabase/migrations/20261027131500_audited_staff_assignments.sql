REVOKE INSERT, UPDATE, DELETE ON public.clinic_staff FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION public.set_clinic_staff_level(
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
  v_old_level public.staff_level;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = 'PT401';
  END IF;
  SELECT role INTO v_actor_role FROM public.profiles WHERE id = v_actor_id;
  IF NOT FOUND OR v_actor_role::text <> v_claim_role THEN
    RAISE EXCEPTION 'STALE_OR_INVALID_ROLE' USING ERRCODE = 'PT403';
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
      v_actor_id,
      'staff_level_changed',
      'clinic_staff',
      p_clinic_id::text || ':' || p_user_id::text,
      jsonb_build_object('clinic_id', p_clinic_id, 'old_staff_level', v_old_level::text, 'new_staff_level', p_staff_level::text)
    );
  END IF;
  RETURN jsonb_build_object('clinic_id', p_clinic_id, 'user_id', p_user_id, 'staff_level', p_staff_level);
END;
$$;

CREATE FUNCTION public.remove_clinic_staff(p_clinic_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_claim_role text := coalesce((SELECT auth.jwt() ->> 'user_role'), '');
  v_actor_role public.app_role;
  v_old_level public.staff_level;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = 'PT401';
  END IF;
  SELECT role INTO v_actor_role FROM public.profiles WHERE id = v_actor_id;
  IF NOT FOUND OR v_actor_role::text <> v_claim_role THEN
    RAISE EXCEPTION 'STALE_OR_INVALID_ROLE' USING ERRCODE = 'PT403';
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
    v_actor_id,
    'staff_removed',
    'clinic_staff',
    p_clinic_id::text || ':' || p_user_id::text,
    jsonb_build_object('clinic_id', p_clinic_id, 'old_staff_level', v_old_level::text)
  );
  RETURN jsonb_build_object('clinic_id', p_clinic_id, 'user_id', p_user_id, 'removed', true);
END;
$$;

REVOKE ALL ON FUNCTION public.set_clinic_staff_level(uuid, uuid, public.staff_level) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.remove_clinic_staff(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_clinic_staff_level(uuid, uuid, public.staff_level) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_clinic_staff(uuid, uuid) TO authenticated;
