BEGIN;
SELECT plan(11);

SELECT is(
  to_regprocedure('public.complete_owner_profile(text,uuid,text,text,text)') IS NULL,
  true,
  'legacy RPC signature that could record consent without acceptance is removed'
);
SELECT is(
  has_function_privilege('authenticated', 'public.complete_owner_profile(text,uuid,text,boolean,text,text)', 'EXECUTE'),
  true,
  'authenticated owners can execute the current RPC'
);
SELECT is(
  has_function_privilege('anon', 'public.complete_owner_profile(text,uuid,text,boolean,text,text)', 'EXECUTE'),
  false,
  'anonymous callers cannot execute the profile completion RPC'
);

INSERT INTO public.app_config (key, value) VALUES
  ('legal_documents', '{"terms":{"version":"terms-test-v1","content_en":"Test terms EN","content_ar":"Test terms AR"},"privacy":{"version":"privacy-test-v1","content_en":"Test privacy EN","content_ar":"Test privacy AR"}}'::jsonb);
INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data)
VALUES ('19000000-0000-4000-8000-000000000001', 'complete-profile@example.test', '{"provider":"email"}', '{}');

SELECT tests.authenticate_as('19000000-0000-4000-8000-000000000001', 'owner');
SET LOCAL ROLE authenticated;

SELECT is(
  public.complete_owner_profile(
    'Test Owner', '00000000-0000-4000-8000-000000000001', '+201012345678',
    true,
    'terms-test-v1', 'privacy-test-v1'
  ) ->> 'status',
  'completed',
  'owner profile completion succeeds with current bilingual legal documents'
);
SELECT is(
  (SELECT full_name || ':' || city_id::text || ':' || phone FROM public.profiles WHERE id = auth.uid()),
  'Test Owner:00000000-0000-4000-8000-000000000001:+201012345678',
  'profile fields are saved in the same completion transaction'
);
SELECT is(
  (SELECT count(*)::integer FROM public.consents WHERE user_id = auth.uid()),
  2,
  'terms and privacy versions are recorded together'
);
SELECT is(
  public.complete_owner_profile(
    'Test Owner', '00000000-0000-4000-8000-000000000001', NULL,
    true,
    'terms-test-v1', 'privacy-test-v1'
  ) ->> 'status',
  'completed',
  'completion retry is idempotent for the same legal versions'
);
SELECT is(
  (SELECT count(*)::integer FROM public.consents WHERE user_id = auth.uid()),
  2,
  'idempotent retry does not duplicate consent rows'
);
SELECT throws_ok(
  $$SELECT public.complete_owner_profile('Test Owner', '00000000-0000-4000-8000-000000000001', NULL, true, 'old-terms', 'privacy-test-v1')$$,
  'P0001', 'LEGAL_VERSION_MISMATCH', 'stale Terms version is refused'
);
SELECT throws_ok(
  $$SELECT public.complete_owner_profile('Test Owner', '00000000-0000-4000-8000-000000000001', '+441234567890', true, 'terms-test-v1', 'privacy-test-v1')$$,
  '22023', 'INVALID_PROFILE_PHONE', 'non-Egyptian phone is refused'
);
SELECT throws_ok(
  $$SELECT public.complete_owner_profile('Test Owner', '00000000-0000-4000-8000-000000000001', NULL, false, 'terms-test-v1', 'privacy-test-v1')$$,
  '22023', 'LEGAL_ACCEPTANCE_REQUIRED', 'profile completion requires explicit legal acceptance'
);

SELECT * FROM finish();
ROLLBACK;
