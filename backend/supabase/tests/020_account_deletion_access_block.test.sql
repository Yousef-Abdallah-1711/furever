BEGIN;
SELECT plan(22);

INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data)
VALUES (
  '20000000-0000-4000-8000-000000000001',
  'deletion-access@example.test',
  '{"provider":"email"}',
  '{}'
);
INSERT INTO public.consents (user_id, type, version)
VALUES ('20000000-0000-4000-8000-000000000001', 'terms', 'synthetic-v1');
INSERT INTO public.push_tokens (user_id, token, platform, locale)
VALUES ('20000000-0000-4000-8000-000000000001', 'synthetic-push-token', 'web', 'en');

SELECT ok(
  NOT has_function_privilege('anon', 'public.request_account_deletion(uuid)', 'EXECUTE'),
  'anonymous callers cannot request deletion'
);
SELECT ok(
  NOT has_function_privilege('authenticated', 'public.request_account_deletion(uuid)', 'EXECUTE'),
  'authenticated callers cannot invoke the privileged deletion RPC'
);
SELECT ok(
  NOT has_table_privilege('authenticated', 'public.account_deletion_requests', 'SELECT'),
  'authenticated callers cannot read deletion queue records'
);

SELECT tests.authenticate_as('20000000-0000-4000-8000-000000000001', 'owner');
SET LOCAL ROLE authenticated;
SELECT ok(public.is_active_account(), 'active authenticated user passes the account gate');
SELECT throws_ok(
  $$SELECT public.request_account_deletion('20000000-0000-4000-8000-000000000001')$$,
  '42501', 'permission denied for function request_account_deletion',
  'authenticated user cannot invoke the service-only transition'
);
RESET ROLE;

SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true);
SET LOCAL ROLE service_role;
SELECT results_eq(
  $$SELECT public.request_account_deletion('20000000-0000-4000-8000-000000000001')->>'state'$$,
  $$VALUES ('access_blocked'::text)$$,
  'service role records the request and blocks access atomically'
);
SELECT is(
  public.request_account_deletion('20000000-0000-4000-8000-000000000001')->>'request_id',
  (SELECT id::text FROM public.account_deletion_requests WHERE user_id = '20000000-0000-4000-8000-000000000001'),
  'repeated request returns the same durable request id'
);
SELECT is(
  (SELECT count(*)::integer FROM public.account_deletion_requests WHERE user_id = '20000000-0000-4000-8000-000000000001'),
  1,
  'repeated request does not create duplicate queue rows'
);
RESET ROLE;
SELECT ok(
  EXISTS (
    SELECT 1 FROM public.audit_logs
    WHERE actor_id = '20000000-0000-4000-8000-000000000001'
      AND action = 'account_deletion_requested'
      AND entity = 'profile'
  ),
  'request transition writes an audit record'
);
RESET ROLE;

SELECT tests.authenticate_as('20000000-0000-4000-8000-000000000001', 'owner');
SET LOCAL ROLE authenticated;
SELECT ok(NOT public.is_active_account(), 'same previously authenticated JWT fails the active-account gate');
SELECT is(
  (SELECT count(*)::integer FROM public.profiles WHERE id = auth.uid()),
  0,
  'deleted account cannot read its profile with its existing access token'
);
SELECT is(
  (SELECT count(*)::integer FROM public.consents WHERE user_id = auth.uid()),
  0,
  'deleted account cannot read consent rows with its existing access token'
);
SELECT is(
  (SELECT count(*)::integer FROM public.push_tokens WHERE user_id = auth.uid()),
  0,
  'deleted account cannot read push-token rows with its existing access token'
);
SELECT throws_ok(
  $$INSERT INTO public.push_tokens (user_id, token, platform, locale) VALUES (auth.uid(), 'blocked-token', 'web', 'en')$$,
  '42501', 'new row violates row-level security policy for table "push_tokens"',
  'deleted account cannot write using its existing access token'
);
RESET ROLE;

SELECT throws_ok(
  $$SELECT public.custom_access_token_hook('{"user_id":"20000000-0000-4000-8000-000000000001","claims":{}}'::jsonb)$$,
  '28000', 'ACCOUNT_UNAVAILABLE',
  'Auth hook refuses to issue or refresh a token for a deletion-requested account'
);
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true);
SET LOCAL ROLE service_role;
SELECT is(
  public.cancel_account_deletion('20000000-0000-4000-8000-000000000001')->>'state',
  'cancelled',
  'trusted service can cancel before cleanup starts'
);
RESET ROLE;
SELECT is(
  (SELECT state FROM public.account_deletion_requests WHERE user_id = '20000000-0000-4000-8000-000000000001'),
  'cancelled',
  'cancellation is durably recorded'
);
SELECT is(
  (SELECT status::text FROM public.profiles WHERE id = '20000000-0000-4000-8000-000000000001'),
  'active',
  'cancellation restores the soft-blocked account before cleanup begins'
);
SELECT tests.authenticate_as('20000000-0000-4000-8000-000000000001', 'owner');
SET LOCAL ROLE authenticated;
SELECT ok(public.is_active_account(), 'restored account passes the active-account gate');
SELECT is(
  (SELECT count(*)::integer FROM public.profiles WHERE id = auth.uid()),
  1,
  'restored account can read its profile again'
);
RESET ROLE;
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true);
SET LOCAL ROLE service_role;
SELECT results_eq(
  $$SELECT public.request_account_deletion('20000000-0000-4000-8000-000000000001')->>'state'$$,
  $$VALUES ('access_blocked'::text)$$,
  'a new deletion request can reuse the cancelled request row'
);
SELECT is(
  (SELECT count(*)::integer FROM public.account_deletion_requests WHERE user_id = '20000000-0000-4000-8000-000000000001'),
  1,
  'new request after cancellation does not duplicate the durable row'
);
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
