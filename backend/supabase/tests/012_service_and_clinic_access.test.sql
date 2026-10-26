BEGIN;
SELECT plan(5);
INSERT INTO auth.users(id,email) VALUES ('12000000-0000-4000-8000-000000000001','admin@example.test');
SELECT tests.authenticate_as('12000000-0000-4000-8000-000000000001','admin');
INSERT INTO public.profiles(id,email,role,status) VALUES ('12000000-0000-4000-8000-000000000001','admin@example.test','admin','active');
INSERT INTO public.otp_attempts(identifier) VALUES ('otp@example.test');
INSERT INTO public.clinics(id,name_en,name_ar,status) VALUES ('40000000-0000-4000-8000-000000000001','Test clinic','Test clinic','pending');
-- T162: exercise all operations as authenticated.
SELECT tests.authenticate_as('12000000-0000-4000-8000-000000000001','admin'); SET LOCAL ROLE authenticated;
SELECT throws_ok($$SELECT * FROM public.otp_attempts$$,'42501','permission denied for table otp_attempts','T162 no authenticated SELECT');
SELECT throws_ok($$INSERT INTO public.otp_attempts(identifier) VALUES ('other@example.test')$$,'42501','permission denied for table otp_attempts','T162 no authenticated INSERT');
SELECT throws_ok($$UPDATE public.otp_attempts SET wrong_count=1 WHERE identifier='otp@example.test'$$,'42501','permission denied for table otp_attempts','T162 no authenticated UPDATE');
SELECT throws_ok($$DELETE FROM public.otp_attempts WHERE identifier='otp@example.test'$$,'42501','permission denied for table otp_attempts','T162 no authenticated DELETE');
-- T163
SELECT throws_ok($$UPDATE public.clinics SET status='active' WHERE id='40000000-0000-4000-8000-000000000001'$$,'42501','permission denied for table clinics','T163 admin cannot update clinics.status');
SELECT * FROM finish(); ROLLBACK;

