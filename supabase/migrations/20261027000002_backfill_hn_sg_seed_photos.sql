-- Khôi phục cover_image/photos/images cho các địa điểm seed gốc (HN/SG) đang
-- thiếu ảnh ở local — lấy từ dữ liệu thật trên prod, khớp theo TÊN (không
-- dùng id vì các migration seed gốc tạo id ngẫu nhiên mỗi lần reset,
-- không cố định như migration khôi phục DN/SG sau này).

-- Bảo Tàng Chứng Tích Chiến Tranh (prod: Bảo tàng Chứng tích Chiến tranh)
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/bao-tang-chung-tich-chien-tranh/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/bao-tang-chung-tich-chien-tranh/1.jpg', images = ARRAY[]::text[] WHERE name = 'Bảo Tàng Chứng Tích Chiến Tranh';
-- Bảo Tàng Dân Tộc Học Việt Nam
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/bao-tang-dan-toc/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/bao-tang-dan-toc/1.jpg', images = ARRAY[]::text[] WHERE name = 'Bảo Tàng Dân Tộc Học Việt Nam';
-- Bảo Tàng Điêu Khắc Chăm
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/bao-tang-dieu-khac-cham/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/bao-tang-dieu-khac-cham/1.jpg', images = ARRAY[]::text[] WHERE name = 'Bảo Tàng Điêu Khắc Chăm';
-- Bảo Tàng Đồng Đình
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/bao-tang-dong-dinh/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/bao-tang-dong-dinh/1.jpg', images = ARRAY[]::text[] WHERE name = 'Bảo Tàng Đồng Đình';
-- Bảo Tàng Gốm Bát Tràng
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/bao-tang-gom-bat-trang/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/bao-tang-gom-bat-trang/1.jpg', images = ARRAY[]::text[] WHERE name = 'Bảo Tàng Gốm Bát Tràng';
-- Bảo Tàng Lịch Sử TP. Hồ Chí Minh (prod: Bảo tàng Lịch sử TP. Hồ Chí Minh)
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/bao-tang-lich-su-tp-ho-chi-minh/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/bao-tang-lich-su-tp-ho-chi-minh/1.jpg', images = ARRAY[]::text[] WHERE name = 'Bảo Tàng Lịch Sử TP. Hồ Chí Minh';
-- Bảo Tàng Văn Hóa Sa Huỳnh
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/bao-tang-sa-huynh/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/bao-tang-sa-huynh/1.jpg', images = ARRAY[]::text[] WHERE name = 'Bảo Tàng Văn Hóa Sa Huỳnh';
-- Bếp Cuốn
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/bep-cuon/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/bep-cuon/1.jpg', images = ARRAY[]::text[] WHERE name = 'Bếp Cuốn';
-- Bưu Điện Trung Tâm Sài Gòn (prod: Bưu điện Trung tâm Sài Gòn)
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/buu-dien-trung-tam-sai-gon/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/buu-dien-trung-tam-sai-gon/1.jpg', images = ARRAY[]::text[] WHERE name = 'Bưu Điện Trung Tâm Sài Gòn';
-- Cầu Long Biên
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/cau-long-bien/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/cau-long-bien/1.jpg,https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/cau-long-bien/2.jpg', images = ARRAY[]::text[] WHERE name = 'Cầu Long Biên';
-- Chợ Bến Thành
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/cho-ben-thanh/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/cho-ben-thanh/1.jpg', images = ARRAY[]::text[] WHERE name = 'Chợ Bến Thành';
-- Chợ Đồng Xuân
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/cho-dong-xuan/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/cho-dong-xuan/1.jpg', images = ARRAY[]::text[] WHERE name = 'Chợ Đồng Xuân';
-- Cổng Trời Đông Giang
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/cong-troi-dong-giang/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/cong-troi-dong-giang/1.jpg', images = ARRAY[]::text[] WHERE name = 'Cổng Trời Đông Giang';
-- Công Viên Đất Nung Thanh Hà
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/cong-vien-dat-nung/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/cong-vien-dat-nung/1.jpg', images = ARRAY[]::text[] WHERE name = 'Công Viên Đất Nung Thanh Hà';
-- Cột Cờ Hà Nội (Kỳ Đài)
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/cot-co-ha-noi/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/cot-co-ha-noi/1.jpg', images = ARRAY[]::text[] WHERE name = 'Cột Cờ Hà Nội (Kỳ Đài)';
-- Dinh Độc Lập
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/dinh-doc-lap/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/dinh-doc-lap/1.jpg', images = ARRAY[]::text[] WHERE name = 'Dinh Độc Lập';
-- Gióng Café
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/giong-cafe/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/giong-cafe/1.jpg', images = ARRAY[]::text[] WHERE name = 'Gióng Café';
-- Hàng Gánh
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/hang-ganh/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/hang-ganh/1.jpg', images = ARRAY[]::text[] WHERE name = 'Hàng Gánh';
-- Hồ Hoàn Kiếm (Hồ Gươm)
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/ho-hoan-kiem/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/ho-hoan-kiem/1.jpg', images = ARRAY[]::text[] WHERE name = 'Hồ Hoàn Kiếm (Hồ Gươm)';
-- Hoàng Thành Thăng Long
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/hoang-thanh-thang-long/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/hoang-thanh-thang-long/1.jpg', images = ARRAY[]::text[] WHERE name = 'Hoàng Thành Thăng Long';
-- Hội Quán Phước Kiến
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/hoi-quan-phuoc-kien/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/hoi-quan-phuoc-kien/1.jpg', images = ARRAY[]::text[] WHERE name = 'Hội Quán Phước Kiến';
-- Homestay Alang Nhu
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/homestay-alang-nhu/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/homestay-alang-nhu/1.jpg', images = ARRAY[]::text[] WHERE name = 'Homestay Alang Nhu';
-- Khu Di Tích Phủ Chủ Tịch (Nhà Sàn Bác Hồ)
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/khu-phu-chu-tich/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/khu-phu-chu-tich/1.jpg', images = ARRAY[]::text[] WHERE name = 'Khu Di Tích Phủ Chủ Tịch (Nhà Sàn Bác Hồ)';
-- Ký Ức Hội An
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/ky-uc-hoi-an/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/ky-uc-hoi-an/1.jpg', images = ARRAY[]::text[] WHERE name = 'Ký Ức Hội An';
-- Lăng Chủ Tịch Hồ Chí Minh
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/lang-chu-tich-hcm/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/lang-chu-tich-hcm/1.jpg,https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/lang-chu-tich-hcm/2.jpg,https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/lang-chu-tich-hcm/3.jpg', images = ARRAY[]::text[] WHERE name = 'Lăng Chủ Tịch Hồ Chí Minh';
-- Làng Củi Lũ Hội An (Driftwood Village)
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/lang-cui-lu-hoi-an/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/lang-cui-lu-hoi-an/1.jpg', images = ARRAY[]::text[] WHERE name = 'Làng Củi Lũ Hội An (Driftwood Village)';
-- Làng Mộc Kim Bồng
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/lang-moc-kim-bong/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/lang-moc-kim-bong/1.jpg', images = ARRAY[]::text[] WHERE name = 'Làng Mộc Kim Bồng';
-- Làng Nghề Tăm Hương Quảng Phú Cầu
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/lang-nghe-quang-phu-cau/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/lang-nghe-quang-phu-cau/1.jpg', images = ARRAY[]::text[] WHERE name = 'Làng Nghề Tăm Hương Quảng Phú Cầu';
-- Làng Rau Trà Quế
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/lang-rau-tra-que/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/lang-rau-tra-que/1.jpg', images = ARRAY[]::text[] WHERE name = 'Làng Rau Trà Quế';
-- Làng Toom Sara
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/lang-toom-sara/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/lang-toom-sara/1.jpg', images = ARRAY[]::text[] WHERE name = 'Làng Toom Sara';
-- Leaf Village & Farm
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/leaf-village-farm/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/leaf-village-farm/1.jpg', images = ARRAY[]::text[] WHERE name = 'Leaf Village & Farm';
-- Ngon Phố Đà
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/ngon-pho-da/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/ngon-pho-da/1.jpg', images = ARRAY[]::text[] WHERE name = 'Ngon Phố Đà';
-- Ngon Thị Hoa Restaurant
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/ngon-thi-hoa/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/ngon-thi-hoa/1.jpg', images = ARRAY[]::text[] WHERE name = 'Ngon Thị Hoa Restaurant';
-- Nhà Cổ Tân Kỳ
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/nha-co-tan-ky/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/nha-co-tan-ky/1.jpg', images = ARRAY[]::text[] WHERE name = 'Nhà Cổ Tân Kỳ';
-- Nhà Gỗ Villa
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/nha-go-villa/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/nha-go-villa/1.jpg', images = ARRAY[]::text[] WHERE name = 'Nhà Gỗ Villa';
-- Nhà Hàng Café Trúc Lâm Viên
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/truc-lam-vien/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/truc-lam-vien/1.jpg', images = ARRAY[]::text[] WHERE name = 'Nhà Hàng Café Trúc Lâm Viên';
-- Nhà Hát Lớn Hà Nội
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/nha-hat-lon-ha-noi/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/nha-hat-lon-ha-noi/1.jpg', images = ARRAY[]::text[] WHERE name = 'Nhà Hát Lớn Hà Nội';
-- Nhà Hát Múa Rối Thăng Long
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/nha-hat-mua-roi/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/nha-hat-mua-roi/1.jpg', images = ARRAY[]::text[] WHERE name = 'Nhà Hát Múa Rối Thăng Long';
-- Nhà Tù Hỏa Lò
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/nha-tu-hoa-lo/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/nha-tu-hoa-lo/1.jpg', images = ARRAY[]::text[] WHERE name = 'Nhà Tù Hỏa Lò';
-- Ô Quan Chưởng
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/o-quan-chuong/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/o-quan-chuong/1.jpg', images = ARRAY[]::text[] WHERE name = 'Ô Quan Chưởng';
-- Rừng Dừa Bảy Mẫu
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/rung-dua-bay-mau/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/rung-dua-bay-mau/1.jpg', images = ARRAY[]::text[] WHERE name = 'Rừng Dừa Bảy Mẫu';
-- The Farmers
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/the-farmers/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/the-farmers/1.jpg', images = ARRAY[]::text[] WHERE name = 'The Farmers';
-- The Hang Art
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/the-hang-art/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/the-hang-art/1.jpg', images = ARRAY[]::text[] WHERE name = 'The Hang Art';
-- The Heritage Show
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/the-heritage-show/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/the-heritage-show/1.jpg', images = ARRAY[]::text[] WHERE name = 'The Heritage Show';
-- Trung Tâm Văn Hóa Du Lịch Cộng Đồng Tà Lang - Giàn Bí
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/ta-lang-gian-bi/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/DN/ta-lang-gian-bi/1.jpg', images = ARRAY[]::text[] WHERE name = 'Trung Tâm Văn Hóa Du Lịch Cộng Đồng Tà Lang - Giàn Bí';
-- Văn Miếu - Quốc Tử Giám
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/van-mieu-quoc-tu-giam/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/HN/van-mieu-quoc-tu-giam/1.jpg', images = ARRAY[]::text[] WHERE name = 'Văn Miếu - Quốc Tử Giám';
-- Nhà Hát Thành Phố Hồ Chí Minh (prod: Nhà hát Thành phố)
UPDATE public.locations SET cover_image = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/nha-hat-thanh-pho/1.jpg', photos = 'https://viloca-media.s3.ap-southeast-1.amazonaws.com/locations/SG/nha-hat-thanh-pho/1.jpg', images = ARRAY[]::text[] WHERE name = 'Nhà Hát Thành Phố Hồ Chí Minh';
