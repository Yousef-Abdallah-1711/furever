CREATE TABLE public.staff_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id),
  staff_level public.staff_level NOT NULL,
  invited_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  accepted_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at timestamptz,
  CONSTRAINT staff_invitations_email_lowercase CHECK (email = lower(email)),
  CONSTRAINT staff_invitations_email_format CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  CONSTRAINT staff_invitations_terminal_state CHECK (accepted_at IS NULL OR revoked_at IS NULL)
);

CREATE UNIQUE INDEX staff_invitations_one_pending_email
ON public.staff_invitations (email)
WHERE accepted_at IS NULL AND revoked_at IS NULL;

ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.staff_invitations FROM PUBLIC, anon, authenticated, service_role;
CREATE POLICY staff_invitations_select_related
ON public.staff_invitations FOR SELECT TO authenticated
USING (
  invited_by = (SELECT auth.uid())
  OR lower(email) = lower(coalesce((SELECT auth.jwt() ->> 'email'), ''))
  OR (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);
GRANT SELECT ON public.staff_invitations TO authenticated;

-- A staff profile can be provisioned by the invite acceptance RPC only when a matching
-- server-created invitation is still pending. Direct client profile creation remains owner-only.
CREATE OR REPLACE FUNCTION public.protect_profile_role_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
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

CREATE FUNCTION public.create_staff_invitation(
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
  v_actor_email text;
  v_email text := lower(btrim(p_email));
  v_invitation_id uuid;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = 'PT401';
  END IF;
  SELECT profile.role, profile.email INTO v_profile_role, v_actor_email
  FROM public.profiles AS profile WHERE profile.id = v_actor_id;
  IF NOT FOUND OR v_profile_role::text <> v_claim_role THEN
    RAISE EXCEPTION 'STALE_OR_INVALID_ROLE' USING ERRCODE = 'PT403';
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
    v_actor_id,
    'staff_invited',
    'staff_invitation',
    v_invitation_id::text,
    jsonb_build_object('clinic_id', p_clinic_id, 'staff_level', p_staff_level::text)
  );
  RETURN v_invitation_id;
END;
$$;

CREATE FUNCTION public.cancel_staff_invitation(p_invitation_id uuid)
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

CREATE FUNCTION public.accept_staff_invitation()
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
  SELECT lower(email), email_confirmed_at INTO v_email, v_email_confirmed_at
  FROM auth.users WHERE id = v_user_id;
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

REVOKE ALL ON FUNCTION public.create_staff_invitation(text, text, uuid, public.staff_level) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_staff_invitation(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.accept_staff_invitation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_staff_invitation(text, text, uuid, public.staff_level) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_staff_invitation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_staff_invitation() TO authenticated;
