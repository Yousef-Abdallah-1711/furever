INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-documents',
  'pet-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY pet_documents_select_owner ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'pet-documents'
  AND public.can_access_pet_storage_object(bucket_id, name)
);

CREATE POLICY pet_documents_insert_owner ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'pet-documents'
  AND public.can_access_pet_storage_object(bucket_id, name)
);

CREATE POLICY pet_documents_delete_owner ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'pet-documents'
  AND public.can_access_pet_storage_object(bucket_id, name)
);

-- Deliberately no UPDATE policy: clients cannot overwrite an existing object.
