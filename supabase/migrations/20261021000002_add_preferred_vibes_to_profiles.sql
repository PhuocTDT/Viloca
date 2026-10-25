-- Onboarding quiz: luu phong cach du lich nguoi dung chon ngay lan dau (Giai
-- doan B). Them moi, co default, khong anh huong du lieu hien co va khong
-- dong policy nao cua `locations`.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_vibes TEXT[] NOT NULL DEFAULT '{}';
