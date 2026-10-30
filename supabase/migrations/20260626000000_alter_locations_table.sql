-- Migrate locations table from hint-based schema to full location schema
--
-- GHI CHÚ (phát hiện khi build local từ đầu, 2026-10-26): các statement DROP
-- COLUMN / RENAME COLUMN nguyên bản bên dưới KHÔNG khớp với thực tế trên
-- production — query trực tiếp schema prod cho thấy hint/cover_image/images/
-- vibes/price_per_person/duration_minutes/rating/coordinates/description vẫn
-- còn nguyên, và long_description tồn tại SONG SONG với description (tức là
-- được ADD COLUMN, không phải RENAME). Migration này có lẽ chưa từng chạy
-- đúng như file viết trên prod. Sửa lại để khớp với trạng thái prod thật,
-- không đổi gì trên DB đã có sẵn các cột này (chỉ no-op).
--
-- Drop dependent view first
DROP VIEW IF EXISTS locations_preview;

-- Drop old indexes
DROP INDEX IF EXISTS idx_locations_category;
DROP INDEX IF EXISTS idx_locations_is_active;
DROP INDEX IF EXISTS idx_locations_vibes;

-- Thêm long_description thay vì rename description (prod giữ cả 2 cột song song)
ALTER TABLE locations ADD COLUMN IF NOT EXISTS long_description TEXT;

-- Relax NOT NULL on category (some entries may lack it)
ALTER TABLE locations ALTER COLUMN category DROP NOT NULL;

-- Add new columns
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS city              TEXT,
  ADD COLUMN IF NOT EXISTS district         TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url  TEXT,
  ADD COLUMN IF NOT EXISTS style_tag        TEXT,
  ADD COLUMN IF NOT EXISTS price_level      INTEGER CHECK (price_level BETWEEN 1 AND 4),
  ADD COLUMN IF NOT EXISTS opening_hours    TEXT,
  ADD COLUMN IF NOT EXISTS closing_hours    TEXT,
  ADD COLUMN IF NOT EXISTS off_days         TEXT,
  ADD COLUMN IF NOT EXISTS phone            TEXT,
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS photos           TEXT,
  ADD COLUMN IF NOT EXISTS verified         BOOLEAN NOT NULL DEFAULT false;

-- New indexes
CREATE INDEX idx_locations_city     ON locations (city);
CREATE INDEX idx_locations_category ON locations (category);
CREATE INDEX idx_locations_price    ON locations (price_level);
CREATE INDEX idx_locations_verified ON locations (verified);
CREATE INDEX idx_locations_active   ON locations (is_active);
