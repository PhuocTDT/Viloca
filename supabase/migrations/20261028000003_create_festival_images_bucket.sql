-- Bucket cho ảnh bìa lễ hội (nội dung do quản trị/service_role quản lý, không phải
-- user tự upload — khác avatars/post-images vốn do chính user ghi).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'festival-images',
  'festival-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "festival_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'festival-images');

CREATE POLICY "festival_images_service_write"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'festival-images')
  WITH CHECK (bucket_id = 'festival-images');
