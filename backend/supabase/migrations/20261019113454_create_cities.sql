CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_ar text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER cities_set_updated_at
BEFORE UPDATE ON public.cities
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY cities_select_all
ON public.cities
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY cities_insert_admin
ON public.cities
FOR INSERT
TO authenticated
WITH CHECK ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));

CREATE POLICY cities_update_admin
ON public.cities
FOR UPDATE
TO authenticated
USING ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'))
WITH CHECK ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));

CREATE POLICY cities_delete_admin
ON public.cities
FOR DELETE
TO authenticated
USING ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));

GRANT SELECT ON public.cities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cities TO authenticated;

-- Launch-city rows are intentionally left empty until the product decision is made.
