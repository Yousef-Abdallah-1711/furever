CREATE TYPE public.clinic_status AS ENUM ('pending', 'active', 'suspended');

CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_ar text NOT NULL,
  city_id uuid REFERENCES public.cities(id),
  status public.clinic_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clinics_city_id_status_idx ON public.clinics (city_id, status);

CREATE TRIGGER clinics_set_updated_at
BEFORE UPDATE ON public.clinics
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY clinics_select_public_active
ON public.clinics
FOR SELECT
TO anon, authenticated
USING (status = 'active');

CREATE POLICY clinics_select_admin_all
ON public.clinics
FOR SELECT
TO authenticated
USING ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));

CREATE POLICY clinics_insert_admin
ON public.clinics
FOR INSERT
TO authenticated
WITH CHECK ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));

CREATE POLICY clinics_update_admin
ON public.clinics
FOR UPDATE
TO authenticated
USING ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'))
WITH CHECK ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));

CREATE POLICY clinics_delete_admin
ON public.clinics
FOR DELETE
TO authenticated
USING ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));

GRANT SELECT ON public.clinics TO anon, authenticated;
GRANT INSERT, DELETE ON public.clinics TO authenticated;
GRANT UPDATE (name_en, name_ar, city_id) ON public.clinics TO authenticated;

-- Clinic-staff visibility and clinic-manager writes are added after clinic_staff exists.
