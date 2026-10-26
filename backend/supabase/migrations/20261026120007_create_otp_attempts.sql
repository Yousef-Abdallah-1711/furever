CREATE TABLE public.otp_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  wrong_count integer NOT NULL DEFAULT 0,
  cancelled_count integer NOT NULL DEFAULT 0,
  window_started_at timestamptz,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT otp_attempts_identifier_lowercase CHECK (identifier = lower(identifier)),
  CONSTRAINT otp_attempts_identifier_format CHECK (identifier ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  CONSTRAINT otp_attempts_identifier_unique UNIQUE (identifier)
);

CREATE INDEX otp_attempts_locked_until_idx
ON public.otp_attempts (locked_until)
WHERE locked_until IS NOT NULL;

CREATE TRIGGER otp_attempts_set_updated_at
BEFORE UPDATE ON public.otp_attempts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.otp_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.otp_attempts FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.otp_attempts TO service_role;
