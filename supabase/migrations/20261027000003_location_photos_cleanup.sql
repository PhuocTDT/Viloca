-- Bỏ 6 địa điểm không tồn tại trên prod và cũng không có ảnh (theo yêu cầu dọn dữ liệu).
DELETE FROM public.locations WHERE name IN (
  'Chùa Tây Phương',
  'Chùa Thầy',
  'Chùa Trấn Quốc',
  'Đền Bạch Mã',
  'Đền Quán Thánh',
  'Trung Tâm Văn Hóa Nghệ Thuật 22 Hàng Buồm'
);

-- Bucket lưu ảnh địa điểm (public) — app thật dùng S3 ngoài (viloca-media.s3...),
-- bucket này chỉ phục vụ dev local để có nơi lưu ảnh thật người dùng tải về thủ công.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'location-images',
  'location-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "location_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'location-images');

CREATE POLICY "location_images_insert_authenticated"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'location-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "location_images_update_authenticated"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'location-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "location_images_delete_authenticated"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'location-images' AND auth.uid() IS NOT NULL);
