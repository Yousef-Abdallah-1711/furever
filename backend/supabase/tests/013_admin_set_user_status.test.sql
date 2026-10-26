BEGIN;
SELECT plan(11);
INSERT INTO auth.users(id,email) VALUES
  ('13000000-0000-4000-8000-000000000001','status-admin@example.test'),
  ('13000000-0000-4000-8000-000000000002','status-owner@example.test');
INSERT INTO public.profiles(id,email) VALUES
  ('13000000-0000-4000-8000-000000000001','status-admin@example.test'),
  ('13000000-0000-4000-8000-000000000002','status-owner@example.test');

SELECT ok(NOT has_function_privilege('anon','public.admin_set_user_status(uuid,public.user_status,text)','EXECUTE'), 'RPC is not executable by anon');
SELECT ok(NOT EXISTS (
  SELECT 1 FROM pg_proc AS p, aclexplode(coalesce(p.proacl, acldefault('f',p.proowner))) AS acl
  WHERE p.oid='public.admin_set_user_status(uuid,public.user_status,text)'::regprocedure
    AND acl.grantee=0 AND acl.privilege_type='EXECUTE'
), 'RPC is not executable by PUBLIC');

SELECT tests.authenticate_as('13000000-0000-4000-8000-000000000001','owner'); SET LOCAL ROLE authenticated;
SELECT throws_ok($$SELECT public.admin_set_user_status('13000000-0000-4000-8000-000000000002','suspended','test reason')$$,'PT403','ADMIN_REQUIRED','owner cannot call the status RPC');
RESET ROLE;

SELECT tests.authenticate_as('13000000-0000-4000-8000-000000000001','admin'); SET LOCAL ROLE authenticated;
SELECT throws_ok($$SELECT public.admin_set_user_status('13000000-0000-4000-8000-000000000002','suspended','   ')$$,'PT400','SUSPENSION_REASON_REQUIRED','suspension requires a reason');
SELECT throws_ok($$SELECT public.admin_set_user_status('13000000-0000-4000-8000-000000000001','active',NULL)$$,'PT403','SELF_STATUS_CHANGE_FORBIDDEN','admin cannot change own status');
SELECT is(public.admin_set_user_status('13000000-0000-4000-8000-000000000002','suspended','  repeated abuse  ')->>'old_status','active','RPC returns prior status');
SELECT is((SELECT status::text FROM public.profiles WHERE id='13000000-0000-4000-8000-000000000002'),'suspended','RPC updates target status');
SELECT ok(EXISTS (
  SELECT 1 FROM public.audit_logs
  WHERE actor_id='13000000-0000-4000-8000-000000000001'
    AND action='user_suspended' AND entity='profile'
    AND entity_id='13000000-0000-4000-8000-000000000002'
    AND diff=jsonb_build_object('old_status','active','new_status','suspended','reason','repeated abuse')
), 'status update writes expected audit diff through helper');
SELECT is(public.admin_set_user_status('13000000-0000-4000-8000-000000000002','active',NULL)->>'new_status','active','RPC restores target status');
SELECT is((SELECT status::text FROM public.profiles WHERE id='13000000-0000-4000-8000-000000000002'),'active','restored profile status is active');
SELECT is((SELECT count(*) FROM public.audit_logs WHERE entity='profile' AND entity_id='13000000-0000-4000-8000-000000000002'),2::bigint,'both transitions are audited');
SELECT * FROM finish();
ROLLBACK;
