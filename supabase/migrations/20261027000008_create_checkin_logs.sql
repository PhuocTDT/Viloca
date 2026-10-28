-- Bảng lịch sử điểm danh theo ngày (cho view lịch điểm danh theo tháng)
CREATE TABLE IF NOT EXISTS public.checkin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, checkin_date)
);

ALTER TABLE public.checkin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY checkin_logs_select_own ON public.checkin_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY checkin_logs_insert_own ON public.checkin_logs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY checkin_logs_delete_own ON public.checkin_logs
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Đồng bộ dữ liệu hiện tại từ checkin_state vào checkin_logs
INSERT INTO public.checkin_logs (user_id, checkin_date)
SELECT user_id, last_checkin_date
FROM public.checkin_state
WHERE last_checkin_date IS NOT NULL
ON CONFLICT (user_id, checkin_date) DO NOTHING;

-- Cập nhật function daily_checkin để tự động ghi log vào checkin_logs
CREATE OR REPLACE FUNCTION public.daily_checkin()
RETURNS TABLE(
  streak INT,
  credits_granted INT,
  shield_used BOOLEAN,
  milestone_hit INT,
  shields_remaining INT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cur RECORD;
  new_streak INT;
  new_shields INT;
  used_shield BOOLEAN := false;
  m RECORD;
  granted_credits INT := 0;
  hit_threshold INT := NULL;
BEGIN
  SELECT * INTO cur FROM public.checkin_state WHERE user_id = auth.uid() FOR UPDATE;

  IF cur IS NOT NULL AND cur.last_checkin_date = CURRENT_DATE THEN
    RAISE EXCEPTION 'Already checked in today';
  END IF;

  IF cur IS NULL THEN
    new_streak := 1;
    new_shields := 0;
  ELSIF cur.last_checkin_date = CURRENT_DATE - 1 THEN
    new_streak := cur.current_streak + 1;
    new_shields := cur.streak_shields;
  ELSIF cur.last_checkin_date IS NULL OR cur.last_checkin_date < CURRENT_DATE - 1 THEN
    IF cur.streak_shields > 0 THEN
      new_streak := cur.current_streak + 1;
      new_shields := cur.streak_shields - 1;
      used_shield := true;
    ELSE
      new_streak := 1;
      new_shields := 0;
    END IF;
  ELSE
    new_streak := cur.current_streak;
    new_shields := cur.streak_shields;
  END IF;

  -- Tra mốc thưởng khớp với streak mới
  SELECT * INTO m FROM public.checkin_milestones WHERE day_threshold = new_streak;
  IF m IS NOT NULL THEN
    granted_credits := m.reward_credits;
    hit_threshold := m.day_threshold;
    IF m.grants_shield THEN
      new_shields := new_shields + 1;
    END IF;
  END IF;

  INSERT INTO public.checkin_state (user_id, current_streak, last_checkin_date, streak_shields, updated_at)
  VALUES (auth.uid(), new_streak, CURRENT_DATE, new_shields, now())
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak    = new_streak,
    last_checkin_date = CURRENT_DATE,
    streak_shields    = new_shields,
    updated_at        = now();

  -- Tự động ghi vào lịch sử checkin_logs
  INSERT INTO public.checkin_logs (user_id, checkin_date)
  VALUES (auth.uid(), CURRENT_DATE)
  ON CONFLICT (user_id, checkin_date) DO NOTHING;

  IF granted_credits > 0 THEN
    UPDATE public.profiles SET ai_credits_remaining = ai_credits_remaining + granted_credits
      WHERE id = auth.uid();
  END IF;

  RETURN QUERY SELECT new_streak, granted_credits, used_shield, hit_threshold, new_shields;
END;
$$;
