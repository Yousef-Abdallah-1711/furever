DROP POLICY breeds_select_active_catalog ON public.breeds;

CREATE POLICY breeds_select_active_catalog ON public.breeds
FOR SELECT TO anon, authenticated
USING (
  is_active
  AND CASE
    WHEN (SELECT auth.role()) = 'anon' THEN true
    ELSE public.is_active_account()
  END
);
