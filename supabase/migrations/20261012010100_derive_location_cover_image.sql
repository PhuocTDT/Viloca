-- cover_image <- URL dau tien trong `photos` (text phan cach phay).
--
-- `photos` du 70/70 rows va tro tro toi anh that tren S3 (viloca-media).
-- `cover_image` rong 0/70 — day la cot ma view locations_preview expose, nen
-- tang free dang khong co anh nao.
--
-- KHONG dung anh placeholder sinh tu dong. Ban thang 6 set
--   cover_image = 'https://picsum.photos/seed/loc-' || id || '/800/600'
-- tuc anh random khong lien quan toi dia diem. Voi app du lich, anh sai te hon
-- khong co anh: row khong co `photos` thi de cover_image NULL cho UI xu ly
-- trang thai thieu anh.
--
-- Idempotent: chi cham row cover_image dang null.

BEGIN;

UPDATE locations
SET cover_image = btrim(split_part(photos, ',', 1))
WHERE is_active = true
  AND cover_image IS NULL
  AND photos IS NOT NULL
  AND btrim(split_part(photos, ',', 1)) <> '';

COMMIT;
