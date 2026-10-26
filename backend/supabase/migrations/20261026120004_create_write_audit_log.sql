CREATE FUNCTION public.write_audit_log(
  p_actor_id uuid,
  p_action text,
  p_entity text,
  p_entity_id text,
  p_diff jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, diff)
  VALUES (p_actor_id, p_action, p_entity, p_entity_id, p_diff);
END;
$$;

REVOKE ALL ON FUNCTION public.write_audit_log(uuid, text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.write_audit_log(uuid, text, text, text, jsonb) TO authenticated;
