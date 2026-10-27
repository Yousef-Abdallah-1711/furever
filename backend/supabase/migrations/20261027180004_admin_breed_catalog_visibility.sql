CREATE POLICY breeds_select_authenticated_admin ON public.breeds
FOR SELECT TO authenticated
USING (
  public.is_active_account()
  AND (SELECT auth.jwt() ->> 'user_role') IN ('admin', 'super_admin')
);
