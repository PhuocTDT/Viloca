-- 1. Phân loại từng dòng checkin_logs: 'checkin' (điểm danh thật trong ngày),
--    'shield' (ngày bị bỏ lỡ nhưng được Khiên bảo vệ chuỗi cứu), 'backfill' (điểm danh bù
--    ngày quá khứ, tốn credit). Lịch tháng dùng cột này để chọn icon hiển thị.
ALTER TABLE public.checkin_logs
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'checkin'
  CHECK (kind IN ('checkin', 'shield', 'backfill'));

-- 2. Chặn client tự ghi thẳng vào checkin_logs — điểm danh bù giờ tốn credit nên phải
--    qua RPC backfill_checkin() (SECURITY DEFINER) để kiểm tra & trừ credit an toàn.
--    daily_checkin() đã là SECURITY DEFINER nên không bị ảnh hưởng bởi việc bỏ policy này.
DROP POLICY IF EXISTS checkin_logs_insert_own ON public.checkin_logs;

-- 3. daily_checkin(): gắn kind='checkin' cho log hôm nay, và khi dùng khiên bảo vệ chuỗi
--    thì ghi thêm 1 dòng kind='shield' cho đúng ngày bị bỏ lỡ ngay trước hôm nay — để lịch
--    tháng biết ngày đó hiện icon khiên thay vì icon thiếu (X đỏ).
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

  INSERT INTO public.checkin_logs (user_id, checkin_date, kind)
  VALUES (auth.uid(), CURRENT_DATE, 'checkin')
  ON CONFLICT (user_id, checkin_date) DO UPDATE SET kind = 'checkin';

  IF used_shield THEN
    INSERT INTO public.checkin_logs (user_id, checkin_date, kind)
    VALUES (auth.uid(), CURRENT_DATE - 1, 'shield')
    ON CONFLICT (user_id, checkin_date) DO NOTHING;
  END IF;

  IF granted_credits > 0 THEN
    UPDATE public.profiles SET ai_credits_remaining = ai_credits_remaining + granted_credits
      WHERE id = auth.uid();
  END IF;

  RETURN QUERY SELECT new_streak, granted_credits, used_shield, hit_threshold, new_shields;
END;
$$;

-- 4. RPC điểm danh bù ngày quá khứ — tốn 10 AI credit, KHÔNG tính lại streak/mốc thưởng
--    (chỉ tick vào lịch cho đủ, đúng thiết kế hiện có — chỉ thêm phần trừ credit).
CREATE OR REPLACE FUNCTION public.backfill_checkin(p_date DATE)
RETURNS TABLE(ai_credits_remaining INT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cost CONSTANT INT := 10;
  current_credits INT;
  new_credits INT;
BEGIN
  IF p_date >= CURRENT_DATE THEN
    RAISE EXCEPTION 'Can only backfill a past date';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.checkin_logs
    WHERE user_id = auth.uid() AND checkin_date = p_date
  ) THEN
    RAISE EXCEPTION 'This date is already checked in';
  END IF;

  SELECT p.ai_credits_remaining INTO current_credits
    FROM public.profiles p WHERE p.id = auth.uid() FOR UPDATE;

  IF current_credits IS NULL OR current_credits < cost THEN
    RAISE EXCEPTION 'Not enough AI credits (need %)', cost;
  END IF;

  UPDATE public.profiles AS pr SET ai_credits_remaining = pr.ai_credits_remaining - cost
    WHERE pr.id = auth.uid()
    RETURNING pr.ai_credits_remaining INTO new_credits;

  INSERT INTO public.checkin_logs (user_id, checkin_date, kind)
  VALUES (auth.uid(), p_date, 'backfill');

  RETURN QUERY SELECT new_credits;
END;
$$;

REVOKE ALL ON FUNCTION public.backfill_checkin(DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.backfill_checkin(DATE) TO authenticated;

-- 5. Sửa bug có sẵn từ trước (phát hiện khi viết backfill_checkin ở trên, cùng pattern lỗi):
--    claim_mission_reward() có RETURNS TABLE(ai_credits_remaining INT) trùng tên cột bảng
--    profiles, khiến câu UPDATE ... SET ai_credits_remaining = ai_credits_remaining + ...
--    bị Postgres báo "column reference is ambiguous" — claim thưởng nhiệm vụ hiện đang
--    luôn lỗi. Dùng alias bảng để hết nhập nhằng, không đổi chữ ký/behavior khác.
CREATE OR REPLACE FUNCTION public.claim_mission_reward(p_mission_id UUID)
RETURNS TABLE(ai_credits_remaining INT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE prog RECORD; mis RECORD; new_credits INT;
BEGIN
  SELECT * INTO prog FROM public.user_mission_progress
    WHERE user_id = auth.uid() AND mission_id = p_mission_id FOR UPDATE;
  IF prog IS NULL OR prog.completed_at IS NULL THEN
    RAISE EXCEPTION 'Mission not completed';
  END IF;
  IF prog.claimed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Reward already claimed';
  END IF;

  SELECT * INTO mis FROM public.missions WHERE id = p_mission_id;

  UPDATE public.user_mission_progress SET claimed_at = now()
    WHERE user_id = auth.uid() AND mission_id = p_mission_id;

  UPDATE public.profiles AS pr SET ai_credits_remaining = pr.ai_credits_remaining + mis.reward_credits
    WHERE pr.id = auth.uid()
    RETURNING pr.ai_credits_remaining INTO new_credits;

  RETURN QUERY SELECT new_credits;
END;
$$;
