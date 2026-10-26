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
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = 'PT401';
  END IF;
  -- Serialize acceptance retries for the same Auth user before checking the profile or
  -- consuming the pending invitation. A second request then observes the committed result.
  SELECT lower(email), email_confirmed_at INTO v_email, v_email_confirmed_at
  FROM auth.users WHERE id = v_user_id FOR UPDATE;
  IF v_email IS NULL OR v_email_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'VERIFIED_INVITE_EMAIL_REQUIRED' USING ERRCODE = 'PT403';
  END IF;

  SELECT role INTO v_existing_role FROM public.profiles WHERE id = v_user_id;
  IF FOUND THEN
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
