-- Bảng nhiệm vụ (missions) đơn giản, data-driven: thêm nhiệm vụ mới chỉ cần INSERT,
-- không cần sửa code app. Thưởng bằng profiles.ai_credits_remaining (currency sẵn có).

CREATE TABLE public.missions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT UNIQUE NOT NULL,
  title             TEXT NOT NULL,
  title_en          TEXT,
  description       TEXT,
  description_en    TEXT,
  icon              TEXT,
  verification_mode TEXT NOT NULL CHECK (verification_mode IN ('server_count', 'client_report')),
  metric            TEXT NOT NULL,
  target_count      INT  NOT NULL DEFAULT 1,
  reward_credits    INT  NOT NULL DEFAULT 1,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  sort_order        INT  NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_mission_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id     UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  progress_count INT  NOT NULL DEFAULT 0,
  completed_at   TIMESTAMPTZ,
  claimed_at     TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id)
);

ALTER TABLE public.missions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "missions_select_active" ON public.missions
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "mission_progress_select_own" ON public.user_mission_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
-- Cố ý không có policy insert/update cho user_mission_progress — mọi ghi dữ liệu
-- bắt buộc đi qua trigger/RPC bên dưới (SECURITY DEFINER), chặn client tự giả tiến độ.

-- ─── Trigger: đếm bài viết cho mọi mission server_count metric='posts_created' ──

CREATE OR REPLACE FUNCTION public.handle_post_created_for_missions()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m RECORD;
BEGIN
  FOR m IN
    SELECT id, target_count FROM public.missions
    WHERE metric = 'posts_created' AND verification_mode = 'server_count' AND is_active
  LOOP
    INSERT INTO public.user_mission_progress (user_id, mission_id, progress_count, completed_at)
    VALUES (NEW.user_id, m.id, 1, CASE WHEN 1 >= m.target_count THEN now() END)
    ON CONFLICT (user_id, mission_id) DO UPDATE SET
      progress_count = public.user_mission_progress.progress_count + 1,
      completed_at = COALESCE(
        public.user_mission_progress.completed_at,
        CASE WHEN public.user_mission_progress.progress_count + 1 >= m.target_count THEN now() END
      ),
      updated_at = now();
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_posts_mission_progress
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_created_for_missions();

-- ─── RPC: client báo tiến độ (honor-system, vd "Chia sẻ Viloca") ────────────────

CREATE OR REPLACE FUNCTION public.report_mission_progress(p_metric TEXT)
RETURNS public.user_mission_progress
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m RECORD; result public.user_mission_progress;
BEGIN
  SELECT id, target_count INTO m FROM public.missions
    WHERE metric = p_metric AND verification_mode = 'client_report' AND is_active LIMIT 1;
  IF m IS NULL THEN
    RAISE EXCEPTION 'No client-reported mission for metric %', p_metric;
  END IF;

  INSERT INTO public.user_mission_progress (user_id, mission_id, progress_count, completed_at)
  VALUES (auth.uid(), m.id, 1, CASE WHEN 1 >= m.target_count THEN now() END)
  ON CONFLICT (user_id, mission_id) DO UPDATE SET
    progress_count = LEAST(m.target_count, public.user_mission_progress.progress_count + 1),
    completed_at = COALESCE(
      public.user_mission_progress.completed_at,
      CASE WHEN public.user_mission_progress.progress_count + 1 >= m.target_count THEN now() END
    ),
    updated_at = now()
  RETURNING * INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.report_mission_progress(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.report_mission_progress(TEXT) TO authenticated;

-- ─── RPC: nhận thưởng (khoá row, chống claim 2 lần) ──────────────────────────────

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

  UPDATE public.profiles SET ai_credits_remaining = ai_credits_remaining + mis.reward_credits
    WHERE id = auth.uid()
    RETURNING profiles.ai_credits_remaining INTO new_credits;

  RETURN QUERY SELECT new_credits;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_mission_reward(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_mission_reward(UUID) TO authenticated;

-- ─── Seed 2 nhiệm vụ đầu tiên ────────────────────────────────────────────────────

INSERT INTO public.missions (code, title, title_en, description, description_en, icon, verification_mode, metric, target_count, reward_credits, sort_order)
VALUES
  ('post_5', 'Đăng 5 bài viết', 'Post 5 times',
   'Chia sẻ 5 khoảnh khắc du lịch của bạn lên Viloca', 'Share 5 of your travel moments on Viloca',
   'camera-outline', 'server_count', 'posts_created', 5, 1, 1),
  ('share_viloca', 'Chia sẻ Viloca', 'Share Viloca',
   'Giới thiệu Viloca cho bạn bè', 'Introduce Viloca to a friend',
   'share-social-outline', 'client_report', 'app_shared', 1, 1, 2)
ON CONFLICT (code) DO NOTHING;
