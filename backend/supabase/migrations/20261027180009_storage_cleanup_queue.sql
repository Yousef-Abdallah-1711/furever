-- Dormant service-only queue schema. No worker or schedule is installed until
-- retention has Egyptian legal review and final owner approval.
CREATE TABLE public.storage_cleanup_queue (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bucket text NOT NULL CHECK (bucket IN ('pet-photos', 'pet-documents', 'record-attachments')),
  path text NOT NULL CHECK (length(path) BETWEEN 1 AND 1024),
  queued_at timestamptz NOT NULL DEFAULT now(),
  done_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  CONSTRAINT storage_cleanup_queue_bucket_path_unique UNIQUE (bucket, path)
);

ALTER TABLE public.storage_cleanup_queue ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.storage_cleanup_queue FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.storage_cleanup_queue TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.storage_cleanup_queue_id_seq TO service_role;

CREATE POLICY storage_cleanup_queue_service_role_all
ON public.storage_cleanup_queue
FOR ALL TO service_role
USING ((SELECT auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'service_role');

CREATE INDEX storage_cleanup_queue_pending_idx
ON public.storage_cleanup_queue (queued_at, id)
WHERE done_at IS NULL;
