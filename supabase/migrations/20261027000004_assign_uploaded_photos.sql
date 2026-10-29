-- Gán ảnh thật (user tải thủ công, upload vào bucket location-images local)
-- cho 17 địa điểm còn thiếu ảnh sau khi đối chiếu prod không có.
--
-- Bọc EXISTS vào storage.objects: URL localhost (127.0.0.1:55321) chỉ đúng
-- trên máy dev local — trên môi trường khác (vd prod), các object này chưa
-- từng được upload vào bucket với đúng tên file, nên EXISTS sẽ false và
-- UPDATE trở thành no-op an toàn, không ghi URL vỡ vào DB môi trường đó.

-- Bảo Tàng Lịch Sử Quân Sự Việt Nam
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-lich-su-quan-su-viet-nam.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-lich-su-quan-su-viet-nam.jpg' WHERE name = 'Bảo Tàng Lịch Sử Quân Sự Việt Nam' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'bao-tang-lich-su-quan-su-viet-nam.jpg');
-- Bảo Tàng Mỹ Thuật Việt Nam
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-my-thuat-viet-nam.webp', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-my-thuat-viet-nam.webp' WHERE name = 'Bảo Tàng Mỹ Thuật Việt Nam' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'bao-tang-my-thuat-viet-nam.webp');
-- Bảo Tàng Phụ Nữ Việt Nam
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-phu-nu-viet-nam.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-phu-nu-viet-nam.jpg' WHERE name = 'Bảo Tàng Phụ Nữ Việt Nam' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'bao-tang-phu-nu-viet-nam.jpg');
-- Chùa Hương
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/chua-huong.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/chua-huong.jpg' WHERE name = 'Chùa Hương' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'chua-huong.jpg');
-- Chùa Một Cột
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/chua-mot-cot.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/chua-mot-cot.jpg' WHERE name = 'Chùa Một Cột' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'chua-mot-cot.jpg');
-- Chợ Đêm Phố Cổ (Hàng Đào - Đồng Xuân)
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/cho-dem-pho-co.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/cho-dem-pho-co.jpg' WHERE name = 'Chợ Đêm Phố Cổ (Hàng Đào - Đồng Xuân)' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'cho-dem-pho-co.jpg');
-- EVERY HALF
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/every-half.jpeg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/every-half.jpeg' WHERE name = 'EVERY HALF' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'every-half.jpeg');
-- Hanoi Ca Trù Club (Đền Kim Ngân)
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/hanoi-ca-tru-club.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/hanoi-ca-tru-club.jpg' WHERE name = 'Hanoi Ca Trù Club (Đền Kim Ngân)' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'hanoi-ca-tru-club.jpg');
-- Hồ Tây (Đường Thanh Niên)
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/ho-tay.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/ho-tay.jpg' WHERE name = 'Hồ Tây (Đường Thanh Niên)' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'ho-tay.jpg');
-- Làng Cổ Đường Lâm (Đình Mông Phụ & Nhà Cổ)
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/lang-co-duong-lam.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/lang-co-duong-lam.jpg' WHERE name = 'Làng Cổ Đường Lâm (Đình Mông Phụ & Nhà Cổ)' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'lang-co-duong-lam.jpg');
-- Nhà Thờ Lớn Hà Nội
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/nha-tho-lon-ha-noi.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/nha-tho-lon-ha-noi.jpg' WHERE name = 'Nhà Thờ Lớn Hà Nội' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'nha-tho-lon-ha-noi.jpg');
-- Phố Bia Hơi Tạ Hiện
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/pho-bia-hoi-ta-hien.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/pho-bia-hoi-ta-hien.jpg' WHERE name = 'Phố Bia Hơi Tạ Hiện' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'pho-bia-hoi-ta-hien.jpg');
-- Phố Đi Bộ Hồ Hoàn Kiếm
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/pho-di-bo-ho-hoan-kiem.webp', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/pho-di-bo-ho-hoan-kiem.webp' WHERE name = 'Phố Đi Bộ Hồ Hoàn Kiếm' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'pho-di-bo-ho-hoan-kiem.webp');
-- Thành Cổ Loa
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/thanh-co-loa.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/thanh-co-loa.jpg' WHERE name = 'Thành Cổ Loa' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'thanh-co-loa.jpg');
-- Vườn Quốc Gia Ba Vì
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/vuon-quoc-gia-ba-vi.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/vuon-quoc-gia-ba-vi.jpg' WHERE name = 'Vườn Quốc Gia Ba Vì' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'vuon-quoc-gia-ba-vi.jpg');
-- Đình Vạn Phúc & Con Đường Ô
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/dinh-van-phuc.webp', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/dinh-van-phuc.webp' WHERE name = 'Đình Vạn Phúc & Con Đường Ô' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'dinh-van-phuc.webp');
-- Đền Ngọc Sơn & Cầu Thê Húc
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/den-ngoc-son-cau-the-huc.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/den-ngoc-son-cau-the-huc.jpg' WHERE name = 'Đền Ngọc Sơn & Cầu Thê Húc' AND EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'location-images' AND name = 'den-ngoc-son-cau-the-huc.jpg');
