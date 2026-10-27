DROP POLICY breeds_select_active_catalog ON public.breeds;

CREATE POLICY breeds_select_anon_catalog ON public.breeds
FOR SELECT TO anon
USING (is_active);

CREATE POLICY breeds_select_authenticated_catalog ON public.breeds
FOR SELECT TO authenticated
USING (is_active AND public.is_active_account());
