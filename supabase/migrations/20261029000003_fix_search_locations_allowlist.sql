-- search_locations dùng denylist (to_jsonb(l) - ARRAY[...]) cho nhánh free user,
-- nên bất kỳ cột nào không có trong danh sách đó sẽ tự động lộ ra — đã lộ
-- long_description, structured_opening_hours, rating, travel_region,
-- shelter_type, weather_exposure... Đổi sang allowlist khớp đúng các cột của
-- view `locations_preview` (an toàn theo mặc định: cột mới thêm sau này
-- không tự lộ nếu không được thêm tay vào đây).
CREATE OR REPLACE FUNCTION public.search_locations(
  search_query text DEFAULT ''::text,
  city_code text DEFAULT NULL::text,
  category_keyword text DEFAULT NULL::text
)
RETURNS SETOF locations
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
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
             jsonb_build_object(
               'id', l.id,
               'name', l.name,
               'name_en', l.name_en,
               'city', l.city,
               'district', l.district,
               'category', l.category,
               'style_tag', l.style_tag,
               'vibes', l.vibes,
               'hint', l.hint,
               'hint_en', l.hint_en,
               'cover_image', l.cover_image,
               'images', l.images,
               'is_featured', l.is_featured,
               'price_per_person', l.price_per_person,
               'duration_minutes', l.duration_minutes
             )
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
$function$;
