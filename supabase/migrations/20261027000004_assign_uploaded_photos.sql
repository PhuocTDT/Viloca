-- Gán ảnh thật (user tải thủ công, upload vào bucket location-images local)
-- cho 17 địa điểm còn thiếu ảnh sau khi đối chiếu prod không có.

-- Bảo Tàng Lịch Sử Quân Sự Việt Nam
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-lich-su-quan-su-viet-nam.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-lich-su-quan-su-viet-nam.jpg' WHERE name = 'Bảo Tàng Lịch Sử Quân Sự Việt Nam';
-- Bảo Tàng Mỹ Thuật Việt Nam
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-my-thuat-viet-nam.webp', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-my-thuat-viet-nam.webp' WHERE name = 'Bảo Tàng Mỹ Thuật Việt Nam';
-- Bảo Tàng Phụ Nữ Việt Nam
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-phu-nu-viet-nam.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/bao-tang-phu-nu-viet-nam.jpg' WHERE name = 'Bảo Tàng Phụ Nữ Việt Nam';
-- Chùa Hương
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/chua-huong.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/chua-huong.jpg' WHERE name = 'Chùa Hương';
-- Chùa Một Cột
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/chua-mot-cot.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/chua-mot-cot.jpg' WHERE name = 'Chùa Một Cột';
-- Chợ Đêm Phố Cổ (Hàng Đào - Đồng Xuân)
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/cho-dem-pho-co.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/cho-dem-pho-co.jpg' WHERE name = 'Chợ Đêm Phố Cổ (Hàng Đào - Đồng Xuân)';
-- EVERY HALF
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/every-half.jpeg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/every-half.jpeg' WHERE name = 'EVERY HALF';
-- Hanoi Ca Trù Club (Đền Kim Ngân)
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/hanoi-ca-tru-club.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/hanoi-ca-tru-club.jpg' WHERE name = 'Hanoi Ca Trù Club (Đền Kim Ngân)';
-- Hồ Tây (Đường Thanh Niên)
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/ho-tay.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/ho-tay.jpg' WHERE name = 'Hồ Tây (Đường Thanh Niên)';
-- Làng Cổ Đường Lâm (Đình Mông Phụ & Nhà Cổ)
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/lang-co-duong-lam.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/lang-co-duong-lam.jpg' WHERE name = 'Làng Cổ Đường Lâm (Đình Mông Phụ & Nhà Cổ)';
-- Nhà Thờ Lớn Hà Nội
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/nha-tho-lon-ha-noi.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/nha-tho-lon-ha-noi.jpg' WHERE name = 'Nhà Thờ Lớn Hà Nội';
-- Phố Bia Hơi Tạ Hiện
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/pho-bia-hoi-ta-hien.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/pho-bia-hoi-ta-hien.jpg' WHERE name = 'Phố Bia Hơi Tạ Hiện';
-- Phố Đi Bộ Hồ Hoàn Kiếm
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/pho-di-bo-ho-hoan-kiem.webp', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/pho-di-bo-ho-hoan-kiem.webp' WHERE name = 'Phố Đi Bộ Hồ Hoàn Kiếm';
-- Thành Cổ Loa
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/thanh-co-loa.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/thanh-co-loa.jpg' WHERE name = 'Thành Cổ Loa';
-- Vườn Quốc Gia Ba Vì
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/vuon-quoc-gia-ba-vi.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/vuon-quoc-gia-ba-vi.jpg' WHERE name = 'Vườn Quốc Gia Ba Vì';
-- Đình Vạn Phúc & Con Đường Ô
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/dinh-van-phuc.webp', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/dinh-van-phuc.webp' WHERE name = 'Đình Vạn Phúc & Con Đường Ô';
-- Đền Ngọc Sơn & Cầu Thê Húc
UPDATE public.locations SET cover_image = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/den-ngoc-son-cau-the-huc.jpg', photos = 'http://127.0.0.1:55321/storage/v1/object/public/location-images/den-ngoc-son-cau-the-huc.jpg' WHERE name = 'Đền Ngọc Sơn & Cầu Thê Húc';
