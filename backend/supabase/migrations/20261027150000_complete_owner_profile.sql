CREATE UNIQUE INDEX consents_user_type_version_unique
ON public.consents (user_id, type, version);

CREATE FUNCTION public.complete_owner_profile(
  p_full_name text,
  p_city_id uuid,
  p_phone text,
  p_accept_legal_documents boolean,
  p_terms_version text,
  p_privacy_version text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_documents jsonb;
  v_terms_version text;
  v_privacy_version text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'AUTHENTICATION_REQUIRED';
  END IF;

  IF p_full_name IS NULL OR length(btrim(p_full_name)) NOT BETWEEN 2 AND 120 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_PROFILE_NAME';
  END IF;
  IF p_city_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.cities WHERE id = p_city_id AND is_active
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_PROFILE_CITY';
  END IF;
  IF p_phone IS NOT NULL AND p_phone !~ '^\+201[0125][0-9]{8}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_PROFILE_PHONE';
  END IF;
  IF p_accept_legal_documents IS DISTINCT FROM true THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'LEGAL_ACCEPTANCE_REQUIRED';
  END IF;

  SELECT value INTO v_documents
  FROM public.app_config
  WHERE key = 'legal_documents'
  FOR SHARE;

  IF coalesce(jsonb_typeof(v_documents -> 'terms') = 'object', false) = false
    OR coalesce(jsonb_typeof(v_documents -> 'privacy') = 'object', false) = false THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LEGAL_DOCUMENTS_UNAVAILABLE';
  END IF;

  v_terms_version := v_documents #>> '{terms,version}';
  v_privacy_version := v_documents #>> '{privacy,version}';
  IF nullif(btrim(v_terms_version), '') IS NULL
    OR nullif(btrim(v_privacy_version), '') IS NULL
    OR nullif(btrim(v_documents #>> '{terms,content_en}'), '') IS NULL
    OR nullif(btrim(v_documents #>> '{terms,content_ar}'), '') IS NULL
    OR nullif(btrim(v_documents #>> '{privacy,content_en}'), '') IS NULL
    OR nullif(btrim(v_documents #>> '{privacy,content_ar}'), '') IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LEGAL_DOCUMENTS_UNAVAILABLE';
  END IF;

  IF p_terms_version IS DISTINCT FROM v_terms_version
    OR p_privacy_version IS DISTINCT FROM v_privacy_version THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LEGAL_VERSION_MISMATCH';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND OR v_profile.role <> 'owner'::public.app_role
    OR v_profile.status <> 'active'::public.user_status
    OR v_profile.deleted_at IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'OWNER_PROFILE_UNAVAILABLE';
  END IF;

  UPDATE public.profiles
  SET full_name = btrim(p_full_name),
      city_id = p_city_id,
      phone = p_phone
  WHERE id = v_user_id;

  INSERT INTO public.consents (user_id, type, version)
  VALUES
    (v_user_id, 'terms', v_terms_version),
    (v_user_id, 'privacy', v_privacy_version)
  ON CONFLICT (user_id, type, version) DO NOTHING;

  RETURN jsonb_build_object('status', 'completed');
END;
$$;

REVOKE ALL ON FUNCTION public.complete_owner_profile(text, uuid, text, boolean, text, text)
FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.complete_owner_profile(text, uuid, text, boolean, text, text)
TO authenticated;
