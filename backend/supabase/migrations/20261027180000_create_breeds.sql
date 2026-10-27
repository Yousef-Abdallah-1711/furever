CREATE TYPE public.species AS ENUM ('cat', 'dog', 'bird', 'rabbit', 'other');

CREATE TABLE public.breeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  species public.species NOT NULL,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_en text NOT NULL CHECK (length(btrim(name_en)) BETWEEN 1 AND 80),
  name_ar text NOT NULL CHECK (length(btrim(name_ar)) BETWEEN 1 AND 80),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT breeds_species_slug_unique UNIQUE (species, slug),
  CONSTRAINT breeds_id_species_unique UNIQUE (id, species)
);

CREATE TRIGGER breeds_set_updated_at
BEFORE UPDATE ON public.breeds
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER breeds_audit
AFTER INSERT OR UPDATE OR DELETE ON public.breeds
FOR EACH ROW EXECUTE FUNCTION public.audit_configuration_change();

ALTER TABLE public.breeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY breeds_select_active_catalog ON public.breeds
FOR SELECT TO anon, authenticated
USING (
  is_active
  AND CASE
    WHEN (SELECT auth.role()) = 'anon' THEN true
    ELSE public.is_active_account()
  END
);

CREATE POLICY breeds_insert_admin ON public.breeds
FOR INSERT TO authenticated
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);

CREATE POLICY breeds_update_admin ON public.breeds
FOR UPDATE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
)
WITH CHECK (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);

CREATE POLICY breeds_delete_admin ON public.breeds
FOR DELETE TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);

GRANT SELECT ON public.breeds TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.breeds TO authenticated;

INSERT INTO public.breeds (id, species, slug, name_en, name_ar) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'cat', 'abyssinian', 'Abyssinian', 'حبشي'),
  ('a0000000-0000-4000-8000-000000000002', 'cat', 'american-shorthair', 'American Shorthair', 'أمريكي قصير الشعر'),
  ('a0000000-0000-4000-8000-000000000003', 'cat', 'bengal', 'Bengal', 'بنغالي'),
  ('a0000000-0000-4000-8000-000000000004', 'cat', 'british-shorthair', 'British Shorthair', 'بريطاني قصير الشعر'),
  ('a0000000-0000-4000-8000-000000000005', 'cat', 'burmese', 'Burmese', 'بورمي'),
  ('a0000000-0000-4000-8000-000000000006', 'cat', 'chartreux', 'Chartreux', 'شارترو'),
  ('a0000000-0000-4000-8000-000000000007', 'cat', 'cornish-rex', 'Cornish Rex', 'كورنيش ريكس'),
  ('a0000000-0000-4000-8000-000000000008', 'cat', 'devon-rex', 'Devon Rex', 'ديفون ريكس'),
  ('a0000000-0000-4000-8000-000000000009', 'cat', 'egyptian-mau', 'Egyptian Mau', 'ماو مصري'),
  ('a0000000-0000-4000-8000-000000000010', 'cat', 'exotic-shorthair', 'Exotic Shorthair', 'إكزوتيك قصير الشعر'),
  ('a0000000-0000-4000-8000-000000000011', 'cat', 'himalayan', 'Himalayan', 'هيمالايا'),
  ('a0000000-0000-4000-8000-000000000012', 'cat', 'maine-coon', 'Maine Coon', 'مين كون'),
  ('a0000000-0000-4000-8000-000000000013', 'cat', 'norwegian-forest', 'Norwegian Forest Cat', 'قط الغابة النرويجي'),
  ('a0000000-0000-4000-8000-000000000014', 'cat', 'persian', 'Persian', 'فارسي'),
  ('a0000000-0000-4000-8000-000000000015', 'cat', 'ragdoll', 'Ragdoll', 'راغدول'),
  ('a0000000-0000-4000-8000-000000000016', 'cat', 'russian-blue', 'Russian Blue', 'روسي أزرق'),
  ('a0000000-0000-4000-8000-000000000017', 'cat', 'scottish-fold', 'Scottish Fold', 'سكوتش فولد'),
  ('a0000000-0000-4000-8000-000000000018', 'cat', 'siamese', 'Siamese', 'سيامي'),
  ('a0000000-0000-4000-8000-000000000019', 'cat', 'sphynx', 'Sphynx', 'سفينكس'),
  ('a0000000-0000-4000-8000-000000000020', 'cat', 'turkish-angora', 'Turkish Angora', 'أنغورا تركي'),
  ('a0000000-0000-4000-8000-000000000021', 'cat', 'turkish-van', 'Turkish Van', 'فان تركي'),
  ('a0000000-0000-4000-8000-000000000022', 'cat', 'domestic-shorthair', 'Domestic Shorthair', 'بلدي قصير الشعر'),
  ('a0000000-0000-4000-8000-000000000023', 'dog', 'akita', 'Akita', 'أكيتا'),
  ('a0000000-0000-4000-8000-000000000024', 'dog', 'beagle', 'Beagle', 'بيغل'),
  ('a0000000-0000-4000-8000-000000000025', 'dog', 'boxer', 'Boxer', 'بوكسر'),
  ('a0000000-0000-4000-8000-000000000026', 'dog', 'english-bulldog', 'English Bulldog', 'بولدوغ إنجليزي'),
  ('a0000000-0000-4000-8000-000000000027', 'dog', 'cavalier-king-charles-spaniel', 'Cavalier King Charles Spaniel', 'كافاليير كينغ تشارلز سبانييل'),
  ('a0000000-0000-4000-8000-000000000028', 'dog', 'chihuahua', 'Chihuahua', 'شيواوا'),
  ('a0000000-0000-4000-8000-000000000029', 'dog', 'cocker-spaniel', 'Cocker Spaniel', 'كوكر سبانييل'),
  ('a0000000-0000-4000-8000-000000000030', 'dog', 'dachshund', 'Dachshund', 'داشهند'),
  ('a0000000-0000-4000-8000-000000000031', 'dog', 'doberman-pinscher', 'Doberman Pinscher', 'دوبرمان'),
  ('a0000000-0000-4000-8000-000000000032', 'dog', 'german-shepherd', 'German Shepherd', 'جيرمن شيبرد'),
  ('a0000000-0000-4000-8000-000000000033', 'dog', 'golden-retriever', 'Golden Retriever', 'غولدن ريتريفر'),
  ('a0000000-0000-4000-8000-000000000034', 'dog', 'great-dane', 'Great Dane', 'جريت دان'),
  ('a0000000-0000-4000-8000-000000000035', 'dog', 'siberian-husky', 'Siberian Husky', 'هاسكي سيبيري'),
  ('a0000000-0000-4000-8000-000000000036', 'dog', 'labrador-retriever', 'Labrador Retriever', 'لابرادور ريتريفر'),
  ('a0000000-0000-4000-8000-000000000037', 'dog', 'maltese', 'Maltese', 'مالطي'),
  ('a0000000-0000-4000-8000-000000000038', 'dog', 'pomeranian', 'Pomeranian', 'بوميرانيان'),
  ('a0000000-0000-4000-8000-000000000039', 'dog', 'poodle', 'Poodle', 'بودل'),
  ('a0000000-0000-4000-8000-000000000040', 'dog', 'pug', 'Pug', 'بَج'),
  ('a0000000-0000-4000-8000-000000000041', 'dog', 'rottweiler', 'Rottweiler', 'روت وايلر'),
  ('a0000000-0000-4000-8000-000000000042', 'dog', 'shih-tzu', 'Shih Tzu', 'شيه تزو'),
  ('a0000000-0000-4000-8000-000000000043', 'dog', 'french-bulldog', 'French Bulldog', 'بولدوغ فرنسي'),
  ('a0000000-0000-4000-8000-000000000044', 'dog', 'mixed-breed', 'Mixed Breed', 'سلالة مختلطة');
