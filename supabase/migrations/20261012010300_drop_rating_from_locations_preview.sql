-- Bo `rating` khoi view locations_preview (tang free).
--
-- Khong co nguon rating that nao. Migration thang 6 dinh set cung 4.0 cho moi
-- dia diem; no chua chay nen hien rating la NULL 0/70. Dien 4.0 dong loat thi
-- moi card hien cung mot con so — user nhan ra ngay la bia, va no xoi niem tin
-- dung vao luc app dang co thuyet phuc rang dia diem duoc tuyen chon.
--
-- Thieu rating thi that tha; rating bia thi khong. Khi nao co nguon that
-- (review cua user, hoac import tu nguon ngoai) thi them lai.
--
-- Cot `locations.rating` giu nguyen — PlaceGridCard va FeaturedPlaceCard doc no
-- tu bang `locations` chu khong qua view, nen chung khong bi anh huong.

BEGIN;

DROP VIEW IF EXISTS locations_preview;

CREATE VIEW locations_preview
  WITH (security_invoker = false)
AS
  SELECT
    id,
    hint,
    cover_image,
    images,
    category,
    vibes,
    price_per_person,
    duration_minutes
  FROM locations
  WHERE is_active = true;

GRANT SELECT ON locations_preview TO authenticated;

COMMIT;
