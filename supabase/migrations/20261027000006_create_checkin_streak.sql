-- Điểm danh hằng ngày + chuỗi (streak) + thưởng theo mốc, dùng cho bảng xếp hạng.
-- State nhạy cảm (streak, khiên bảo vệ chuỗi) nằm ở bảng riêng checkin_state, KHÔNG
-- thêm cột vào profiles: profiles đã có policy UPDATE cho mọi cột theo chủ sở hữu,
-- nếu đặt streak ở đó client có thể tự update giả mạo qua REST, bỏ qua RPC bên dưới.

-- ─── Bảng mốc thưởng (data-driven, giống triết lý bảng missions) ────────────────

CREATE TABLE public.checkin_milestones (
  day_threshold   INT PRIMARY KEY,
  reward_credits  INT NOT NULL DEFAULT 0,
  grants_shield   BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT NOT NULL DEFAULT 0
);

ALTER TABLE public.checkin_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY checkin_milestones_select_all ON public.checkin_milestones
  FOR SELECT TO authenticated USING (true);
-- Không có insert/update cho client — chỉnh mốc thưởng chỉ qua migration.

INSERT INTO public.checkin_milestones (day_threshold, reward_credits, grants_shield, sort_order) VALUES
  (7,  3,  false, 1),
  (10, 5,  false, 2),
  (15, 8,  false, 3),
  (30, 15, true,  4)
ON CONFLICT (day_threshold) DO NOTHING;

-- ─── Trạng thái điểm danh hiện tại của mỗi user (1 row/user) ────────────────────

CREATE TABLE public.checkin_state (
  user_id            UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak     INT  NOT NULL DEFAULT 0,
  last_checkin_date  DATE,
  streak_shields     INT  NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.checkin_state ENABLE ROW LEVEL SECURITY;

-- Public read: leaderboard "Điểm danh" cần xếp hạng tất cả user theo streak.
CREATE POLICY checkin_state_select_all ON public.checkin_state
  FOR SELECT TO authenticated USING (true);
-- Không có insert/update/delete cho client — mọi ghi dữ liệu bắt buộc qua RPC daily_checkin().

-- ─── RPC: điểm danh hôm nay ──────────────────────────────────────────────────────

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
    -- last_checkin_date trong tương lai (không nên xảy ra) — coi như hôm nay, chặn ở guard trên rồi.
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

  IF granted_credits > 0 THEN
    UPDATE public.profiles SET ai_credits_remaining = ai_credits_remaining + granted_credits
      WHERE id = auth.uid();
  END IF;

  RETURN QUERY SELECT new_streak, granted_credits, used_shield, hit_threshold, new_shields;
END;
$$;

REVOKE ALL ON FUNCTION public.daily_checkin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.daily_checkin() TO authenticated;

-- ─── Views cho Leaderboard (gộp sẵn phía SQL) ─────────────────────────────────────

CREATE VIEW public.leaderboard_posts WITH (security_invoker = true) AS
  SELECT user_id, COUNT(*)::int AS post_count
  FROM public.posts
  GROUP BY user_id;

CREATE VIEW public.leaderboard_checkins WITH (security_invoker = true) AS
  SELECT user_id, current_streak
  FROM public.checkin_state
  WHERE current_streak > 0;

GRANT SELECT ON public.leaderboard_posts TO authenticated;
GRANT SELECT ON public.leaderboard_checkins TO authenticated;
