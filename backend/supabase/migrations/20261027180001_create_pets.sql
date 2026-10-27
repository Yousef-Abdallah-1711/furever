CREATE TYPE public.pet_gender AS ENUM ('male', 'female', 'unknown');

CREATE TABLE public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 80),
  species public.species NOT NULL,
  breed_id uuid,
  gender public.pet_gender NOT NULL DEFAULT 'unknown',
  birth_date date,
  weight_kg numeric(7, 2) CHECK (weight_kg IS NULL OR weight_kg > 0),
  color text,
  microchip_no text,
  is_neutered boolean,
  photo_path text,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pets_breed_species_fkey
    FOREIGN KEY (breed_id, species)
    REFERENCES public.breeds (id, species)
);

CREATE INDEX pets_owner_active_idx ON public.pets (owner_id, created_at DESC)
WHERE deleted_at IS NULL;

CREATE TRIGGER pets_set_updated_at
BEFORE UPDATE ON public.pets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Pet access also requires a completed owner profile and current bilingual legal
-- consent. This keeps direct Data API calls aligned with the D02 route guard and
-- fail-closed legal configuration while approved documents are still pending.
CREATE FUNCTION public.can_access_owner_pet_data()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    JOIN public.app_config AS config ON config.key = 'legal_documents'
    WHERE profile.id = (SELECT auth.uid())
      AND profile.role = 'owner'::public.app_role
      AND profile.status = 'active'::public.user_status
      AND profile.deleted_at IS NULL
      AND profile.full_name IS NOT NULL
      AND profile.city_id IS NOT NULL
      AND jsonb_typeof(config.value #> '{terms}') = 'object'
      AND jsonb_typeof(config.value #> '{privacy}') = 'object'
      AND nullif(btrim(config.value #>> '{terms,version}'), '') IS NOT NULL
      AND nullif(btrim(config.value #>> '{privacy,version}'), '') IS NOT NULL
      AND nullif(btrim(config.value #>> '{terms,content_en}'), '') IS NOT NULL
      AND nullif(btrim(config.value #>> '{terms,content_ar}'), '') IS NOT NULL
      AND nullif(btrim(config.value #>> '{privacy,content_en}'), '') IS NOT NULL
      AND nullif(btrim(config.value #>> '{privacy,content_ar}'), '') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.consents AS consent
        WHERE consent.user_id = profile.id
          AND consent.type = 'terms'
          AND consent.version = config.value #>> '{terms,version}'
      )
      AND EXISTS (
        SELECT 1 FROM public.consents AS consent
        WHERE consent.user_id = profile.id
          AND consent.type = 'privacy'
          AND consent.version = config.value #>> '{privacy,version}'
      )
  );
$$;

REVOKE ALL ON FUNCTION public.can_access_owner_pet_data() FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_owner_pet_data() TO authenticated;

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY pets_select_own_active ON public.pets
FOR SELECT TO authenticated
USING (
  public.can_access_owner_pet_data()
  AND owner_id = (SELECT auth.uid())
  AND deleted_at IS NULL
);

CREATE POLICY pets_insert_own ON public.pets
FOR INSERT TO authenticated
WITH CHECK (
  public.can_access_owner_pet_data()
  AND owner_id = (SELECT auth.uid())
  AND deleted_at IS NULL
);

CREATE POLICY pets_update_own_active ON public.pets
FOR UPDATE TO authenticated
USING (
  public.can_access_owner_pet_data()
  AND owner_id = (SELECT auth.uid())
  AND deleted_at IS NULL
)
WITH CHECK (
  public.can_access_owner_pet_data()
  AND owner_id = (SELECT auth.uid())
  AND deleted_at IS NULL
);

REVOKE ALL ON public.pets FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.pets TO authenticated;
GRANT INSERT (
  name, species, breed_id, gender, birth_date, weight_kg, color, microchip_no,
  is_neutered, photo_path, notes
) ON public.pets TO authenticated;
GRANT UPDATE (
  name, species, breed_id, gender, birth_date, weight_kg, color, microchip_no,
  is_neutered, photo_path, notes
) ON public.pets TO authenticated;
GRANT ALL ON public.pets TO service_role;
