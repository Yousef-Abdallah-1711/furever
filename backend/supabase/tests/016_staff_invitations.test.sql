BEGIN;
SELECT plan(21);

INSERT INTO auth.users (id, email, email_confirmed_at) VALUES
  ('16000000-0000-4000-8000-000000000001', 'invite-admin@example.test', now()),
  ('16000000-0000-4000-8000-000000000002', 'invite-manager@example.test', now()),
  ('16000000-0000-4000-8000-000000000003', 'invite-vet@example.test', NULL),
  ('16000000-0000-4000-8000-000000000004', 'invite-other@example.test', NULL),
  ('16000000-0000-4000-8000-000000000005', 'invite-receptionist@example.test', NULL),
  ('16000000-0000-4000-8000-000000000006', 'invite-suspended-manager@example.test', now());

SELECT tests.authenticate_as('16000000-0000-4000-8000-000000000001', 'super_admin');
INSERT INTO public.profiles (id, email, role, status) VALUES
  ('16000000-0000-4000-8000-000000000001', 'invite-admin@example.test', 'admin', 'active'),
  ('16000000-0000-4000-8000-000000000002', 'invite-manager@example.test', 'clinic_staff', 'active'),
  ('16000000-0000-4000-8000-000000000006', 'invite-suspended-manager@example.test', 'clinic_staff', 'suspended');
INSERT INTO public.clinics (id, name_en, name_ar, status) VALUES
  ('46000000-0000-4000-8000-000000000001', 'Invite Clinic One', 'Clinic One Arabic', 'active'),
  ('46000000-0000-4000-8000-000000000002', 'Invite Clinic Two', 'Clinic Two Arabic', 'active');
INSERT INTO public.clinic_staff (clinic_id, user_id, staff_level) VALUES
  ('46000000-0000-4000-8000-000000000001', '16000000-0000-4000-8000-000000000002', 'manager'),
  ('46000000-0000-4000-8000-000000000001', '16000000-0000-4000-8000-000000000006', 'manager');

SELECT tests.authenticate_as('16000000-0000-4000-8000-000000000002', 'clinic_staff');
SET LOCAL ROLE authenticated;
SELECT ok(
  public.create_staff_invitation(' INVITE-VET@EXAMPLE.TEST ', 'Invite Vet', '46000000-0000-4000-8000-000000000001', 'vet') IS NOT NULL,
  'T140 clinic manager can invite a vet in their clinic'
);
SELECT is(
  (SELECT staff_level::text FROM public.staff_invitations WHERE email = 'invite-vet@example.test'),
  'vet', 'invitation stores its exact approved staff level'
);
SELECT throws_ok(
  $$INSERT INTO public.staff_invitations (email, clinic_id, staff_level, invited_by)
    VALUES ('direct-write@example.test', '46000000-0000-4000-8000-000000000001', 'vet', '16000000-0000-4000-8000-000000000002')$$,
  '42501', 'permission denied for table staff_invitations', 'clients cannot create invitation ledger rows directly'
);
SELECT throws_ok(
  $$UPDATE public.staff_invitations SET staff_level = 'manager' WHERE email = 'invite-vet@example.test'$$,
  '42501', 'permission denied for table staff_invitations', 'clients cannot escalate a stored invitation level'
);
SELECT throws_ok(
  $$SELECT public.create_staff_invitation('outside@example.test', NULL, '46000000-0000-4000-8000-000000000002', 'vet')$$,
  'PT403', 'CLINIC_MANAGER_INVITE_FORBIDDEN', 'clinic manager cannot invite into another clinic'
);
SELECT throws_ok(
  $$SELECT public.create_staff_invitation('manager-target@example.test', NULL, '46000000-0000-4000-8000-000000000001', 'manager')$$,
  'PT403', 'CLINIC_MANAGER_INVITE_FORBIDDEN', 'clinic manager cannot grant manager level'
);
SELECT throws_ok(
  $$SELECT public.create_staff_invitation('invite-manager@example.test', NULL, '46000000-0000-4000-8000-000000000001', 'vet')$$,
  'PT403', 'SELF_INVITATION_FORBIDDEN', 'clinic manager cannot invite their own email'
);
RESET ROLE;
SELECT tests.authenticate_as('16000000-0000-4000-8000-000000000006', 'clinic_staff');
SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$SELECT public.create_staff_invitation('suspended-target@example.test', NULL, '46000000-0000-4000-8000-000000000001', 'vet')$$,
  'PT403', 'ACTOR_NOT_ACTIVE', 'suspended clinic manager cannot create an invitation'
);
RESET ROLE;
SELECT tests.authenticate_as('16000000-0000-4000-8000-000000000001', 'admin');
SET LOCAL ROLE authenticated;
SELECT ok(
  public.create_staff_invitation('invite-receptionist@example.test', 'Invite Receptionist', '46000000-0000-4000-8000-000000000002', 'manager') IS NOT NULL,
  'platform admin can grant manager level at a clinic'
);
SELECT is(
  (SELECT staff_level::text FROM public.staff_invitations WHERE email = 'invite-receptionist@example.test'),
  'manager', 'platform manager grant is stored unchanged for acceptance'
);
SELECT is(
  (SELECT count(*) FROM public.audit_logs WHERE action = 'staff_invited' AND entity = 'staff_invitation'),
  2::bigint, 'staff invitations write auditable records'
);

RESET ROLE;
UPDATE auth.users SET email_confirmed_at = now()
WHERE id = '16000000-0000-4000-8000-000000000003';
SELECT tests.authenticate_as('16000000-0000-4000-8000-000000000003', 'owner');
SET LOCAL ROLE authenticated;
SELECT is(public.accept_staff_invitation() ->> 'status', 'accepted', 'invitee can accept a verified email invitation');
SELECT is((SELECT role::text FROM public.profiles WHERE id = '16000000-0000-4000-8000-000000000003'), 'clinic_staff', 'acceptance provisions a clinic-staff profile');
SELECT is((SELECT staff_level::text FROM public.clinic_staff WHERE user_id = '16000000-0000-4000-8000-000000000003'), 'vet', 'acceptance uses the stored invitation level');
RESET ROLE;
SELECT tests.authenticate_as('16000000-0000-4000-8000-000000000001', 'admin');
SET LOCAL ROLE authenticated;
SELECT is(
  (SELECT count(*) FROM public.audit_logs WHERE action = 'staff_invite_accepted' AND entity_id LIKE '%16000000-0000-4000-8000-000000000003'),
  1::bigint, 'acceptance writes an audit row'
);
RESET ROLE;
SELECT tests.authenticate_as('16000000-0000-4000-8000-000000000003', 'clinic_staff');
SET LOCAL ROLE authenticated;
SELECT is(public.accept_staff_invitation() ->> 'status', 'accepted', 'acceptance retry is idempotent');
SELECT throws_ok(
  $$UPDATE public.profiles SET role = 'admin' WHERE id = '16000000-0000-4000-8000-000000000003'$$,
  'P0001', 'Only an admin can change profile role or status', 'invited user cannot escalate profile role after acceptance'
);

RESET ROLE;
SELECT tests.authenticate_as('16000000-0000-4000-8000-000000000002', 'clinic_staff');
SET LOCAL ROLE authenticated;
SELECT ok(public.create_staff_invitation('cancel-target@example.test', NULL, '46000000-0000-4000-8000-000000000001', 'receptionist') IS NOT NULL,
  'manager can create an invitation that they own');
SELECT throws_ok(
  $$SELECT public.cancel_staff_invitation((SELECT id FROM public.staff_invitations WHERE email = 'invite-receptionist@example.test'))$$,
  'PT403', 'INVITATION_NOT_CANCELLABLE', 'manager cannot cancel another inviter invitation'
);
SELECT lives_ok(
  $$SELECT public.cancel_staff_invitation((SELECT id FROM public.staff_invitations WHERE email = 'cancel-target@example.test'))$$,
  'inviter can cancel their pending invitation'
);
SELECT is((SELECT count(*) FROM public.staff_invitations WHERE email = 'cancel-target@example.test' AND revoked_at IS NOT NULL),
  1::bigint, 'cancellation marks the invitation revoked');

SELECT * FROM finish();
ROLLBACK;
