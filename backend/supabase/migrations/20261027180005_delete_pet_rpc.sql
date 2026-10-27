CREATE FUNCTION public.delete_pet(p_pet_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_owner_id uuid := (SELECT auth.uid());
  v_pet public.pets%ROWTYPE;
BEGIN
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'AUTHENTICATION_REQUIRED';
  END IF;
  IF p_pet_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'PET_ID_REQUIRED';
  END IF;
  IF NOT public.can_access_owner_pet_data() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'OWNER_PROFILE_UNAVAILABLE';
  END IF;

  SELECT * INTO v_pet
  FROM public.pets
  WHERE id = p_pet_id AND owner_id = v_owner_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Keep missing and other-owner IDs indistinguishable to the caller.
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PET_NOT_FOUND';
  END IF;

  IF v_pet.deleted_at IS NOT NULL THEN
    RETURN jsonb_build_object('id', v_pet.id, 'status', 'already_deleted');
  END IF;

  UPDATE public.pets
  SET deleted_at = now()
  WHERE id = v_pet.id;

  RETURN jsonb_build_object('id', v_pet.id, 'status', 'deleted');
END;
$$;

REVOKE ALL ON FUNCTION public.delete_pet(uuid) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.delete_pet(uuid) TO authenticated;
