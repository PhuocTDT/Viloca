-- Policy UPDATE gốc trên profiles (USING auth.uid() = id, không giới hạn cột) cho phép
-- client tự PATCH /profiles?id=eq.<minh> để set plan='pro' hoặc ai_credits_remaining=9999,
-- vô hiệu hoá freemium gate (enforce_locations_freemium) và kinh tế credit (daily_checkin,
-- backfill_checkin, claim_mission_reward, plan-trip). Chặn bằng trigger: chỉ cho phép đổi
-- 2 cột này khi câu UPDATE chạy với quyền nâng cao của các RPC SECURITY DEFINER (current_user
-- khi đó là owner của function, không phải role 'authenticated'/'anon' mà PostgREST dùng
-- cho request trực tiếp của client).
CREATE OR REPLACE FUNCTION public.protect_profiles_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF NEW.plan IS DISTINCT FROM OLD.plan THEN
      RAISE EXCEPTION 'Cannot modify profiles.plan directly';
    END IF;
    IF NEW.ai_credits_remaining IS DISTINCT FROM OLD.ai_credits_remaining THEN
      RAISE EXCEPTION 'Cannot modify profiles.ai_credits_remaining directly';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profiles_privileged_columns ON public.profiles;
CREATE TRIGGER trg_protect_profiles_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profiles_privileged_columns();
