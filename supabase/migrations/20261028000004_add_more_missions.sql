-- Bổ sung thêm nhiệm vụ, theo đúng pattern đã có ở 20261026000001_create_missions.sql:
-- mỗi nhiệm vụ server_count cần 1 trigger đếm riêng (SECURITY DEFINER, loop theo mission
-- đang active khớp metric), mission mới cùng metric với trigger đã có (posts_created) thì
-- không cần code gì thêm — chỉ cần INSERT.

-- ─── Nhiệm vụ tái dùng trigger "posts_created" đã có sẵn — không cần code mới ──────

INSERT INTO public.missions (code, title, title_en, description, description_en, icon, verification_mode, metric, target_count, reward_credits, sort_order)
VALUES
  ('post_15', 'Đăng 15 bài viết', 'Post 15 times',
   'Tiếp tục chia sẻ hành trình của bạn trên Viloca', 'Keep sharing your journey on Viloca',
   'images-outline', 'server_count', 'posts_created', 15, 3, 3)
ON CONFLICT (code) DO NOTHING;

-- ─── Nhiệm vụ mới: tạo chuyến đi đầu tiên ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_trip_created_for_missions()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m RECORD;
BEGIN
  FOR m IN
    SELECT id, target_count FROM public.missions
    WHERE metric = 'trips_created' AND verification_mode = 'server_count' AND is_active
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

CREATE TRIGGER trg_trips_mission_progress
  AFTER INSERT ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_trip_created_for_missions();

-- ─── Nhiệm vụ mới: lưu địa điểm yêu thích ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_favorite_created_for_missions()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m RECORD;
BEGIN
  FOR m IN
    SELECT id, target_count FROM public.missions
    WHERE metric = 'favorites_saved' AND verification_mode = 'server_count' AND is_active
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

CREATE TRIGGER trg_favorites_mission_progress
  AFTER INSERT ON public.user_favorites
  FOR EACH ROW EXECUTE FUNCTION public.handle_favorite_created_for_missions();

-- ─── Nhiệm vụ mới: theo dõi bạn bè (tái dùng bảng user_follows từ tính năng Bạn bè) ──

CREATE OR REPLACE FUNCTION public.handle_follow_created_for_missions()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m RECORD;
BEGIN
  FOR m IN
    SELECT id, target_count FROM public.missions
    WHERE metric = 'friends_followed' AND verification_mode = 'server_count' AND is_active
  LOOP
    INSERT INTO public.user_mission_progress (user_id, mission_id, progress_count, completed_at)
    VALUES (NEW.follower_id, m.id, 1, CASE WHEN 1 >= m.target_count THEN now() END)
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

CREATE TRIGGER trg_follows_mission_progress
  AFTER INSERT ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_created_for_missions();

-- ─── Seed 3 nhiệm vụ dùng trigger mới ở trên ────────────────────────────────────────

INSERT INTO public.missions (code, title, title_en, description, description_en, icon, verification_mode, metric, target_count, reward_credits, sort_order)
VALUES
  ('trip_first', 'Tạo chuyến đi đầu tiên', 'Create your first trip',
   'Bắt đầu lên kế hoạch cho chuyến phiêu lưu đầu tiên trên Viloca', 'Start planning your very first trip on Viloca',
   'map-outline', 'server_count', 'trips_created', 1, 2, 4),
  ('favorites_5', 'Lưu 5 địa điểm yêu thích', 'Save 5 favorite places',
   'Đánh dấu những địa điểm bạn muốn ghé thăm', 'Bookmark the places you want to visit',
   'heart-outline', 'server_count', 'favorites_saved', 5, 2, 5),
  ('follow_3', 'Kết bạn với 3 người', 'Follow 3 people',
   'Tìm và theo dõi những người bạn cùng đam mê du lịch', 'Find and follow fellow travelers',
   'people-outline', 'server_count', 'friends_followed', 3, 2, 6)
ON CONFLICT (code) DO NOTHING;
