BEGIN;
SELECT plan(13);
INSERT INTO auth.users(id,email) VALUES ('11000000-0000-4000-8000-000000000001','audit@example.test'),('11000000-0000-4000-8000-000000000002','other@example.test');
INSERT INTO public.profiles(id,email) VALUES ('11000000-0000-4000-8000-000000000001','audit@example.test'),('11000000-0000-4000-8000-000000000002','other@example.test');
INSERT INTO public.feature_flags(key,enabled) VALUES ('d02_test_flag',false);
INSERT INTO public.app_config(key,value) VALUES ('d02_test_config','{"v":0}'::jsonb);
-- T159
SELECT public.write_audit_log('11000000-0000-4000-8000-000000000001','test_action','test_entity','known-id','{"x":1}'::jsonb);
SELECT ok(EXISTS(SELECT 1 FROM public.audit_logs WHERE actor_id='11000000-0000-4000-8000-000000000001' AND action='test_action' AND entity='test_entity' AND entity_id='known-id' AND diff='{"x":1}'::jsonb),'T159 exact audit row');
SELECT tests.authenticate_as('11000000-0000-4000-8000-000000000001','owner'); SET LOCAL ROLE authenticated;
SELECT throws_ok($$UPDATE public.audit_logs SET action='bad' WHERE entity_id='known-id'$$,'42501','permission denied for table audit_logs','T159 authenticated cannot update logs');
SELECT throws_ok($$DELETE FROM public.audit_logs WHERE entity_id='known-id'$$,'42501','permission denied for table audit_logs','T159 authenticated cannot delete logs');
RESET ROLE; SET LOCAL ROLE service_role;
SELECT throws_ok($$UPDATE public.audit_logs SET action='bad' WHERE entity_id='known-id'$$,'42501','permission denied for table audit_logs','T159 service_role cannot update logs');
SELECT throws_ok($$DELETE FROM public.audit_logs WHERE entity_id='known-id'$$,'42501','permission denied for table audit_logs','T159 service_role cannot delete logs');
RESET ROLE;
-- T160
SELECT tests.authenticate_as('11000000-0000-4000-8000-000000000001','super_admin'); SET LOCAL ROLE authenticated;
UPDATE public.feature_flags SET enabled=true WHERE key='d02_test_flag';
SELECT ok(EXISTS(SELECT 1 FROM public.audit_logs WHERE actor_id='11000000-0000-4000-8000-000000000001' AND action='update' AND entity='feature_flags' AND entity_id='d02_test_flag'),'T160 flag write audited');
UPDATE public.app_config SET value='{"v":1}'::jsonb WHERE key='d02_test_config';
SELECT ok(EXISTS(SELECT 1 FROM public.audit_logs WHERE actor_id='11000000-0000-4000-8000-000000000001' AND action='update' AND entity='app_config' AND entity_id='d02_test_config'),'T160 config write audited');
-- T161
RESET ROLE; SELECT tests.authenticate_as('11000000-0000-4000-8000-000000000002','owner'); SET LOCAL ROLE authenticated;
WITH x AS (UPDATE public.feature_flags SET enabled=false WHERE key='d02_test_flag' RETURNING key)
SELECT is((SELECT count(*) FROM x),0::bigint,'T161 owner cannot update flag');
SELECT throws_ok($$INSERT INTO public.feature_flags(key,enabled) VALUES ('owner_flag',true)$$,'42501',NULL,'T161 owner cannot insert flag');
WITH x AS (UPDATE public.app_config SET value='{"v":2}'::jsonb WHERE key='d02_test_config' RETURNING key)
SELECT is((SELECT count(*) FROM x),0::bigint,'T161 owner cannot update config');
SELECT throws_ok($$INSERT INTO public.app_config(key,value) VALUES ('owner_config','{"v":2}'::jsonb)$$,'42501',NULL,'T161 owner cannot insert config');
RESET ROLE; SELECT tests.authenticate_as('11000000-0000-4000-8000-000000000001','super_admin'); SET LOCAL ROLE authenticated;
WITH x AS (UPDATE public.feature_flags SET enabled=false WHERE key='d02_test_flag' RETURNING key)
SELECT is((SELECT count(*) FROM x),1::bigint,'T161 super_admin can update flag');
WITH x AS (UPDATE public.app_config SET value='{"v":2}'::jsonb WHERE key='d02_test_config' RETURNING key)
SELECT is((SELECT count(*) FROM x),1::bigint,'T161 super_admin can update config');
SELECT * FROM finish(); ROLLBACK;


