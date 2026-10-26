BEGIN;
SELECT plan(10);

INSERT INTO auth.users (id, email) VALUES
  ('17000000-0000-4000-8000-000000000001', 'assignment-admin@example.test'),
  ('17000000-0000-4000-8000-000000000002', 'assignment-manager@example.test'),
  ('17000000-0000-4000-8000-000000000003', 'assignment-vet@example.test'),
  ('17000000-0000-4000-8000-000000000004', 'assignment-receptionist@example.test'),
  ('17000000-0000-4000-8000-000000000005', 'assignment-other-manager@example.test'),
  ('17000000-0000-4000-8000-000000000006', 'assignment-clinic-manager@example.test');

SELECT tests.authenticate_as('17000000-0000-4000-8000-000000000001', 'super_admin');
INSERT INTO public.profiles (id, email, role) VALUES
  ('17000000-0000-4000-8000-000000000001', 'assignment-admin@example.test', 'super_admin'),
  ('17000000-0000-4000-8000-000000000002', 'assignment-manager@example.test', 'clinic_staff'),
  ('17000000-0000-4000-8000-000000000003', 'assignment-vet@example.test', 'clinic_staff'),
  ('17000000-0000-4000-8000-000000000004', 'assignment-receptionist@example.test', 'clinic_staff'),
  ('17000000-0000-4000-8000-000000000005', 'assignment-other-manager@example.test', 'clinic_staff'),
  ('17000000-0000-4000-8000-000000000006', 'assignment-clinic-manager@example.test', 'clinic_staff');
INSERT INTO public.clinics (id, name_en, name_ar, status) VALUES
  ('47000000-0000-4000-8000-000000000001', 'Assignment Clinic One', 'Clinic One Arabic', 'active'),
  ('47000000-0000-4000-8000-000000000002', 'Assignment Clinic Two', 'Clinic Two Arabic', 'active');
INSERT INTO public.clinic_staff (clinic_id, user_id, staff_level) VALUES
  ('47000000-0000-4000-8000-000000000001', '17000000-0000-4000-8000-000000000002', 'manager'),
  ('47000000-0000-4000-8000-000000000001', '17000000-0000-4000-8000-000000000003', 'vet'),
  ('47000000-0000-4000-8000-000000000001', '17000000-0000-4000-8000-000000000004', 'receptionist'),
  ('47000000-0000-4000-8000-000000000001', '17000000-0000-4000-8000-000000000006', 'manager'),
  ('47000000-0000-4000-8000-000000000002', '17000000-0000-4000-8000-000000000005', 'manager');

SELECT tests.authenticate_as('17000000-0000-4000-8000-000000000002', 'clinic_staff');
SET LOCAL ROLE authenticated;
SELECT is(
  public.set_clinic_staff_level('47000000-0000-4000-8000-000000000001', '17000000-0000-4000-8000-000000000003', 'receptionist') ->> 'staff_level',
  'receptionist', 'clinic manager can change a same-clinic vet to receptionist'
);
RESET ROLE;
SELECT tests.authenticate_as('17000000-0000-4000-8000-000000000001', 'super_admin');
SET LOCAL ROLE authenticated;
SELECT is((SELECT staff_level::text FROM public.clinic_staff WHERE user_id = '17000000-0000-4000-8000-000000000003'),
  'receptionist', 'audited RPC updates the assignment');
RESET ROLE;
SELECT tests.authenticate_as('17000000-0000-4000-8000-000000000002', 'clinic_staff');
SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$SELECT public.set_clinic_staff_level('47000000-0000-4000-8000-000000000001', '17000000-0000-4000-8000-000000000003', 'manager')$$,
  'PT403', 'STAFF_CHANGE_FORBIDDEN', 'clinic manager cannot grant manager level'
);
SELECT throws_ok(
  $$SELECT public.set_clinic_staff_level('47000000-0000-4000-8000-000000000002', '17000000-0000-4000-8000-000000000005', 'vet')$$,
  'PT403', 'STAFF_CHANGE_FORBIDDEN', 'clinic manager cannot change another clinic assignment'
);
SELECT throws_ok(
  $$SELECT public.set_clinic_staff_level('47000000-0000-4000-8000-000000000001', '17000000-0000-4000-8000-000000000002', 'vet')$$,
  'PT403', 'SELF_STAFF_CHANGE_FORBIDDEN', 'clinic manager cannot change their own assignment'
);
SELECT throws_ok(
  $$SELECT public.remove_clinic_staff('47000000-0000-4000-8000-000000000001', '17000000-0000-4000-8000-000000000006')$$,
  'PT403', 'CLINIC_MANAGER_CHANGE_FORBIDDEN', 'clinic manager cannot remove another manager'
);

RESET ROLE;
SELECT tests.authenticate_as('17000000-0000-4000-8000-000000000001', 'super_admin');
SET LOCAL ROLE authenticated;
SELECT is(
  public.set_clinic_staff_level('47000000-0000-4000-8000-000000000001', '17000000-0000-4000-8000-000000000004', 'manager') ->> 'staff_level',
  'manager', 'platform super admin can grant manager level'
);
SELECT is(
  public.remove_clinic_staff('47000000-0000-4000-8000-000000000001', '17000000-0000-4000-8000-000000000003') ->> 'removed',
  'true', 'platform super admin can remove a staff assignment'
);
SELECT is((SELECT count(*) FROM public.clinic_staff WHERE user_id = '17000000-0000-4000-8000-000000000003'),
  0::bigint, 'removed assignment is no longer active');
SELECT is(
  (SELECT count(*) FROM public.audit_logs WHERE action IN ('staff_level_changed', 'staff_removed') AND entity = 'clinic_staff'),
  3::bigint, 'staff level changes and removals are audited'
);

SELECT * FROM finish();
ROLLBACK;
