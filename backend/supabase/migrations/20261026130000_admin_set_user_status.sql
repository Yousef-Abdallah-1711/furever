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

REVOKE ALL ON FUNCTION public.admin_set_user_status(uuid, public.user_status, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_status(uuid, public.user_status, text) TO authenticated;
