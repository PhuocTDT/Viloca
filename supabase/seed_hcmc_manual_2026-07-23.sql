-- HCMC locations — curated manually
-- 23 địa điểm mới (chưa có trong Supabase)
-- Review trước khi chạy: verified = false
-- Generated: 2026-07-23

INSERT INTO locations (city, name, district, address, google_maps_url, category, style_tag, price_level, opening_hours, closing_hours, off_days, phone, short_description, long_description, photos, verified, is_active, coordinates) VALUES

-- ─── BẢO TÀNG ────────────────────────────────────────────────────────────────

(
  'SG', 'Bảo Tàng Mỹ Thuật TP.HCM', 'Quận 1',
  '97A Phó Đức Chính, P. Nguyễn Thái Bình, Quận 1',
  NULL, 'Bảo tàng', 'nghệ thuật, Art Deco, sáng tạo',
  1, '09:00', '17:00', 'Thứ 2', '028 3821 3558',
  'Tòa nhà Art Deco 3 tầng trưng bày tranh và điêu khắc Việt Nam từ đầu thế kỷ 20 đến nay — ẩn đẹp giữa phố cổ.',
  NULL, NULL, false, true,
  '{"lat": 10.7720, "lng": 106.6987}'::jsonb
),

(
  'SG', 'Bảo Tàng Phụ Nữ Nam Bộ', 'Quận 3',
  '202 Võ Thị Sáu, P.7, Quận 3',
  NULL, 'Bảo tàng', 'lịch sử, văn hóa, cảm hứng',
  1, '07:30', '17:00', 'Thứ 2', '028 3932 5334',
  'Hơn 18.000 hiện vật tôn vinh đóng góp của phụ nữ Việt Nam qua hai cuộc kháng chiến — thường bị bỏ qua nhưng rất đáng ghé.',
  NULL, NULL, false, true,
  '{"lat": 10.7839, "lng": 106.6882}'::jsonb
),

(
  'SG', 'Bảo Tàng Hồ Chí Minh (Bến Nhà Rồng)', 'Quận 4',
  '1 Nguyễn Tất Thành, P.12, Quận 4',
  NULL, 'Bảo tàng', 'cách mạng, bến cảng, biểu tượng',
  1, '07:30', '17:00', 'Thứ 2', '028 3940 1039',
  'Bến Nhà Rồng lịch sử — nơi Bác Hồ xuất dương năm 1911. View sông Sài Gòn đẹp và ít khách du lịch hơn trung tâm.',
  NULL, NULL, false, true,
  '{"lat": 10.7673, "lng": 106.7047}'::jsonb
),

(
  'SG', 'Bảo Tàng TP.HCM', 'Quận 1',
  '65 Lý Tự Trọng, P. Bến Nghé, Quận 1',
  NULL, 'Bảo tàng', 'lịch sử đô thị, kiến trúc Pháp',
  1, '08:00', '17:00', 'Thứ 2', '028 3829 9741',
  'Dinh thự Pháp cổ kể câu chuyện hình thành và phát triển của Sài Gòn từ thế kỷ 17 — ít người biết nhưng rất thú vị.',
  NULL, NULL, false, true,
  '{"lat": 10.7754, "lng": 106.7003}'::jsonb
),

-- ─── DI TÍCH & KHU DU LỊCH ───────────────────────────────────────────────────

(
  'SG', 'Nhà Thờ Đức Bà Sài Gòn', 'Quận 1',
  '01 Công Xã Paris, P. Bến Nghé, Quận 1',
  NULL, 'Di tích tín ngưỡng', 'Gothic, iconic, sống ảo',
  1, '08:00', '16:30', NULL, '028 3822 0477',
  'Nhà thờ Gothic Romanesque xây 1880 là trái tim của Sài Gòn — góc sống ảo kinh điển và là điểm check-in không thể bỏ qua.',
  NULL, NULL, false, true,
  '{"lat": 10.7797, "lng": 106.6990}'::jsonb
),

(
  'SG', 'Thảo Cầm Viên Sài Gòn', 'Quận 1',
  '2 Nguyễn Bỉnh Khiêm, P. Đa Kao, Quận 1',
  NULL, 'Thiên nhiên', 'thiên nhiên, gia đình, cổ xưa',
  1, '07:00', '18:00', NULL, '028 3829 3928',
  'Vườn thú lâu đời nhất Đông Nam Á (1864) — lá phổi xanh giữa lòng Sài Gòn với hơn 600 loài động vật và hàng nghìn cây cổ thụ.',
  NULL, NULL, false, true,
  '{"lat": 10.7882, "lng": 106.7040}'::jsonb
),

(
  'SG', 'Địa Đạo Củ Chi', 'Củ Chi',
  'Ấp Phú Hiệp, Phú Mỹ Hưng, Củ Chi, TP.HCM',
  NULL, 'Di tích lịch sử', 'lịch sử, phiêu lưu, trải nghiệm',
  1, '07:00', '17:00', NULL, '028 3794 8830',
  'Hệ thống địa đạo 250km là kỳ tích của quân dân miền Nam — du khách có thể chui hầm, thử bắn súng và cảm nhận lịch sử thực sự.',
  NULL, NULL, false, true,
  '{"lat": 10.9999, "lng": 106.4669}'::jsonb
),

(
  'SG', 'Chùa Ngọc Hoàng (Phước Hải Tự)', 'Quận 1',
  '73 Mai Thị Lựu, P. Đa Kao, Quận 1',
  NULL, 'Di tích tín ngưỡng', 'tâm linh, kiến trúc, yên bình',
  1, '07:00', '18:00', NULL, NULL,
  'Chùa Đạo giáo 130 tuổi với điêu khắc tinh xảo và hương khói nghi ngút — được TT Obama ghé thăm 2016, nổi tiếng với khách quốc tế.',
  NULL, NULL, false, true,
  '{"lat": 10.7902, "lng": 106.6997}'::jsonb
),

(
  'SG', 'Chùa Bà Thiên Hậu (Tuệ Thành Hội Quán)', 'Quận 5',
  '710 Nguyễn Trãi, P.11, Quận 5',
  NULL, 'Di tích tín ngưỡng', 'người Hoa, tâm linh, kiến trúc cổ',
  1, '06:00', '17:30', NULL, NULL,
  'Hội quán Quảng Đông từ năm 1760 thờ Thiên Hậu Thánh Mẫu — vòng nhang khổng lồ lơ lửng trên trần là hình ảnh đặc trưng không thể quên.',
  NULL, NULL, false, true,
  '{"lat": 10.7529, "lng": 106.6627}'::jsonb
),

(
  'SG', 'Nhà Thờ Tân Định (Nhà Thờ Màu Hồng)', 'Quận 3',
  '289 Hai Bà Trưng, P.8, Quận 3',
  NULL, 'Di tích tín ngưỡng', 'màu hồng, sống ảo, iconic',
  1, '05:30', '18:00', NULL, NULL,
  'Nhà thờ màu hồng candy độc nhất Việt Nam xây từ 1876 — check-in hot nhất mạng xã hội Sài Gòn, nổi bật nhất vào buổi sáng sớm.',
  NULL, NULL, false, true,
  '{"lat": 10.7876, "lng": 106.6893}'::jsonb
),

(
  'SG', 'Đường Sách Nguyễn Văn Bình', 'Quận 1',
  'Nguyễn Văn Bình, P. Bến Nghé, Quận 1',
  NULL, 'Trải nghiệm', 'sách, văn hóa, bình yên',
  1, '08:00', '21:00', NULL, NULL,
  'Phố sách 140m sát Nhà thờ Đức Bà với hàng chục gian sách cũ, ngoại văn và café sách — góc bình yên giữa lòng Sài Gòn hối hả.',
  NULL, NULL, false, true,
  '{"lat": 10.7800, "lng": 106.6999}'::jsonb
),

-- ─── CÀ PHÊ SỐNG ẢO ──────────────────────────────────────────────────────────

(
  'SG', 'The Workshop Coffee', 'Quận 1',
  '27 Ngô Đức Kế, P. Bến Nghé, Quận 1',
  NULL, 'Café', 'specialty coffee, industrial, chill',
  2, '08:00', '21:00', NULL, NULL,
  'Quán specialty coffee đầu tiên và nổi tiếng nhất Sài Gòn — không gian công nghiệp thoáng rộng 3 tầng, hội tụ giới creative và freelancer.',
  NULL, NULL, false, true,
  '{"lat": 10.7731, "lng": 106.7034}'::jsonb
),

(
  'SG', 'The Café Apartment (42 Nguyễn Huệ)', 'Quận 1',
  '42 Nguyễn Huệ, P. Bến Nghé, Quận 1',
  NULL, 'Café', 'vintage, sống ảo, đa phong cách',
  2, '08:00', '22:00', NULL, NULL,
  'Tòa chung cư Pháp cũ với hàng chục quán cà phê mỗi tầng mỗi phong cách — thang máy lưới sắt vintage là điểm check-in đặc trưng.',
  NULL, NULL, false, true,
  '{"lat": 10.7755, "lng": 106.7028}'::jsonb
),

(
  'SG', 'Cà Phê Tư Ký', 'Quận 5',
  '455 Nguyễn Trãi, P.11, Quận 5',
  NULL, 'Café', 'hoài cổ, người Hoa, authentic',
  1, '06:00', '14:00', NULL, NULL,
  'Quán cà phê vợt hơn 70 năm của người Hoa Chợ Lớn — bàn ghế gỗ cũ, cà phê vợt truyền thống. Một mảnh Sài Gòn xưa còn sót lại.',
  NULL, NULL, false, true,
  '{"lat": 10.7530, "lng": 106.6634}'::jsonb
),

(
  'SG', 'L''Usine Café & Restaurant', 'Quận 1',
  '70 Lê Lợi, P. Bến Thành, Quận 1',
  NULL, 'Café', 'Pháp, nghệ thuật, tinh tế',
  2, '08:00', '22:00', NULL, NULL,
  'Café-boutique-gallery trong tòa nhà Pháp cổ, kết hợp cà phê chất lượng cao với thời trang và nghệ thuật — điểm đến của giới tinh tế Sài Gòn.',
  NULL, NULL, false, true,
  '{"lat": 10.7736, "lng": 106.7012}'::jsonb
),

(
  'SG', 'Cà Phê Vợt Chín Giao', 'Quận 5',
  '109 Triệu Quang Phục, P.5, Quận 5',
  NULL, 'Café', 'truyền thống, Chợ Lớn, authentic',
  1, '05:00', '13:00', NULL, NULL,
  'Hàng cà phê vợt đời thứ 3 mở từ tờ mờ sáng — ly cà phê đá truyền thống kiểu người Sài Gòn gốc uống, đặc và thơm theo cách không nơi nào có.',
  NULL, NULL, false, true,
  '{"lat": 10.7522, "lng": 106.6589}'::jsonb
),

(
  'SG', 'Ơi Cafe', 'Quận 3',
  '15B/4 Trần Cao Vân, P.6, Quận 3',
  NULL, 'Café', 'vintage Sài Gòn, hoài cổ, ấm cúng',
  2, '07:30', '22:00', NULL, NULL,
  'Quán như bước vào ngôi nhà Sài Gòn xưa với đồ nội thất cổ, ảnh đen trắng và nhạc vàng — liều thuốc hoài niệm cho người Sài Gòn.',
  NULL, NULL, false, true,
  '{"lat": 10.7820, "lng": 106.6892}'::jsonb
),

(
  'SG', 'Cộng Cà Phê Nguyễn Huệ', 'Quận 1',
  '26 Lý Tự Trọng, P. Bến Nghé, Quận 1',
  NULL, 'Café', 'retro Bắc, cà phê cốt dừa, độc đáo',
  2, '07:00', '23:00', NULL, NULL,
  'Concept retro Bắc Việt đặc trưng với đồ dùng quân đội và áp phích cũ — cà phê cốt dừa độc đáo là thức uống phải thử một lần.',
  NULL, NULL, false, true,
  '{"lat": 10.7759, "lng": 106.7002}'::jsonb
),

(
  'SG', 'Phố Đi Bộ Nguyễn Huệ', 'Quận 1',
  'Đường Nguyễn Huệ, P. Bến Nghé, Quận 1',
  NULL, 'Trải nghiệm', 'đêm Sài Gòn, sống động, văn hóa',
  1, '00:00', '23:59', NULL, NULL,
  'Con phố đi bộ 670m sầm uất nhất Sài Gòn — nghệ sĩ đường phố, fountain nhảy, sự kiện văn hóa. Không khí về đêm mới là đỉnh nhất.',
  NULL, NULL, false, true,
  '{"lat": 10.7756, "lng": 106.7029}'::jsonb
),

-- ─── WORKSHOP & TRẢI NGHIỆM ──────────────────────────────────────────────────

(
  'SG', 'Xưởng Gốm Workshop Sài Gòn', 'Bình Thạnh',
  NULL,
  NULL, 'Workshop', 'gốm, thủ công, sáng tạo',
  2, '09:00', '17:00', 'Thứ 2', NULL,
  'Trải nghiệm nặn gốm thủ công theo phong cách truyền thống — phù hợp cặp đôi và nhóm bạn, mang về sản phẩm tự tay làm.',
  NULL, NULL, false, true,
  NULL
),

(
  'SG', 'Wonderlust Art Space', 'Quận 1',
  NULL,
  NULL, 'Workshop', 'vẽ tranh, nghệ thuật, DIY',
  2, '10:00', '20:00', NULL, NULL,
  'Không gian workshop nghệ thuật cuối tuần: vẽ tranh, làm đồ da, macramé — không cần kinh nghiệm, hướng dẫn từng bước.',
  NULL, NULL, false, true,
  NULL
),

(
  'SG', 'Chùa Vĩnh Nghiêm', 'Quận 3',
  '339 Nam Kỳ Khởi Nghĩa, P.7, Quận 3',
  NULL, 'Di tích tín ngưỡng', 'Phật giáo, yên tĩnh, tháp',
  1, '06:00', '17:00', NULL, NULL,
  'Chùa Phật giáo lớn nhất TP.HCM với tháp 7 tầng biểu tượng — không gian tĩnh lặng hiếm có giữa thành phố náo nhiệt.',
  NULL, NULL, false, true,
  '{"lat": 10.7741, "lng": 106.6836}'::jsonb
),

(
  'SG', 'Bến Bạch Đằng', 'Quận 1',
  'Tôn Đức Thắng, P. Bến Nghé, Quận 1',
  NULL, 'Trải nghiệm', 'hoàng hôn, bến sông, view',
  1, '00:00', '23:59', NULL, NULL,
  'Bờ sông Sài Gòn đoạn trung tâm — nơi ngắm hoàng hôn đẹp nhất thành phố và cảm nhận nhịp thở lịch sử của dòng sông 300 năm.',
  NULL, NULL, false, true,
  '{"lat": 10.7759, "lng": 106.7042}'::jsonb
);
