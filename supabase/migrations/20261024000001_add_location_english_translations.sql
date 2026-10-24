-- Them ban dich tieng Anh cho dia danh (name, short_description, hint) de cong tac
-- doi ngon ngu EN/VI tren app ap dung duoc cho du lieu dia diem, khong chi UI chrome.
--
-- Cot moi deu nullable va la BAN DICH DI KEM, khong thay the cot goc tieng Viet:
--   name_en, short_description_en, hint_en
--
-- locations_preview (dung cho Free) duoc mo rong them name_en + hint_en, giu dung
-- nguyen tac field-level da co trong 20261021000001 (Free thay ten/hint, KHONG thay
-- short_description — day la truong Pro-only). search_locations cung duoc cap nhat
-- de che short_description_en cho Free giong het short_description.
--
-- Du lieu dich duoc dien bang script rieng (translate_locations.sql, chay thu cong
-- sau migration nay), khong nam trong migration de de doi soat truoc khi ap dung.

BEGIN;

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS name_en              TEXT,
  ADD COLUMN IF NOT EXISTS short_description_en TEXT,
  ADD COLUMN IF NOT EXISTS hint_en               TEXT;

-- locations_preview: mo rong giong cach 20261021000001 da mo rong cho name/hint.
DROP VIEW IF EXISTS locations_preview;

CREATE VIEW locations_preview
  WITH (security_invoker = false)
AS
  SELECT
    id,
    name,
    name_en,
    city,
    district,
    category,
    style_tag,
    vibes,
    hint,
    hint_en,
    cover_image,
    images,
    is_featured,
    price_per_person,
    duration_minutes
  FROM locations
  WHERE is_active = true;

GRANT SELECT ON locations_preview TO authenticated;
REVOKE ALL ON locations_preview FROM anon;

-- search_locations: them short_description_en vao danh sach cot bi an voi Free,
-- cho dong bo voi short_description (van giu nguyen logic Pro/Free hien co).
CREATE OR REPLACE FUNCTION search_locations(
  search_query     TEXT    DEFAULT '',
  city_code        TEXT    DEFAULT NULL,
  category_keyword TEXT    DEFAULT NULL
)
RETURNS SETOF locations
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  is_pro boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'pro'
  ) INTO is_pro;

  IF is_pro THEN
    RETURN QUERY
    SELECT l.* FROM locations l
    WHERE l.verified = true
      AND l.is_active = true
      AND (search_query = '' OR unaccent(l.name) ILIKE unaccent('%' || search_query || '%'))
      AND (city_code IS NULL OR l.city = city_code)
      AND (category_keyword IS NULL OR unaccent(coalesce(l.category, '')) ILIKE unaccent('%' || category_keyword || '%'))
    ORDER BY
      CASE WHEN unaccent(l.name) ILIKE unaccent(search_query || '%') THEN 0 ELSE 1 END,
      l.name
    LIMIT 50;
  ELSE
    RETURN QUERY
    SELECT (jsonb_populate_record(
             NULL::locations,
             to_jsonb(l) - ARRAY[
               'address', 'coordinates', 'google_maps_url', 'phone',
               'opening_hours', 'closing_hours', 'off_days',
               'description', 'short_description', 'short_description_en', 'photos'
             ]
           )).*
    FROM locations l
    WHERE l.verified = true
      AND l.is_active = true
      AND (search_query = '' OR unaccent(l.name) ILIKE unaccent('%' || search_query || '%'))
      AND (city_code IS NULL OR l.city = city_code)
      AND (category_keyword IS NULL OR unaccent(coalesce(l.category, '')) ILIKE unaccent('%' || category_keyword || '%'))
    ORDER BY
      CASE WHEN unaccent(l.name) ILIKE unaccent(search_query || '%') THEN 0 ELSE 1 END,
      l.name
    LIMIT 50;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION search_locations(TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION search_locations(TEXT, TEXT, TEXT) TO authenticated;

COMMIT;
