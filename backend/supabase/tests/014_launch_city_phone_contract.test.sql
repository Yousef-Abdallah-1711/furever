BEGIN;
SELECT plan(4);

SELECT results_eq(
  $$SELECT id::text || ':' || name_en || ':' || name_ar
    FROM public.cities
    ORDER BY id$$,
  $$VALUES
    ('00000000-0000-4000-8000-000000000001:Cairo:القاهرة'::text),
    ('00000000-0000-4000-8000-000000000002:Giza:الجيزة'::text),
    ('00000000-0000-4000-8000-000000000003:Alexandria:الإسكندرية'::text)$$,
  'launch cities have stable IDs, bilingual names, and deterministic order'
);
SELECT is((SELECT count(*) FROM public.cities), 3::bigint, 'seed is duplicate-free');

INSERT INTO auth.users (id, email)
VALUES ('14000000-0000-4000-8000-000000000001', 'phone@example.test');
INSERT INTO public.profiles (id, email, phone)
VALUES ('14000000-0000-4000-8000-000000000001', 'phone@example.test', '+201012345678');
INSERT INTO auth.users (id, email)
VALUES ('14000000-0000-4000-8000-000000000002', 'invalid-phone@example.test');
SELECT is(
  (SELECT phone FROM public.profiles WHERE id = '14000000-0000-4000-8000-000000000001'),
  '+201012345678',
  'canonical Egyptian E.164 profile phone is accepted'
);
SELECT throws_ok(
  $$INSERT INTO public.profiles (id, email, phone)
    VALUES ('14000000-0000-4000-8000-000000000002', 'invalid-phone@example.test', '+441234567890')$$,
  '23514',
  NULL,
  'non-Egyptian profile phone is rejected by the database'
);

SELECT * FROM finish();
ROLLBACK;
