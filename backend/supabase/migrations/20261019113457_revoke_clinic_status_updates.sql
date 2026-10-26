-- Table-level UPDATE would override a column-only revoke, so grant update access only
-- to the current non-status clinic columns. D05 must preserve this boundary when adding columns.
REVOKE UPDATE ON public.clinics FROM authenticated;
GRANT UPDATE (name_en, name_ar, city_id) ON public.clinics TO authenticated;
REVOKE UPDATE (status) ON public.clinics FROM authenticated;
