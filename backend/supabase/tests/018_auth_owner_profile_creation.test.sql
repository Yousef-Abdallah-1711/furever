BEGIN;
SELECT plan(5);

INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data) VALUES
  ('18000000-0000-4000-8000-000000000001', 'auth-email-owner@example.test', '{"provider":"email"}', '{"full_name":"Email Owner"}'),
  ('18000000-0000-4000-8000-000000000002', 'auth-google-owner@example.test', '{"provider":"google"}', '{"full_name":"Google Owner"}'),
  ('18000000-0000-4000-8000-000000000006', 'auth-apple-owner@example.test', '{"provider":"apple"}', '{"full_name":"Apple Owner"}'),
  ('18000000-0000-4000-8000-000000000003', 'auth-owner-inviter@example.test', '{}', '{}');

SELECT is(
  (SELECT role::text || ':' || status::text || ':' || full_name FROM public.profiles WHERE id = '18000000-0000-4000-8000-000000000001'),
  'owner:active:Email Owner',
  'email Auth user receives a default owner profile before sign-in completes'
);
SELECT is(
  (SELECT role::text || ':' || full_name FROM public.profiles WHERE id = '18000000-0000-4000-8000-000000000002'),
  'owner:Google Owner',
  'Google Auth user receives a default owner profile'
);
SELECT is(
  (SELECT role::text || ':' || full_name FROM public.profiles WHERE id = '18000000-0000-4000-8000-000000000006'),
  'owner:Apple Owner',
  'Apple Auth user receives a default owner profile'
);

INSERT INTO public.profiles (id, email, role, status)
VALUES ('18000000-0000-4000-8000-000000000003', 'auth-owner-inviter@example.test', 'owner', 'active');
INSERT INTO public.clinics (id, name_en, name_ar, status)
VALUES ('48000000-0000-4000-8000-000000000001', 'Profile Trigger Clinic', 'Profile Trigger Clinic Arabic', 'active');
INSERT INTO public.staff_invitations (email, full_name, clinic_id, staff_level, invited_by)
VALUES ('auth-invited-vet@example.test', 'Invited Vet', '48000000-0000-4000-8000-000000000001', 'vet', '18000000-0000-4000-8000-000000000003');
INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data)
VALUES ('18000000-0000-4000-8000-000000000004', 'auth-invited-vet@example.test', '{"provider":"email"}', '{"staff_invitation_id":"client-metadata-is-not-authority"}');

SELECT is(
  (SELECT count(*)::integer FROM public.profiles WHERE id = '18000000-0000-4000-8000-000000000004'),
  0,
  'pending clinic invitation remains unprovisioned for accept_staff_invitation()'
);

INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data)
VALUES ('18000000-0000-4000-8000-000000000005', 'auth-unsupported-provider@example.test', '{"provider":"unsupported"}', '{}');
SELECT is(
  (SELECT count(*)::integer FROM public.profiles WHERE id = '18000000-0000-4000-8000-000000000005'),
  0,
  'unsupported provider does not receive an owner profile implicitly'
);

ROLLBACK;
