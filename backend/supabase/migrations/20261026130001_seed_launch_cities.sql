INSERT INTO public.cities (id, name_en, name_ar, is_active)
VALUES
  ('00000000-0000-4000-8000-000000000001', 'Cairo', 'القاهرة', true),
  ('00000000-0000-4000-8000-000000000002', 'Giza', 'الجيزة', true),
  ('00000000-0000-4000-8000-000000000003', 'Alexandria', 'الإسكندرية', true)
ON CONFLICT (id) DO UPDATE
SET name_en = EXCLUDED.name_en,
    name_ar = EXCLUDED.name_ar,
    is_active = EXCLUDED.is_active;
