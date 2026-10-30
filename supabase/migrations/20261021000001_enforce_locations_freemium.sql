-- Thuc thi freemium tren bang `locations` o phia server.
--
-- Van de: policy `public_read_locations` (20260627000002, using (true)) van con,
-- va RLS OR cac policy permissive voi nhau, nen `pro_users_read_locations`
-- (20260921000002) khong co tac dung — ai cung doc duoc moi cot, ke ca khi chua
-- dang nhap. `search_locations` la SECURITY DEFINER tra ve SETOF locations nen
-- cung lo ca hang day du.
--
-- Migration nay:
--   1. Go `public_read_locations`; chi con policy cho Pro, policy doc dia diem
--      trong trip cua chinh minh, va service_role ghi.
--   2. Mo rong `locations_preview` them cac cot "the card" de Home/Search van
--      hien thi duoc cho Free: name, city, district, style_tag, is_featured.
--      (QUYET DINH SAN PHAM: Free thay ten + khu vuc + phong cach cua dia diem,
--      KHONG thay address, coordinates, google_maps_url, phone, gio mo cua,
--      mo ta, photos. Neu muon an ca ten thi bo `name` khoi view va doi UI.)
--   3. Viet lai `search_locations`: Pro nhan hang day du, Free nhan hang da bi
--      che cac cot premium.
--
-- CHUA DUOC AP DUNG. Chay thu cong tren staging truoc, kiem tra bang tai khoan
-- Free va Pro, roi moi chay tren production. Client (src/lib/location-access.ts)
-- chay dung ca truoc va sau migration nay.

BEGIN;

-- 1. Dong cua doc cong khai ---------------------------------------------------
DROP POLICY IF EXISTS "public_read_locations" ON locations;
DROP POLICY IF EXISTS "authenticated_read_locations" ON locations;

-- Tao lai de migration chay lap lai duoc va khong phu thuoc thu tu file trung timestamp.
DROP POLICY IF EXISTS "pro_users_read_locations" ON locations;
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

-- Moi nguoi dung doc duoc day du cac dia diem nam trong lich trinh CUA CHINH HO:
-- man hinh trip/[id] nhung `locations(name, address, coordinates, ...)` vao
-- trip_items, neu thieu policy nay Free se thay lich trinh trong tron. Danh doi:
-- Free co the them mot dia diem vao trip de mo khoa hang day du cua no.
DROP POLICY IF EXISTS "users_read_own_trip_locations" ON locations;
CREATE POLICY "users_read_own_trip_locations"
  ON locations FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1
      FROM public.trip_items ti
      JOIN public.trips t ON t.id = ti.trip_id
      WHERE ti.location_id = locations.id AND t.user_id = auth.uid()
    )
  );

-- 2. View cho Free --------------------------------------------------------------
-- security_invoker = false: view chay voi quyen chu so huu nen vuot RLS cua bang,
-- nhung chi lo dung cac cot liet ke duoi day.
DROP VIEW IF EXISTS locations_preview;

CREATE VIEW locations_preview
  WITH (security_invoker = false)
AS
  SELECT
    id,
    name,
    city,
    district,
    category,
    style_tag,
    vibes,
    hint,
    cover_image,
    images,
    is_featured,
    price_per_person,
    duration_minutes
  FROM locations
  WHERE is_active = true;

GRANT SELECT ON locations_preview TO authenticated;
-- Khong cap cho `anon`: phai dang nhap moi xem duoc danh sach.
REVOKE ALL ON locations_preview FROM anon;

-- 3. search_locations theo goi ------------------------------------------------------
-- Giu nguyen kieu tra ve (SETOF locations) de client khong phai doi. Voi Free, cac
-- cot premium duoc gan NULL bang jsonb_populate_record nen khong phu thuoc thu tu cot.
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
               'description', 'short_description', 'photos'
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

-- Kiem tra sau khi chay (dang nhap bang tai khoan Free, roi Pro):
--   select count(*) from locations;                      -- Free: 0, Pro: > 0
--   select name, city from locations_preview limit 3;    -- ca hai: co du lieu
--   select address, coordinates from search_locations('') limit 3;  -- Free: NULL, Pro: co gia tri
-- Hoan tac: tao lai policy `public_read_locations` (using (true)) va view/ham cu.
