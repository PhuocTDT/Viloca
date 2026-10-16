-- Derive tang free cua locations tu cac cot tang pro da curate.
--
-- Bo sung cho 20260626000000_enrich_locations_fields.sql, migration chua bao gio
-- duoc ap: no trung timestamp voi 20260626000000_alter_locations_table.sql nen bi
-- bo qua hoan toan. `supabase migration list` xac nhan no khong co trong lich su
-- remote, va du lieu xac nhan doc lap: `description` rong 0/70 rows trong khi
-- dong dau cua migration do la UPDATE SET description = short_description.
--
-- Khac voi ban thang 6: dan xuat tu `price_level` va `style_tag` thay vi `category`.
-- `category` la free-text phan cach phay da troi khoi 14 gia tri chuan (ton tai
-- 'Van hoa truyen thong', 'Nghe thuat duong dai', 'Workshop'...) nen khop theo no
-- vo am tham. `price_level` va `style_tag` sach va du 70/70 rows.
--
-- Idempotent: moi UPDATE chi cham row chua xu ly.
-- BEGIN/COMMIT de ap thu cong qua SQL editor (db push dang khong dung duoc —
-- xem change repair-migration-chain).

BEGIN;

-- 1. vibes[] <- style_tag (text phan cach phay)
--    Chi ghi khi vibes dang rong/null, nen chay lai khong nhan ban phan tu.
UPDATE locations
SET vibes = (
      SELECT array_agg(DISTINCT btrim(tag))
      FROM   unnest(string_to_array(style_tag, ',')) AS tag
      WHERE  btrim(tag) <> ''
    )
WHERE is_active = true
  AND style_tag IS NOT NULL
  AND (vibes IS NULL OR cardinality(vibes) = 0);

-- 2. price_per_person (VND) <- price_level (thang 1-4)
--    Band theo design D3. Lam bo loc ngan sach cua plan-trip hoat dong thuc su:
--    hien price_per_person = 0 moi row nen moi dia diem pass moi ngan sach.
UPDATE locations
SET price_per_person = CASE price_level
      WHEN 1 THEN  30000
      WHEN 2 THEN  80000
      WHEN 3 THEN 200000
      WHEN 4 THEN 500000
    END
WHERE is_active = true
  AND price_level BETWEEN 1 AND 4
  AND price_per_person = 0;

-- 3. duration_minutes <- category (best-effort)
--    Khop substring vi category la free-text nhieu gia tri phan cach phay.
--    Thu tu co y nghia: row khop nhieu nhom thi nhom dau tien thang. Row khong
--    khop nhom nao giu 120 — spec cho phep, voi nhieu category thi 120 la dung.
UPDATE locations SET duration_minutes = 60
WHERE is_active = true AND duration_minutes = 120
  AND (category ILIKE '%Café%' OR category ILIKE '%Ẩm thực%');

UPDATE locations SET duration_minutes = 90
WHERE is_active = true AND duration_minutes = 120
  AND (category ILIKE '%Bảo tàng%'   OR category ILIKE '%Di tích%'
    OR category ILIKE '%Nghệ thuật%' OR category ILIKE '%Văn hóa%'
    OR category ILIKE '%Làng nghề%');

UPDATE locations SET duration_minutes = 150
WHERE is_active = true AND duration_minutes = 120
  AND (category ILIKE '%Thiên nhiên%'      OR category ILIKE '%Danh lam%'
    OR category ILIKE '%Du lịch sinh thái%' OR category ILIKE '%Trải nghiệm%'
    OR category ILIKE '%Du lịch cộng đồng%');

COMMIT;
