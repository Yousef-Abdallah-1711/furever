CREATE FUNCTION public.create_owner_profile_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email text;
  v_full_name text;
  v_provider text;
BEGIN
  IF NEW.email IS NULL OR btrim(NEW.email) = '' THEN
    RETURN NEW;
  END IF;

  v_provider := coalesce(NEW.raw_app_meta_data ->> 'provider', '');
  IF v_provider NOT IN ('email', 'google', 'apple') THEN
    RETURN NEW;
  END IF;

  v_email := lower(btrim(NEW.email));

  -- Auth invite users are provisioned by accept_staff_invitation(), which assigns
  -- their clinic role from the server-owned invitation row. Never create an owner
  -- profile for an address with a pending staff invitation.
  IF EXISTS (
    SELECT 1
    FROM public.staff_invitations AS invitation
    WHERE invitation.email = v_email
      AND invitation.accepted_at IS NULL
      AND invitation.revoked_at IS NULL
  ) THEN
    RETURN NEW;
  END IF;

  v_full_name := nullif(btrim(NEW.raw_user_meta_data ->> 'full_name'), '');

  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (NEW.id, v_email, v_full_name, 'owner', 'active')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.create_owner_profile_from_auth_user() FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER on_auth_user_created_create_owner_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_owner_profile_from_auth_user();
