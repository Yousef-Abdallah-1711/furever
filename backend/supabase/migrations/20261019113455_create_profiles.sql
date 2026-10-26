CREATE TYPE public.app_role AS ENUM ('owner', 'clinic_staff', 'admin', 'super_admin');
CREATE TYPE public.user_status AS ENUM ('active', 'suspended', 'deleted');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text NOT NULL,
  phone text,
  avatar_path text,
  city_id uuid REFERENCES public.cities(id),
  role public.app_role NOT NULL DEFAULT 'owner',
  status public.user_status NOT NULL DEFAULT 'active',
  locale text NOT NULL DEFAULT 'en',
  theme text NOT NULL DEFAULT 'light',
  notif_prefs jsonb NOT NULL DEFAULT '{"vaccination_reminders": true, "booking_updates": true, "offers": true}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_email_lowercase CHECK (email = lower(email)),
  CONSTRAINT profiles_email_format CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  CONSTRAINT profiles_phone_e164 CHECK (phone IS NULL OR phone ~ '^\+[1-9][0-9]{7,14}$'),
  CONSTRAINT profiles_email_unique UNIQUE (email)
);

CREATE INDEX profiles_city_id_idx ON public.profiles (city_id);

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE FUNCTION public.protect_profile_role_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF coalesce((select auth.jwt() ->> 'user_role'), '') NOT IN ('admin', 'super_admin') THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.role IS DISTINCT FROM 'owner'::public.app_role
         OR NEW.status IS DISTINCT FROM 'active'::public.user_status THEN
        RAISE EXCEPTION 'Only an admin can set profile role or status';
      END IF;
    ELSIF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Only an admin can change profile role or status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_protect_role_status
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role_status();

REVOKE ALL ON FUNCTION public.protect_profile_role_status() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_self_or_admin
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = (select auth.uid())
  OR (select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);

CREATE POLICY profiles_insert_self
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  id = (select auth.uid())
  AND role = 'owner'
  AND status = 'active'
);

CREATE POLICY profiles_update_self
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Clinic-staff visibility is added after clinic_staff and appointments exist.
