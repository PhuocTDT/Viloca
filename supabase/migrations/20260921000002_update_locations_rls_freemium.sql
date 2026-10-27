-- Đảm bảo các cột free-tier tồn tại trước khi tạo view bên dưới — lịch sử
-- migration cũ có vài chỗ drop rồi re-add không khớp thứ tự khi build lại
-- từ đầu (local). Trên DB đã có sẵn các cột này (prod) đây là no-op an toàn.
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS hint              TEXT,
  ADD COLUMN IF NOT EXISTS cover_image       TEXT,
  ADD COLUMN IF NOT EXISTS images            TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS vibes             TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price_per_person  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration_minutes  INTEGER NOT NULL DEFAULT 120,
  ADD COLUMN IF NOT EXISTS rating            NUMERIC(2,1) DEFAULT NULL;

-- Replace open read policy with plan-aware policies for freemium enforcement
DROP POLICY IF EXISTS "authenticated_read_locations" ON locations;

-- Pro users can read all fields directly from the locations table
CREATE POLICY "pro_users_read_locations"
  ON locations FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND plan = 'pro'
    )
  );

-- All authenticated users can read the preview view (free-tier fields only)
-- Note: views inherit the RLS of their underlying tables by default in Postgres.
-- To allow free users to read locations_preview we grant SELECT on the view
-- and use SECURITY INVOKER so the view runs with the caller's permissions.
-- Since free users are blocked on the base table, we recreate the view as
-- SECURITY DEFINER so it can bypass RLS and expose only the allowed columns.
DROP VIEW IF EXISTS locations_preview;

CREATE VIEW locations_preview
  WITH (security_invoker = false)  -- SECURITY DEFINER behaviour via security_barrier
AS
  SELECT
    id,
    hint,
    cover_image,
    images,
    category,
    vibes,
    price_per_person,
    duration_minutes,
    rating
  FROM locations
  WHERE is_active = true;

-- Grant SELECT on locations_preview to authenticated role
GRANT SELECT ON locations_preview TO authenticated;
