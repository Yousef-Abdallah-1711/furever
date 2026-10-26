CREATE TYPE public.staff_level AS ENUM ('manager', 'vet', 'receptionist');
CREATE TABLE public.clinic_staff (
  clinic_id uuid NOT NULL REFERENCES public.clinics(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  staff_level public.staff_level NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (clinic_id, user_id)
);
CREATE INDEX clinic_staff_user_id_idx ON public.clinic_staff (user_id);
CREATE TRIGGER clinic_staff_set_updated_at BEFORE UPDATE ON public.clinic_staff FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY clinic_staff_select_self_or_admin ON public.clinic_staff FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR (select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));
CREATE POLICY clinic_staff_insert_admin ON public.clinic_staff FOR INSERT TO authenticated WITH CHECK ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));
CREATE POLICY clinic_staff_update_admin ON public.clinic_staff FOR UPDATE TO authenticated USING ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')) WITH CHECK ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));
CREATE POLICY clinic_staff_delete_admin ON public.clinic_staff FOR DELETE TO authenticated USING ((select auth.jwt() ->> 'user_role') IN ('admin', 'super_admin'));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_staff TO authenticated;
-- Profiles clinic-staff visibility still also depends on appointments (D06), and clinics staff visibility/manager writes remain deferred.
