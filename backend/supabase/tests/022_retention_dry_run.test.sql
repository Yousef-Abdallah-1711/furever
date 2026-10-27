BEGIN;
SELECT plan(9);

INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data) VALUES
  ('22800000-0000-4000-8000-000000000001', 'retention-owner@example.test', '{"provider":"email"}', '{}'),
  ('22800000-0000-4000-8000-000000000002', 'retention-deleted@example.test', '{"provider":"email"}', '{}');
SELECT tests.authenticate_as('22800000-0000-4000-8000-000000000001', 'super_admin');
UPDATE public.profiles
SET full_name = 'Synthetic Retention Owner', city_id = '00000000-0000-4000-8000-000000000001'
WHERE id = '22800000-0000-4000-8000-000000000001';
UPDATE public.profiles
SET full_name = 'Synthetic Retention Candidate', status = 'deleted',
    deleted_at = now() - interval '30 days'
WHERE id = '22800000-0000-4000-8000-000000000002';
INSERT INTO public.pets (id, owner_id, name, species, gender, deleted_at) VALUES
  ('22800000-0000-4000-8000-000000000011', '22800000-0000-4000-8000-000000000001', 'At threshold', 'cat', 'unknown', now() - interval '30 days'),
  ('22800000-0000-4000-8000-000000000012', '22800000-0000-4000-8000-000000000001', 'Before threshold', 'cat', 'unknown', now() - interval '29 days');

SELECT throws_ok($$SELECT public.purge_soft_deleted(true)$$, '42501', 'SERVICE_ROLE_REQUIRED',
  'authenticated callers cannot run retention dry runs');
SET LOCAL ROLE service_role;
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true);
SELECT throws_ok($$SELECT public.purge_soft_deleted(false)$$, '42501', 'RETENTION_APPROVAL_REQUIRED',
  'destructive execution is rejected until explicit retention approval');
SELECT is((public.purge_soft_deleted(true)->'eligible'->>'pets')::bigint, 1::bigint,
  'dry run identifies the row at the 30-day engineering threshold');
SELECT is((public.purge_soft_deleted(true)->'eligible'->>'profiles')::bigint, 1::bigint,
  'dry run identifies the profile at the 30-day engineering threshold');
SELECT is((SELECT count(*) FROM public.pets WHERE id IN (
  '22800000-0000-4000-8000-000000000011', '22800000-0000-4000-8000-000000000012')),
  2::bigint, 'dry run leaves both synthetic pet rows unchanged');
SELECT is((SELECT count(*) FROM public.profiles WHERE id = '22800000-0000-4000-8000-000000000002'
  AND deleted_at <= now() - interval '30 days'), 1::bigint,
  'dry run leaves the eligible synthetic profile unchanged');
INSERT INTO public.storage_cleanup_queue (bucket, path) VALUES ('pet-photos', 'owner/path.jpg')
ON CONFLICT (bucket, path) DO NOTHING;
INSERT INTO public.storage_cleanup_queue (bucket, path) VALUES ('pet-photos', 'owner/path.jpg')
ON CONFLICT (bucket, path) DO NOTHING;
SELECT is((SELECT count(*) FROM public.storage_cleanup_queue
  WHERE bucket = 'pet-photos' AND path = 'owner/path.jpg'), 1::bigint,
  'queue uniqueness makes repeated enqueue idempotent');
RESET ROLE;
SELECT ok(EXISTS (
  SELECT 1 FROM public.audit_logs
  WHERE action = 'retention_dry_run' AND entity = 'retention_job' AND entity_id = 'purge_soft_deleted'
    AND diff->'eligible'->>'pets' = '1'
), 'dry run writes an audit row with its eligible counts');
SET LOCAL ROLE authenticated;
SELECT throws_ok($$INSERT INTO public.storage_cleanup_queue (bucket, path) VALUES ('pet-photos', 'owner/path.jpg')$$,
  '42501', NULL, 'service-only storage cleanup queue rejects API roles');
SELECT * FROM finish();
ROLLBACK;
