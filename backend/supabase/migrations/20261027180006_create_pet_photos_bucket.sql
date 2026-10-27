INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Object names use {auth.uid()}/{pet UUID}/{random filename}. Authorization
-- checks both path ownership and the referenced active pet; path text alone is
-- never treated as an owner credential.
CREATE FUNCTION public.can_access_pet_storage_object(p_bucket_id text, p_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_owner_id uuid := (SELECT auth.uid());
  v_folders text[];
  v_pet_id uuid;
BEGIN
  IF v_owner_id IS NULL
    OR p_bucket_id NOT IN ('pet-photos', 'pet-documents')
    OR p_name IS NULL
    OR NOT public.can_access_owner_pet_data() THEN
    RETURN false;
  END IF;

  v_folders := storage.foldername(p_name);
  IF coalesce(array_length(v_folders, 1), 0) <> 2
    OR v_folders[1] <> v_owner_id::text
    OR v_folders[2] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN false;
  END IF;

  v_pet_id := v_folders[2]::uuid;
  RETURN EXISTS (
    SELECT 1 FROM public.pets AS pet
    WHERE pet.id = v_pet_id
      AND pet.owner_id = v_owner_id
      AND pet.deleted_at IS NULL
  );
END;
$$;

REVOKE ALL ON FUNCTION public.can_access_pet_storage_object(text, text)
FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_pet_storage_object(text, text)
TO authenticated;

CREATE POLICY pet_photos_select_owner ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'pet-photos'
  AND public.can_access_pet_storage_object(bucket_id, name)
);

CREATE POLICY pet_photos_insert_owner ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'pet-photos'
  AND public.can_access_pet_storage_object(bucket_id, name)
);

CREATE POLICY pet_photos_delete_owner ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'pet-photos'
  AND public.can_access_pet_storage_object(bucket_id, name)
);

-- Deliberately no UPDATE policy: clients cannot overwrite an existing object.
