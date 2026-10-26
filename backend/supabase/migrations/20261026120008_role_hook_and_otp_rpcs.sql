-- D02: add user_role to access tokens and provide service-only OTP lockout RPCs.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_role text;
BEGIN
  SELECT p.role::text INTO v_role FROM public.profiles AS p
  WHERE p.id = (event ->> 'user_id')::uuid;
  IF v_role IS NULL THEN RETURN event; END IF;
  RETURN jsonb_set(event, '{claims,user_role}', to_jsonb(v_role), true);
END;
$$;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

CREATE OR REPLACE FUNCTION public.record_otp_attempt(p_identifier text, p_outcome text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_identifier text := lower(btrim(p_identifier));
  v_now timestamptz := now();
BEGIN
  IF v_identifier IS NULL OR v_identifier = '' THEN
    RAISE EXCEPTION 'p_identifier must be a non-empty email address';
  END IF;
  IF p_outcome IS NULL OR p_outcome NOT IN ('sent', 'wrong', 'correct', 'cancelled') THEN
    RAISE EXCEPTION 'Unsupported OTP outcome: %', p_outcome;
  END IF;
  INSERT INTO public.otp_attempts (identifier, wrong_count, cancelled_count, window_started_at, locked_until)
  VALUES (
    v_identifier, CASE WHEN p_outcome = 'wrong' THEN 1 ELSE 0 END,
    CASE WHEN p_outcome = 'cancelled' THEN 1 ELSE 0 END,
    CASE WHEN p_outcome = 'cancelled' THEN v_now ELSE NULL END, NULL
  )
  ON CONFLICT (identifier) DO UPDATE SET
    wrong_count = CASE
      WHEN p_outcome IN ('sent', 'correct', 'cancelled') THEN 0
      WHEN public.otp_attempts.wrong_count >= 4 THEN 0
      ELSE public.otp_attempts.wrong_count + 1
    END,
    cancelled_count = CASE
      WHEN p_outcome = 'cancelled' OR (p_outcome = 'wrong' AND public.otp_attempts.wrong_count >= 4)
      THEN CASE
        WHEN public.otp_attempts.window_started_at IS NULL
          OR public.otp_attempts.window_started_at <= v_now - interval '60 minutes' THEN 1
        ELSE public.otp_attempts.cancelled_count + 1
      END
      ELSE public.otp_attempts.cancelled_count
    END,
    window_started_at = CASE
      WHEN (p_outcome = 'cancelled' OR (p_outcome = 'wrong' AND public.otp_attempts.wrong_count >= 4))
        AND (public.otp_attempts.window_started_at IS NULL
          OR public.otp_attempts.window_started_at <= v_now - interval '60 minutes') THEN v_now
      ELSE public.otp_attempts.window_started_at
    END,
    locked_until = CASE
      WHEN (p_outcome = 'cancelled' OR (p_outcome = 'wrong' AND public.otp_attempts.wrong_count >= 4))
        AND CASE
          WHEN public.otp_attempts.window_started_at IS NULL
            OR public.otp_attempts.window_started_at <= v_now - interval '60 minutes' THEN 1
          ELSE public.otp_attempts.cancelled_count + 1
        END >= 3 THEN v_now + interval '15 minutes'
      ELSE public.otp_attempts.locked_until
    END;
END;
$$;
REVOKE ALL ON FUNCTION public.record_otp_attempt(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_otp_attempt(text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.get_otp_lock_status(p_identifier text)
RETURNS TABLE (is_locked boolean, locked_until timestamptz, wrong_count integer, cancelled_count integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_identifier text := lower(btrim(p_identifier));
BEGIN
  IF v_identifier IS NULL OR v_identifier = '' THEN
    RAISE EXCEPTION 'p_identifier must be a non-empty email address';
  END IF;
  RETURN QUERY
  SELECT coalesce(a.locked_until > now(), false), a.locked_until, a.wrong_count, a.cancelled_count
  FROM public.otp_attempts AS a WHERE a.identifier = v_identifier;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::timestamptz, 0, 0;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.get_otp_lock_status(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_otp_lock_status(text) TO service_role;
