-- Chuan hoa locations.vibes va reseed bang `vibes`.
--
-- SAI LECH SO VOI DESIGN D4 — da duoc nguoi duyet.
-- Design chi noi "nguong >=3 dia diem". Du lieu thuc do sau khi derive (task 7.1)
-- doi hoi them hai buoc nua:
--
--   184 vibe phan biet tu 70 dia diem, duoi dai 135 cai chi xuat hien 1 lan
--   -> gom bien the hoa/thuong : 184 -> 168   (16 nhom bi tach chi vi case:
--                                              'Yen tinh'/'yen tinh', 'Nghe thuat'/'nghe thuat'...)
--   -> nguong >= 3             :  25 vibe
--   -> loai trung category + dia danh: 25 -> 17 vibe that
--
-- Khong gom case thi chip hien hai lan cung mot vibe, va overlaps() trong
-- plan-trip truot match giua 'Yen tinh' va 'yen tinh'. Khong loai denylist thi
-- chip 'Bao tang'/'Lang nghe' dung canh chip category cung ten, con 'Hoi An' va
-- 'Di san UNESCO' thi la dia danh chu khong phai vibe.
--
-- LUU Y VE CACH GOM CASE: KHONG dung initcap(). Tieng Viet viet theo sentence
-- case, nen initcap() bien 'Lich su' thanh 'Lich Su' va 'Kien truc Phap' thanh
-- 'Kien Truc Phap' — sai quy uoc va lam hong danh tu rieng. Thay vao do gom moi
-- bien the ve DANG PHO BIEN NHAT da ton tai trong du lieu (hoa thang thuong khi
-- bang diem), nen 'Kien truc Phap' giu nguyen.
--
-- Da ap len production qua REST (REST chi lam DML; file nay la ban ghi chinh thuc
-- cho ai dung lai DB tu dau). Khong dung duoc `supabase db push` — xem change
-- repair-migration-chain.

BEGIN;

-- 1. Gom bien the case ve dang pho bien nhat.
WITH tags AS (
  SELECT l.id AS loc_id, btrim(t) AS tag
  FROM   locations l, unnest(l.vibes) AS t
  WHERE  l.is_active = true AND btrim(t) <> ''
),
-- dang pho bien nhat cho moi khoa chu-thuong; hoa thang thuong khi bang diem
canonical AS (
  SELECT DISTINCT ON (lower(tag))
         lower(tag) AS key,
         tag        AS form
  FROM   tags
  GROUP  BY lower(tag), tag
  ORDER  BY lower(tag),
            COUNT(*) DESC,
            (tag ~ '^[[:upper:]]') DESC,
            tag
),
rebuilt AS (
  SELECT t.loc_id, array_agg(DISTINCT c.form) AS vibes
  FROM   tags t
  JOIN   canonical c ON c.key = lower(t.tag)
  GROUP  BY t.loc_id
)
UPDATE locations l
SET    vibes = r.vibes
FROM   rebuilt r
WHERE  l.id = r.loc_id
  AND  l.vibes IS DISTINCT FROM r.vibes;

-- 2. Reseed bang `vibes` tu cac vibe dat nguong, tru denylist.
TRUNCATE vibes RESTART IDENTITY;

INSERT INTO vibes (name, sort_order, is_active)
SELECT   v.name,
         (ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, v.name) * 10)::INTEGER,
         true
FROM     locations, unnest(vibes) AS v(name)
WHERE    is_active = true
  AND    btrim(v.name) <> ''
  -- trung ten 14 category chuan: da co chip category rieng
  AND    lower(btrim(v.name)) NOT IN (
           'ẩm thực','café','di tích lịch sử','bảo tàng','di tích tín ngưỡng',
           'văn hóa','nghệ thuật','thiên nhiên','danh lam thắng cảnh',
           'du lịch sinh thái','du lịch cộng đồng','làng nghề','trải nghiệm','lưu trú'
         )
  -- dia danh va nhan di san: khong phai vibe
  AND    lower(btrim(v.name)) NOT IN (
           'hội an','sài gòn','hà nội','đà nẵng','di sản unesco','văn hóa cơ tu'
         )
GROUP BY v.name
HAVING   COUNT(*) >= 3
ON CONFLICT (name) DO NOTHING;

COMMIT;
