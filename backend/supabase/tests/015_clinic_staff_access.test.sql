BEGIN;
SELECT plan(9);

INSERT INTO auth.users (id, email) VALUES
  ('15000000-0000-4000-8000-000000000001', 'staff-owner@example.test'),
  ('15000000-0000-4000-8000-000000000002', 'staff-admin@example.test'),
  ('15000000-0000-4000-8000-000000000003', 'staff-target@example.test');
INSERT INTO public.profiles (id, email) VALUES
  ('15000000-0000-4000-8000-000000000001', 'staff-owner@example.test'),
  ('15000000-0000-4000-8000-000000000002', 'staff-admin@example.test'),
  ('15000000-0000-4000-8000-000000000003', 'staff-target@example.test');
INSERT INTO public.clinics (id, name_en, name_ar, status) VALUES
  ('45000000-0000-4000-8000-000000000001', 'Clinic One', 'العيادة الأولى', 'pending'),
  ('45000000-0000-4000-8000-000000000002', 'Clinic Two', 'العيادة الثانية', 'pending');
INSERT INTO public.clinic_staff (clinic_id, user_id, staff_level) VALUES
  ('45000000-0000-4000-8000-000000000001', '15000000-0000-4000-8000-000000000001', 'vet'),
  ('45000000-0000-4000-8000-000000000002', '15000000-0000-4000-8000-000000000003', 'receptionist');

SELECT tests.authenticate_as('15000000-0000-4000-8000-000000000001', 'owner');
SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*) FROM public.clinic_staff WHERE user_id = '15000000-0000-4000-8000-000000000001'), 1::bigint, 'clinic_staff owner can read own assignments');
SELECT is((SELECT count(*) FROM public.clinic_staff), 1::bigint, 'clinic_staff owner cannot read another user assignment');
SELECT throws_ok(
  $$INSERT INTO public.clinic_staff (clinic_id, user_id, staff_level)
    VALUES ('45000000-0000-4000-8000-000000000002', '15000000-0000-4000-8000-000000000001', 'manager')$$,
  '42501', NULL, 'clinic_staff owner cannot insert assignments'
);
SELECT throws_ok(
  $$UPDATE public.clinic_staff SET staff_level = 'manager'
    WHERE clinic_id = '45000000-0000-4000-8000-000000000001'
      AND user_id = '15000000-0000-4000-8000-000000000001'$$,
  '42501', 'permission denied for table clinic_staff', 'clinic_staff owner cannot update assignments'
);
SELECT throws_ok(
  $$DELETE FROM public.clinic_staff
    WHERE clinic_id = '45000000-0000-4000-8000-000000000001'
      AND user_id = '15000000-0000-4000-8000-000000000001'$$,
  '42501', 'permission denied for table clinic_staff', 'clinic_staff owner cannot delete assignments'
);

RESET ROLE;
SELECT tests.authenticate_as('15000000-0000-4000-8000-000000000002', 'admin');
SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*) FROM public.clinic_staff), 2::bigint, 'clinic_staff admin can read all assignments');
SELECT throws_ok(
  $$INSERT INTO public.clinic_staff (clinic_id, user_id, staff_level)
    VALUES ('45000000-0000-4000-8000-000000000001', '15000000-0000-4000-8000-000000000003', 'vet')$$,
  '42501', 'permission denied for table clinic_staff', 'clinic_staff admin cannot bypass audited assignment RPC'
);
SELECT throws_ok(
  $$UPDATE public.clinic_staff SET staff_level = 'manager'
    WHERE clinic_id = '45000000-0000-4000-8000-000000000001'
      AND user_id = '15000000-0000-4000-8000-000000000003'$$,
  '42501', 'permission denied for table clinic_staff', 'clinic_staff admin cannot change levels without audit'
);
SELECT throws_ok(
  $$DELETE FROM public.clinic_staff
    WHERE clinic_id = '45000000-0000-4000-8000-000000000002'
      AND user_id = '15000000-0000-4000-8000-000000000003'$$,
  '42501', 'permission denied for table clinic_staff', 'clinic_staff admin cannot remove staff without audit'
);

SELECT * FROM finish();
ROLLBACK;
