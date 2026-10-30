-- Preflight check cho create-trip: đếm địa điểm theo điểm đến. Trước đây
-- client tự query `locations`/`locations_preview` rồi ilike('address', ...) —
-- view preview không có cột `address` nên free user chọn điểm đến không có mã
-- thành phố (vd Quảng Nam) luôn bị báo "chưa có dữ liệu" dù thực ra có. Đưa
-- việc đếm vào RPC chạy quyền nâng cao để match theo address mà không cần
-- lộ cột address ra client (chỉ trả về số lượng).
CREATE OR REPLACE FUNCTION public.count_locations_by_destination(
  p_city_code TEXT,
  p_destination TEXT
)
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*)::int FROM public.locations
  WHERE is_active = true
    AND (
      (p_city_code IS NOT NULL AND city = p_city_code)
      OR (p_city_code IS NULL AND address ILIKE '%' || p_destination || '%')
    );
$$;

REVOKE ALL ON FUNCTION public.count_locations_by_destination(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_locations_by_destination(TEXT, TEXT) TO authenticated;
