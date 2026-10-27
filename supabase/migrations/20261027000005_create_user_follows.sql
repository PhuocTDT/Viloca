-- Theo dõi 1 chiều (follow) giữa người dùng — không cần duyệt/chấp nhận,
-- nên không cần RPC SECURITY DEFINER: client tự insert/delete row của chính mình.

CREATE TABLE public.user_follows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_follows_no_self CHECK (follower_id <> following_id),
  UNIQUE (follower_id, following_id)
);

CREATE INDEX idx_user_follows_follower  ON public.user_follows (follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows (following_id);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Ai theo dõi ai là thông tin công khai (giống posts_select_all) — cần để hiện
-- danh sách "người theo dõi" của người khác.
CREATE POLICY user_follows_select_all ON public.user_follows
  FOR SELECT TO authenticated USING (true);

CREATE POLICY user_follows_insert_own ON public.user_follows
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

CREATE POLICY user_follows_delete_own ON public.user_follows
  FOR DELETE TO authenticated USING (auth.uid() = follower_id);
