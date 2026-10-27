-- Retention remains disabled until Egyptian legal review and final owner
-- approval. This function supports only a non-destructive dry run.
CREATE OR REPLACE FUNCTION public.purge_soft_deleted(p_dry_run boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cutoff timestamptz := now() - interval '30 days';
  v_pets bigint;
  v_profiles bigint;
  v_otp_attempts bigint;
  v_result jsonb;
BEGIN
  IF coalesce((SELECT auth.jwt() ->> 'role'), '') <> 'service_role' THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'SERVICE_ROLE_REQUIRED';
  END IF;
  IF p_dry_run IS DISTINCT FROM true THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'RETENTION_APPROVAL_REQUIRED';
  END IF;

  SELECT count(*) INTO v_pets FROM public.pets WHERE deleted_at <= v_cutoff;
  SELECT count(*) INTO v_profiles FROM public.profiles WHERE deleted_at <= v_cutoff;
  SELECT count(*) INTO v_otp_attempts
  FROM public.otp_attempts WHERE updated_at < now() - interval '7 days';

  v_result := jsonb_build_object(
    'dry_run', true,
    'cutoff', v_cutoff,
    'eligible', jsonb_build_object(
      'pets', v_pets,
      'profiles', v_profiles,
      'otp_attempts', v_otp_attempts
    )
  );
  PERFORM public.write_audit_log(
    NULL,
    'retention_dry_run',
    'retention_job',
    'purge_soft_deleted',
    v_result
  );
  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_soft_deleted(boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_soft_deleted(boolean) TO service_role;
