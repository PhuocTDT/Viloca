-- Các trigger mission (posts/trips/favorites/follows) chỉ cộng progress_count khi
-- INSERT, không trừ khi DELETE — user có thể farm nhiệm vụ bằng cách follow/unfollow
-- hoặc favorite/unfavorite lặp lại nhiều lần mà không giữ dữ liệu thật. Thêm 1
-- trigger AFTER DELETE riêng cho mỗi bảng nguồn (giống cấu trúc các trigger INSERT
-- đã có — PL/pgSQL không cho dùng 1 hàm chung tham chiếu cột khác nhau theo
-- TG_TABLE_NAME trong cùng 1 CASE, vì OLD bị gắn cứng theo kiểu bảng đang kích hoạt),
-- trừ lại progress_count (không âm) và bỏ completed_at nếu progress rơi dưới target —
-- chỉ áp dụng cho tiến độ CHƯA claim (đã claim thì thưởng đã phát, không thu lại).

CREATE OR REPLACE FUNCTION public.handle_post_deleted_for_missions()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m RECORD; new_progress INT;
BEGIN
  FOR m IN
    SELECT id, target_count FROM public.missions
    WHERE metric = 'posts_created' AND verification_mode = 'server_count' AND is_active
  LOOP
    new_progress := NULL;
    UPDATE public.user_mission_progress AS ump
    SET progress_count = GREATEST(0, ump.progress_count - 1), updated_at = now()
    WHERE ump.user_id = OLD.user_id AND ump.mission_id = m.id AND ump.claimed_at IS NULL
    RETURNING ump.progress_count INTO new_progress;

    IF new_progress IS NOT NULL AND new_progress < m.target_count THEN
      UPDATE public.user_mission_progress SET completed_at = NULL
        WHERE user_id = OLD.user_id AND mission_id = m.id AND claimed_at IS NULL;
    END IF;
  END LOOP;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_posts_mission_progress_delete
  AFTER DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_deleted_for_missions();

CREATE OR REPLACE FUNCTION public.handle_trip_deleted_for_missions()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m RECORD; new_progress INT;
BEGIN
  FOR m IN
    SELECT id, target_count FROM public.missions
    WHERE metric = 'trips_created' AND verification_mode = 'server_count' AND is_active
  LOOP
    new_progress := NULL;
    UPDATE public.user_mission_progress AS ump
    SET progress_count = GREATEST(0, ump.progress_count - 1), updated_at = now()
    WHERE ump.user_id = OLD.user_id AND ump.mission_id = m.id AND ump.claimed_at IS NULL
    RETURNING ump.progress_count INTO new_progress;

    IF new_progress IS NOT NULL AND new_progress < m.target_count THEN
      UPDATE public.user_mission_progress SET completed_at = NULL
        WHERE user_id = OLD.user_id AND mission_id = m.id AND claimed_at IS NULL;
    END IF;
  END LOOP;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_trips_mission_progress_delete
  AFTER DELETE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_trip_deleted_for_missions();

CREATE OR REPLACE FUNCTION public.handle_favorite_deleted_for_missions()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m RECORD; new_progress INT;
BEGIN
  FOR m IN
    SELECT id, target_count FROM public.missions
    WHERE metric = 'favorites_saved' AND verification_mode = 'server_count' AND is_active
  LOOP
    new_progress := NULL;
    UPDATE public.user_mission_progress AS ump
    SET progress_count = GREATEST(0, ump.progress_count - 1), updated_at = now()
    WHERE ump.user_id = OLD.user_id AND ump.mission_id = m.id AND ump.claimed_at IS NULL
    RETURNING ump.progress_count INTO new_progress;

    IF new_progress IS NOT NULL AND new_progress < m.target_count THEN
      UPDATE public.user_mission_progress SET completed_at = NULL
        WHERE user_id = OLD.user_id AND mission_id = m.id AND claimed_at IS NULL;
    END IF;
  END LOOP;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_favorites_mission_progress_delete
  AFTER DELETE ON public.user_favorites
  FOR EACH ROW EXECUTE FUNCTION public.handle_favorite_deleted_for_missions();

CREATE OR REPLACE FUNCTION public.handle_follow_deleted_for_missions()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m RECORD; new_progress INT;
BEGIN
  FOR m IN
    SELECT id, target_count FROM public.missions
    WHERE metric = 'friends_followed' AND verification_mode = 'server_count' AND is_active
  LOOP
    new_progress := NULL;
    UPDATE public.user_mission_progress AS ump
    SET progress_count = GREATEST(0, ump.progress_count - 1), updated_at = now()
    WHERE ump.user_id = OLD.follower_id AND ump.mission_id = m.id AND ump.claimed_at IS NULL
    RETURNING ump.progress_count INTO new_progress;

    IF new_progress IS NOT NULL AND new_progress < m.target_count THEN
      UPDATE public.user_mission_progress SET completed_at = NULL
        WHERE user_id = OLD.follower_id AND mission_id = m.id AND claimed_at IS NULL;
    END IF;
  END LOOP;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_follows_mission_progress_delete
  AFTER DELETE ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_deleted_for_missions();
