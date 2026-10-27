BEGIN;
SELECT plan(21);

-- Synthetic, transaction-scoped fixtures only. The fake legal text exists only
-- to prove that pet access follows the same current-consent gate as D02.
INSERT INTO public.app_config (key, value) VALUES (
  'legal_documents',
  '{"terms":{"version":"terms-test-v1","content_en":"Synthetic terms","content_ar":"شروط اختبارية"},"privacy":{"version":"privacy-test-v1","content_en":"Synthetic privacy","content_ar":"خصوصية اختبارية"}}'::jsonb
);

INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data) VALUES
  ('21700000-0000-4000-8000-000000000001', 'pet-a@example.test', '{"provider":"email"}', '{}'),
  ('21700000-0000-4000-8000-000000000002', 'pet-b@example.test', '{"provider":"email"}', '{}'),
  ('21700000-0000-4000-8000-000000000003', 'pet-suspended@example.test', '{"provider":"email"}', '{}'),
  ('21700000-0000-4000-8000-000000000004', 'pet-deleted@example.test', '{"provider":"email"}', '{}'),
  ('21700000-0000-4000-8000-000000000005', 'pet-incomplete@example.test', '{"provider":"email"}', '{}');

SELECT tests.authenticate_as('21700000-0000-4000-8000-000000000001', 'super_admin');
UPDATE public.profiles SET full_name = 'Pet Owner A', city_id = '00000000-0000-4000-8000-000000000001'
WHERE id = '21700000-0000-4000-8000-000000000001';
UPDATE public.profiles SET full_name = 'Pet Owner B', city_id = '00000000-0000-4000-8000-000000000001'
WHERE id = '21700000-0000-4000-8000-000000000002';
UPDATE public.profiles SET full_name = 'Suspended Owner', city_id = '00000000-0000-4000-8000-000000000001', status = 'suspended'
WHERE id = '21700000-0000-4000-8000-000000000003';
UPDATE public.profiles SET full_name = 'Deleted Owner', city_id = '00000000-0000-4000-8000-000000000001', status = 'deleted', deleted_at = now()
WHERE id = '21700000-0000-4000-8000-000000000004';

INSERT INTO public.consents (user_id, type, version) VALUES
  ('21700000-0000-4000-8000-000000000001', 'terms', 'terms-test-v1'),
  ('21700000-0000-4000-8000-000000000001', 'privacy', 'privacy-test-v1'),
  ('21700000-0000-4000-8000-000000000002', 'terms', 'terms-test-v1'),
  ('21700000-0000-4000-8000-000000000002', 'privacy', 'privacy-test-v1');

INSERT INTO public.pets (id, owner_id, name, species, breed_id, gender) VALUES
  ('22700000-0000-4000-8000-000000000001', '21700000-0000-4000-8000-000000000001', 'A active', 'cat', 'a0000000-0000-4000-8000-000000000014', 'female'),
  ('22700000-0000-4000-8000-000000000002', '21700000-0000-4000-8000-000000000002', 'B active', 'dog', 'a0000000-0000-4000-8000-000000000036', 'male'),
  ('22700000-0000-4000-8000-000000000003', '21700000-0000-4000-8000-000000000001', 'A deleted', 'cat', 'a0000000-0000-4000-8000-000000000014', 'unknown'),
  ('22700000-0000-4000-8000-000000000004', '21700000-0000-4000-8000-000000000003', 'Suspended pet', 'dog', NULL, 'unknown'),
  ('22700000-0000-4000-8000-000000000005', '21700000-0000-4000-8000-000000000004', 'Deleted pet', 'cat', NULL, 'unknown');
UPDATE public.pets SET deleted_at = now()
WHERE id = '22700000-0000-4000-8000-000000000003';

-- T217: stable bilingual launch catalog and audited, admin-only reference writes.
SELECT is((SELECT count(*) FROM public.breeds WHERE species IN ('cat', 'dog')), 44::bigint,
  'T217 seeds at least 40 stable cat/dog breeds');
SELECT is((SELECT count(*) FROM public.breeds WHERE species IN ('cat', 'dog') AND name_en <> '' AND name_ar <> ''), 44::bigint,
  'T217 every seeded breed has English and Arabic names');
SELECT is((SELECT count(DISTINCT species::text || ':' || slug) FROM public.breeds), 44::bigint,
  'T217 breed slugs are unique per species');
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);
SELECT is((SELECT count(*) FROM public.breeds WHERE species IN ('cat', 'dog')), 44::bigint,
  'active reference catalog is readable anonymously');
RESET ROLE;

SELECT tests.authenticate_as('21700000-0000-4000-8000-000000000001', 'owner');
SET LOCAL ROLE authenticated;
SELECT throws_ok($$INSERT INTO public.breeds (species, slug, name_en, name_ar) VALUES ('cat', 'owner-test', 'Owner test', 'اختبار')$$,
  '42501', NULL, 'T217 owners cannot write administrative breed data');
RESET ROLE;
SELECT tests.authenticate_as('21700000-0000-4000-8000-000000000001', 'super_admin');
SET LOCAL ROLE authenticated;
UPDATE public.breeds SET is_active = false WHERE id = 'a0000000-0000-4000-8000-000000000001';
SELECT ok(EXISTS (
  SELECT 1 FROM public.audit_logs
  WHERE actor_id = '21700000-0000-4000-8000-000000000001'
    AND action = 'update' AND entity = 'breeds'
    AND entity_id = 'a0000000-0000-4000-8000-000000000001'
), 'T217 admin reference-data writes create an audit record');
UPDATE public.breeds SET is_active = true WHERE id = 'a0000000-0000-4000-8000-000000000001';
RESET ROLE;

-- T218/T226: direct database API access stays owner-scoped and follows D02's
-- active-account/profile/current-consent guard. Deleted rows are not listable.
SELECT tests.authenticate_as('21700000-0000-4000-8000-000000000001', 'owner');
SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*) FROM public.pets), 1::bigint, 'T226 owner A reads only their active pet');
WITH updated AS (
  UPDATE public.pets SET name = 'A updated' WHERE id = '22700000-0000-4000-8000-000000000001' RETURNING id
)
SELECT is((SELECT count(*) FROM updated), 1::bigint, 'T226 owner can update their own pet');
WITH updated AS (
  UPDATE public.pets SET name = 'B stolen' WHERE id = '22700000-0000-4000-8000-000000000002' RETURNING id
)
SELECT is((SELECT count(*) FROM updated), 0::bigint, 'T226 owner A cannot update owner B pet');
INSERT INTO public.pets (name, species, breed_id, gender)
VALUES ('A inserted', 'cat', 'a0000000-0000-4000-8000-000000000001', 'unknown');
SELECT is((SELECT count(*) FROM public.pets WHERE name = 'A inserted' AND owner_id = '21700000-0000-4000-8000-000000000001'),
  1::bigint, 'T218 owner is assigned from the authenticated identity');
SELECT throws_ok($$INSERT INTO public.pets (owner_id, name, species, gender) VALUES ('21700000-0000-4000-8000-000000000002', 'Spoofed', 'cat', 'unknown')$$,
  '42501', NULL, 'T218 caller cannot supply or spoof owner_id');
SELECT throws_ok($$INSERT INTO public.pets (name, species, breed_id, gender) VALUES ('Bad breed', 'cat', 'a0000000-0000-4000-8000-000000000099', 'unknown')$$,
  '23503', NULL, 'T218 invalid breed foreign key is rejected');
SELECT throws_ok($$INSERT INTO public.pets (name, species, breed_id, gender) VALUES ('Wrong species', 'dog', 'a0000000-0000-4000-8000-000000000014', 'unknown')$$,
  '23503', NULL, 'T218 breed species mismatch is rejected');
SELECT is(public.can_access_owner_pet_data(), true, 'completed owner with current bilingual consent passes pet access gate');
SELECT is((SELECT count(*) FROM public.pets WHERE id = '22700000-0000-4000-8000-000000000003'),
  0::bigint, 'T218 deleted pet is hidden from active listing');
RESET ROLE;

SELECT tests.authenticate_as('21700000-0000-4000-8000-000000000003', 'owner');
SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*) FROM public.pets), 0::bigint, 'T218 suspended account cannot access pet data');
RESET ROLE;
SELECT tests.authenticate_as('21700000-0000-4000-8000-000000000004', 'owner');
SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*) FROM public.pets), 0::bigint, 'T218 deleted account cannot access pet data');
RESET ROLE;
SELECT tests.authenticate_as('21700000-0000-4000-8000-000000000005', 'owner');
SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*) FROM public.pets), 0::bigint, 'T218 incomplete profile without legal consent cannot access pet data');
RESET ROLE;

SELECT tests.authenticate_as('21700000-0000-4000-8000-000000000001', 'owner');
SET LOCAL ROLE authenticated;
SELECT is(public.delete_pet('22700000-0000-4000-8000-000000000001')->>'status', 'deleted',
  'T221 owner can soft-delete their own pet');
SELECT is(public.delete_pet('22700000-0000-4000-8000-000000000001')->>'status', 'already_deleted',
  'T221 repeated deletion is safe and idempotent');
SELECT throws_ok($$SELECT public.delete_pet('22700000-0000-4000-8000-000000000002')$$,
  'P0002', 'PET_NOT_FOUND', 'T221 owner cannot delete another owner pet');

SELECT * FROM finish();
ROLLBACK;
