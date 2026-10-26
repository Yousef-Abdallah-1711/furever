CREATE SCHEMA IF NOT EXISTS tests;
CREATE OR REPLACE FUNCTION tests.authenticate_as(p_user_id uuid, p_user_role text)
RETURNS void LANGUAGE plpgsql AS $function$
BEGIN
  PERFORM set_config(
    'request.jwt.claims',
    jsonb_build_object('sub', p_user_id::text, 'role', 'authenticated', 'user_role', p_user_role)::text,
    true
  );
END;
$function$;
REVOKE ALL ON FUNCTION tests.authenticate_as(uuid, text) FROM PUBLIC;

BEGIN;
SELECT plan(9);
INSERT INTO auth.users(id,email) VALUES ('10000000-0000-4000-8000-000000000001','a@example.test'),('10000000-0000-4000-8000-000000000002','b@example.test'),('10000000-0000-4000-8000-000000000003','c@example.test');
SELECT tests.authenticate_as('10000000-0000-4000-8000-000000000001','super_admin');
INSERT INTO public.profiles(id,email,role,status) VALUES ('10000000-0000-4000-8000-000000000001','a@example.test','owner','active'),('10000000-0000-4000-8000-000000000002','b@example.test','owner','active'),('10000000-0000-4000-8000-000000000003','c@example.test','owner','suspended');
INSERT INTO public.consents(id,user_id,type,version) VALUES ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','terms','1'),('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','terms','1');
INSERT INTO public.push_tokens(id,user_id,token,platform,locale) VALUES ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','token-a','web','en'),('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','token-b','web','en');
SELECT tests.authenticate_as('10000000-0000-4000-8000-000000000001','owner'); SET LOCAL ROLE authenticated;
SELECT throws_ok($$UPDATE public.profiles SET role='admin' WHERE id='10000000-0000-4000-8000-000000000001'$$,'P0001','Only an admin can change profile role or status','T156 role protection');
SELECT throws_ok($$UPDATE public.profiles SET status='suspended' WHERE id='10000000-0000-4000-8000-000000000001'$$,'P0001','Only an admin can change profile role or status','T156 status protection');
RESET ROLE; SELECT tests.authenticate_as('10000000-0000-4000-8000-000000000003','owner'); SET LOCAL ROLE authenticated;
SELECT is((SELECT status::text FROM public.profiles WHERE id='10000000-0000-4000-8000-000000000003'),'suspended','T157 proxy: suspended self-profile remains readable; no API resource exists');
RESET ROLE; SELECT tests.authenticate_as('10000000-0000-4000-8000-000000000001','owner'); SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*) FROM public.profiles),1::bigint,'T158 profiles owner-only');
SELECT is((SELECT count(*) FROM public.profiles WHERE id='10000000-0000-4000-8000-000000000001'),1::bigint,'T158 profile own row readable');
SELECT is((SELECT count(*) FROM public.consents),1::bigint,'T158 consents owner-only');
SELECT is((SELECT count(*) FROM public.consents WHERE user_id='10000000-0000-4000-8000-000000000001'),1::bigint,'T158 consent own row readable');
SELECT is((SELECT count(*) FROM public.push_tokens),1::bigint,'T158 tokens owner-only');
SELECT is((SELECT count(*) FROM public.push_tokens WHERE user_id='10000000-0000-4000-8000-000000000001'),1::bigint,'T158 token own row readable');
SELECT * FROM finish(); ROLLBACK;


