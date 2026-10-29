-- 2 lỗi phát hiện ở daily_checkin()/backfill_checkin():
--
-- 1. Lệch timezone: CURRENT_DATE chạy theo giờ UTC của session DB, còn client
--    dùng ngày local của máy. User VN (UTC+7) điểm danh 00:00-06:59 giờ VN sẽ
--    bị ghi nhận sai ngày (server vẫn coi là hôm qua) -> báo lỗi "đã điểm danh"
--    sai hoặc chặn điểm danh bù "hôm qua". Dùng v_today tính theo
--    Asia/Ho_Chi_Minh (UTC+7 cố định, không DST) nhất quán xuyên suốt.
--
-- 2. 1 khiên che được khoảng trống bất kỳ dài: điều kiện cũ chỉ cần
--    streak_shields > 0 là dùng khiên bất kể đã lỡ bao nhiêu ngày, chỉ log
--    đúng 1 ngày kind='shield' (hôm qua) dù có thể đã lỡ nhiều ngày hơn —
--    lịch tháng sau đó hiện sai các ngày thực sự bị lỡ thành "đã điểm danh".
--    Theo đúng thiết kế ban đầu ("lỡ 1 ngày mà có khiên thì không reset"),
--    khiên chỉ áp dụng khi đúng 1 ngày bị lỡ (last_checkin_date = v_today - 2).
--    Lỡ nhiều hơn 1 ngày luôn reset streak về 1, bất kể đang có bao nhiêu khiên
--    (khiên được giữ lại cho lần lỡ-1-ngày hợp lệ sau này).
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
  v_today DATE := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  cur RECORD;
  new_streak INT;
  new_shields INT;
  used_shield BOOLEAN := false;
  m RECORD;
  granted_credits INT := 0;
  hit_threshold INT := NULL;
BEGIN
  SELECT * INTO cur FROM public.checkin_state WHERE user_id = auth.uid() FOR UPDATE;

  IF cur IS NOT NULL AND cur.last_checkin_date = v_today THEN
    RAISE EXCEPTION 'Already checked in today';
  END IF;

  IF cur IS NULL THEN
    new_streak := 1;
    new_shields := 0;
  ELSIF cur.last_checkin_date = v_today - 1 THEN
    new_streak := cur.current_streak + 1;
    new_shields := cur.streak_shields;
  ELSIF cur.last_checkin_date = v_today - 2 AND cur.streak_shields > 0 THEN
    new_streak := cur.current_streak + 1;
    new_shields := cur.streak_shields - 1;
    used_shield := true;
  ELSE
    new_streak := 1;
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
  VALUES (auth.uid(), new_streak, v_today, new_shields, now())
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak    = new_streak,
    last_checkin_date = v_today,
    streak_shields    = new_shields,
    updated_at        = now();

  INSERT INTO public.checkin_logs (user_id, checkin_date, kind)
  VALUES (auth.uid(), v_today, 'checkin')
  ON CONFLICT (user_id, checkin_date) DO UPDATE SET kind = 'checkin';

  IF used_shield THEN
    INSERT INTO public.checkin_logs (user_id, checkin_date, kind)
    VALUES (auth.uid(), v_today - 1, 'shield')
    ON CONFLICT (user_id, checkin_date) DO NOTHING;
  END IF;

  IF granted_credits > 0 THEN
    UPDATE public.profiles SET ai_credits_remaining = ai_credits_remaining + granted_credits
      WHERE id = auth.uid();
  END IF;

  RETURN QUERY SELECT new_streak, granted_credits, used_shield, hit_threshold, new_shields;
END;
$$;

CREATE OR REPLACE FUNCTION public.backfill_checkin(p_date DATE)
RETURNS TABLE(ai_credits_remaining INT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today DATE := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  cost CONSTANT INT := 10;
  current_credits INT;
  new_credits INT;
BEGIN
  IF p_date >= v_today THEN
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

-- Streak không bao giờ tự reset khi user ngừng điểm danh (chỉ được tính lại
-- lúc gọi daily_checkin() lần kế tiếp) — leaderboard "Điểm danh" vì vậy có thể
-- xếp hạng 1 streak đã "chết" từ lâu. Thêm điều kiện last_checkin_date còn
-- "sống" (hôm nay hoặc hôm qua theo giờ VN) vào view, không cần cron.
CREATE OR REPLACE VIEW public.leaderboard_checkins WITH (security_invoker = true) AS
  SELECT user_id, current_streak
  FROM public.checkin_state
  WHERE current_streak > 0
    AND last_checkin_date >= (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - 1;
