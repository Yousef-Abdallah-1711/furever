ALTER TABLE public.profiles
ADD CONSTRAINT profiles_phone_egyptian_e164
CHECK (phone IS NULL OR phone ~ '^\+201[0125][0-9]{8}$');
