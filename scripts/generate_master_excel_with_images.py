import os
import sys
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.drawing.image import Image as OpenpyxlImage
from PIL import Image as PILImage
import io

sys.stdout.reconfigure(encoding='utf-8')

# Ensure thumbnails cache directory
thumb_dir = 'jpg_thumbs'
os.makedirs(thumb_dir, exist_ok=True)

# List of 45 destinations
destinations = [
    {
        "stt": 1,
        "name": "Dinh Độc Lập (Hội trường Thống Nhất / Independence Palace)",
        "category": "Di tích Lịch sử Quốc gia đặc biệt / Kiến trúc",
        "district": "Quận 1",
        "address": "135 Nam Kỳ Khởi Nghĩa, P. Bến Thành, Quận 1",
        "highlight": "Công trình kiến trúc độc đáo do KTS Ngô Viết Thụ thiết kế kết hợp triết lý phương Đông và hiện đại. Nơi ghi dấu thời khắc lịch sử trưa ngày 30/4/1975 thống nhất non sông. Quần thể gồm Dinh thự hơn 100 phòng khánh tiết, khu hầm chỉ huy tác chiến ngầm kiên cố và khuôn viên rợp bóng cổ thụ.",
        "best_time": "08:00 – 15:30 (Mở cửa cả tuần)",
        "price": "65.000 VNĐ/người lớn (gồm vé Dinh + Nhà trưng bày)",
        "tips": "Nên thuê tai nghe thuyết minh tự động (audio guide) để nghe chi tiết từng hiện vật. Sân cỏ và đài phun nước phía trước chụp ảnh góc rộng đón nắng sáng cực đẹp.",
        "img_file": "Reunification_Palace_-_Saigon_(5539083573).jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 2,
        "name": "Nhà thờ Đức Bà Sài Gòn (Notre-Dame Cathedral of Saigon)",
        "category": "Kiến trúc Pháp cổ / Di sản tôn giáo",
        "district": "Quận 1",
        "address": "Số 01 Công xã Paris, P. Bến Nghé, Quận 1",
        "highlight": "Vương cung thánh đường tuyệt mỹ khởi công năm 1877 theo phong cách Roman pha lẫn Gothic. Toàn bộ gạch đỏ ngói Marseille được vận chuyển trực tiếp từ Pháp, hai tháp chuông cao 57m sừng sững giữa trung tâm. Phía trước là tượng Đức Mẹ Hòa Bình bằng đá cẩm thạch trắng Carrara.",
        "best_time": "07:00 – 10:00 & 15:00 – 18:00",
        "price": "Miễn phí (Chiêm bái & chụp ảnh khuôn viên bên ngoài)",
        "tips": "Thưởng thức 'cà phê bệt' công viên 30/4 đối diện hoặc chụp từ góc Bưu điện Thành phố sang để lấy trọn vẹn hai tháp chuông sừng sững.",
        "img_file": "Basílica_de_Nuestra_Señora,_Ciudad_Ho_Chi_Minh,_Vietnam,_2013-08-14,_DD_03.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 3,
        "name": "Bưu điện Trung tâm Sài Gòn (Saigon Central Post Office)",
        "category": "Di sản kiến trúc Pháp / Điểm check-in",
        "district": "Quận 1",
        "address": "Số 02 Công xã Paris, P. Bến Nghé, Quận 1",
        "highlight": "Xây dựng từ 1886-1891 theo đồ án của KTS Foulhoux mang phong cách Phục Hưng kết hợp Gothic. Vòm trần sắt uốn cong tinh xảo, nền lát gạch hoa cổ, hai bản đồ lịch sử vẽ tay trên tường gỗ và hệ thống bốt điện thoại công cộng bằng gỗ cổ điển nguyên bản.",
        "best_time": "07:30 – 18:00 (Thứ 2 - Chủ Nhật)",
        "price": "Miễn phí",
        "tips": "Mua bưu thiếp lưu niệm bằng giấy dó thủ công, dán tem và gửi trực tiếp tại quầy bưu chính về nhà. Góc chụp vòm trần từ cửa chính là góc ảnh kinh điển.",
        "img_file": "Ho_Chi_Minh_City,_Central_Post_Office,_2020-01_CN-01.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 4,
        "name": "Nhà hát Thành phố (Saigon Opera House)",
        "category": "Kiến trúc nghệ thuật Pháp / Văn hóa biểu diễn",
        "district": "Quận 1",
        "address": "Số 07 Công Trường Lam Sơn, P. Bến Nghé, Quận 1",
        "highlight": "Khánh thành năm 1900 theo phong cách Flamboyant Gothic của Đệ tam Cộng hòa Pháp với mặt tiền chạm khắc phù điêu nữ thần tinh xảo, khán phòng 468 ghế hình vòm. Nơi diễn ra các show diễn nghệ thuật đỉnh cao như 'À Ố Show', vở kịch nghệ và hòa nhạc hàn lâm.",
        "best_time": "08:00 – 22:00 (Buổi tối rực sáng ánh đèn nghệ thuật)",
        "price": "Miễn phí bên ngoài; Vé xem show từ 700.000 – 1.600.000 VNĐ",
        "tips": "Ngồi bậc thềm bên hông nhà hát hoặc quán cafe đối diện để ngắm dòng xe đại lộ Đồng Khởi và khách sạn Continental cổ kính.",
        "img_file": "Ópera,_Ciudad_Ho_Chi_Minh,_Vietnam,_2013-08-14,_DD_02.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 5,
        "name": "Trụ sở HĐND & UBND TP. Hồ Chí Minh (City Hall / Tòa thị chính)",
        "category": "Di tích kiến trúc nghệ thuật Quốc gia",
        "district": "Quận 1",
        "address": "86 Lê Thánh Tôn, P. Bến Nghé, Quận 1",
        "highlight": "Công trình biểu tượng xây dựng từ 1898-1909 mang kiến trúc Phục Hưng phương Tây với tháp chuông nhô cao ở giữa, mặt tiền đắp nổi tượng nữ thần Marianne và hoa văn baroque tinh xảo. Phía trước là Quảng trường tượng đài Chủ tịch Hồ Chí Minh uy nghiêm.",
        "best_time": "18:00 – 22:00 (Hệ thống đèn chiếu sáng nghệ thuật lung linh)",
        "price": "Miễn phí ngắm cảnh bên ngoài",
        "tips": "Đứng từ giữa đài phun nước hoa sen trên phố đi bộ Nguyễn Huệ để lấy trọn vẹn tượng đài Bác Hồ và toàn cảnh mặt tiền lung linh của tòa nhà.",
        "img_file": "Ho_Chi_Minh_City,_City_Hall,_2020-01_CN-01.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 6,
        "name": "Chợ Bến Thành (Ben Thanh Market)",
        "category": "Biểu tượng văn hóa / Mua sắm & Ẩm thực",
        "district": "Quận 1",
        "address": "Quảng trường Quách Thị Trang, P. Bến Thành, Quận 1",
        "highlight": "Khu chợ lịch sử hoạt động từ 1914 với tháp đồng hồ 4 mặt huyền thoại ở cửa Nam. Chợ có gần 1.500 gian hàng với 4 cửa Đông - Tây - Nam - Bắc bày bán đa dạng từ đồ lưu niệm, lụa tơ tằm đến thiên đường ẩm thực nức tiếng: chè Sài Gòn, bún mắm, bánh bèo, bánh xèo.",
        "best_time": "06:00 – 18:00 (Chợ ngày) & 18:00 – 23:00 (Phố đêm ẩm thực)",
        "price": "Miễn phí",
        "tips": "Khi mua sắm quà lưu niệm hoặc đồ vải nên thương lượng lịch sự (khoảng 60-70% giá báo). Ghé khu ẩm thực thưởng thức chè thập cẩm sương sa hột lựu thơm béo.",
        "img_file": "Ben_Thanh,_Ciudad_Ho_Chi_Minh,_Vietnam,_2013-08-14,_DD_01.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 7,
        "name": "Bảo tàng Chứng tích Chiến tranh (War Remnants Museum)",
        "category": "Bảo tàng Lịch sử / Tư liệu chiến tranh",
        "district": "Quận 3",
        "address": "28 Võ Văn Tần, P. Võ Thị Sáu, Quận 3",
        "highlight": "Bảo tàng thu hút đông đảo khách quốc tế nhất Việt Nam, thành viên hệ thống Bảo tàng vì Hòa bình của UNESCO. Trưng bày hơn 20.000 hiện vật, tài liệu và ảnh tư liệu về chiến tranh xâm lược, gian trưng bày bộ ảnh 'Hồi niệm' và khu mô phỏng 'Chuồng cọp' Côn Đảo.",
        "best_time": "07:30 – 17:30 (Mở cửa tất cả các ngày)",
        "price": "40.000 VNĐ/người lớn; 20.000 VNĐ/học sinh - sinh viên",
        "tips": "Nên dành tối thiểu 2 tiếng để xem kỹ các khu chuyên đề. Khuôn viên sân trước có các khí tài trực thăng Chinook, máy bay phản lực F-5A, xe tăng M48 kích thước thật.",
        "img_file": "OIP.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 8,
        "name": "Bảo tàng Mỹ thuật TP. Hồ Chí Minh (Fine Arts Museum)",
        "category": "Bảo tàng Di sản Mỹ thuật / Không gian Check-in",
        "district": "Quận 1",
        "address": "97A Phó Đức Chính, P. Nguyễn Thái Bình, Quận 1",
        "highlight": "Tòa biệt thự tráng lệ từng thuộc đại hào phú Hứa Bổn Hòa (Chú Hỏa) kết hợp phong cách kiến trúc Art Deco và Baroque châu Âu. Nổi bật với thang máy cổ bằng gỗ bọc đồng đầu tiên ở Sài Gòn, các ô cửa sổ kính màu rực rỡ, hành lang lát gạch bông và bộ sưu tập mỹ thuật vô giá.",
        "best_time": "08:00 – 17:00 (Thứ 2 - Chủ Nhật)",
        "price": "30.000 VNĐ/người lớn; 15.000 VNĐ/học sinh - sinh viên",
        "tips": "Điểm chụp ảnh nghệ thuật lookbook hàng đầu. Chọn góc cầu thang xoắn ốc và hành lang kính màu đón ánh nắng xiên buổi sáng để có những bức ảnh lung linh.",
        "img_file": "Bao-tang-My-thuat-TP-HCM-ivivu.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 9,
        "name": "Bảo tàng Lịch sử TP. Hồ Chí Minh (Museum of History)",
        "category": "Bảo tàng Khảo cổ & Văn hóa Di sản",
        "district": "Quận 1",
        "address": "Số 2 Nguyễn Bỉnh Khiêm, P. Bến Nghé, Quận 1 (bên Thảo Cầm Viên)",
        "highlight": "Thành lập năm 1929 với kiến trúc 'Đông Dương cách tân' độc đáo có tháp mái ngói bát giác. Lưu giữ hơn 40.000 cổ vật quý giá từ thời Tiền sử, văn hóa Đông Sơn, Sa Huỳnh, Óc Eo - Phù Nam, Champa đến xác ướp Xóm Cải thế kỷ 19 nguyên vẹn kỳ bí.",
        "best_time": "08:00 – 11:30 & 13:00 – 17:00 (Thứ 3 - Chủ Nhật)",
        "price": "30.000 VNĐ/người lớn",
        "tips": "Kết hợp xem biểu diễn nghệ thuật múa rối nước truyền thống tại rạp trong khuôn viên bảo tàng và dạo bước sang vườn cây rợp bóng mát Thảo Cầm Viên.",
        "img_file": "10-dia-diem-du-lich-thanh-pho-ho-chi-minh-noi-tieng-nhat-5fa11376c8f9b.jpg",
        "rating": "⭐⭐⭐⭐ Heritage Gem"
    },
    {
        "stt": 10,
        "name": "Bảo tàng Thành phố Hồ Chí Minh (Dinh Gia Long)",
        "category": "Di tích Kiến trúc & Lịch sử Đô thị",
        "district": "Quận 1",
        "address": "65 Lý Tự Trọng, P. Bến Nghé, Quận 1",
        "highlight": "Tòa dinh thự cổ phong cách Tân cổ điển Pháp (Neoclassical) do KTS Foulhoux thiết kế năm 1885 với hàng cột Corinth đồ sộ, cầu thang gỗ uốn lượn uy nghi và hệ thống đường hầm ngầm bí mật kết nối tới Dinh Độc Lập. Trưng bày lịch sử hơn 300 năm hình thành Sài Gòn.",
        "best_time": "07:30 – 17:00 hàng ngày",
        "price": "30.000 VNĐ/người lớn",
        "tips": "Cầu thang gỗ uốn lượn tại đại sảnh và hành lang dài đón gió là điểm chụp ảnh áo dài cưới và lookbook cổ điển đẹp bậc nhất thành phố.",
        "img_file": "10_Bao_tang_TP_Ho_Chi_Minh_Dinh_Gia_Long.jpg",
        "rating": "⭐⭐⭐⭐⭐ Must Visit"
    },
    {
        "stt": 11,
        "name": "Bến Nhà Rồng - Bảo tàng Hồ Chí Minh (Dragon House Wharf)",
        "category": "Di tích Lịch sử Quốc gia / Cảng sông",
        "district": "Quận 4",
        "address": "Số 01 Nguyễn Tất Thành, P. 12, Quận 4",
        "highlight": "Nguyên là trụ sở hãng vận tải đường biển Messageries Maritimes xây dựng năm 1863 mang kiến trúc Pháp với đôi rồng ngậm trăng bằng đất nung trên nóc. Nơi người thanh niên Nguyễn Tất Thành ra đi tìm đường cứu nước ngày 5/6/1911 trên con tàu Amiral Latouche-Tréville.",
        "best_time": "07:30 – 11:30 & 13:30 – 17:00 (Thứ 3 - Chủ Nhật)",
        "price": "30.000 VNĐ/người lớn",
        "tips": "Khuôn viên hoa viên ven sông có tầm nhìn triệu đô phóng thẳng ra sông Sài Gòn, cầu Ba Son và bến Bạch Đằng lung linh lộng gió.",
        "img_file": "11_Ben_Nha_Rong_Bao_tang_Ho_Chi_Minh.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 12,
        "name": "Tòa nhà Landmark 81 & Đài quan sát Landmark 81 SkyView",
        "category": "Biểu tượng kiến trúc hiện đại / Skydeck",
        "district": "Bình Thạnh",
        "address": "720A Điện Biên Phủ, P. 22, Q. Bình Thạnh (KĐT Vinhomes Central Park)",
        "highlight": "Tòa tháp cao nhất Việt Nam và top 20 thế giới (461.3m) lấy cảm hứng từ bó tre truyền thống vươn lên mây xanh. Đài quan sát SkyView tầng 79 - 81 trang bị cầu kính SkyTouch trong suốt ở độ cao gần 400m, trải nghiệm game nhảy dù thực tế ảo và góc nhìn 360 độ toàn thành phố.",
        "best_time": "09:30 – 22:00 (Đẹp nhất lúc 17:00 – 18:30 ngắm hoàng hôn)",
        "price": "SkyView ~300.000 - 500.000 VNĐ/vé (TTTM Vincom miễn phí)",
        "tips": "Lên đài quan sát trước hoàng hôn 30 phút để bắt trọn 2 khoảnh khắc tuyệt mỹ: hoàng hôn buông trên sông Sài Gòn và thành phố lên đèn rực rỡ.",
        "img_file": "dai-quan-sat-landmark-81-skyview-07-1716134940.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 13,
        "name": "Công viên Vinhomes Central Park (Công viên Landmark 81)",
        "category": "Công viên cảnh quan ven sông / Giải trí ngoài trời",
        "district": "Bình Thạnh",
        "address": "208 Nguyễn Hữu Cảnh, P. 22, Q. Bình Thạnh",
        "highlight": "Công viên ven sông rộng 14ha với tổng vốn đầu tư hơn 500 tỷ đồng lấy cảm hứng từ Central Park New York. Sở hữu vườn Nhật Bản với hồ cá Koi, cầu gỗ đỏ nghệ thuật, đài phun nước trình diễn ánh sáng, thảm cỏ xanh mướt và đường dạo bộ ven sông ngắm Landmark 81 đồ sộ.",
        "best_time": "05:00 – 21:30 (Đẹp nhất 16:00 – 18:30 dạo mát)",
        "price": "Miễn phí vào cổng",
        "tips": "Địa điểm dã ngoại bãi cỏ và chụp ảnh toàn cảnh Landmark 81 hoàn hảo từ góc cầu đi bộ vượt hồ hoặc bên bờ bến du thuyền sang trọng.",
        "img_file": "hai-thap-vong-canh-an-tuong-doc-bo-song-sai-gon-mang-den-tam-nhin-bao-quat-cong-vien-vinhomes-central-park.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 14,
        "name": "Tòa tháp Bitexco Financial Tower & Saigon Skydeck",
        "category": "Biểu tượng kiến trúc cao tầng / Skydeck",
        "district": "Quận 1",
        "address": "Số 02 Hải Triều / 36 Hồ Tùng Mậu, P. Bến Nghé, Quận 1",
        "highlight": "Tòa tháp cao 262m gồm 68 tầng hình búp sen thanh thoát vươn lên với bãi đỗ trực thăng vươn ra ở tầng 52. Đài quan sát Saigon Skydeck tầng 49 trang bị ống nhòm viễn vọng tầm xa ngắm bao quát sông Sài Gòn, bến Nhà Rồng, bán đảo Thủ Thiêm và quận 1 từ trên cao.",
        "best_time": "09:30 – 21:30 hàng ngày",
        "price": "Skydeck ~200.000 VNĐ/người lớn",
        "tips": "Có thể lên quán cafe/lounge ở tầng 50-52 để vừa thưởng thức đồ uống vừa ngắm trọn vẹn cảnh đêm lung linh của thành phố hoa lệ.",
        "img_file": "155.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 15,
        "name": "Phố đi bộ Nguyễn Huệ & Trục cảnh quan trung tâm",
        "category": "Không gian công cộng / Sự kiện & Phố đi bộ",
        "district": "Quận 1",
        "address": "Đại lộ Nguyễn Huệ, P. Bến Nghé, Quận 1",
        "highlight": "Quảng trường đi bộ lát đá granite hiện đại dài 670m rộng 64m kết nối từ Tòa thị chính ra bờ sông Sài Gòn. Nơi diễn ra các lễ hội văn hóa lớn, đường hoa Tết thường niên, nhạc nước nghệ thuật ngầm và tụ điểm giao lưu văn hóa đường phố (busking) sôi động nhất của giới trẻ.",
        "best_time": "18:00 – 23:00 (Rực rỡ và nhộn nhịp nhất tối cuối tuần)",
        "price": "Miễn phí",
        "tips": "Thử món trà sữa, kem bơ hoặc bánh tráng trộn vỉa hè; thưởng thức các ban nhạc acoustic và nhóm nhảy hiphop biểu diễn đường phố tự do.",
        "img_file": "pho-di-bo-nguyen-hue-o-dau-4.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 16,
        "name": "Chung cư Cà phê 42 Nguyễn Huệ (The Cafe Apartments)",
        "category": "Điểm check-in văn hóa sáng tạo / Ẩm thực & Cafe",
        "district": "Quận 1",
        "address": "Số 42 Nguyễn Huệ, P. Bến Nghé, Quận 1",
        "highlight": "Khối chung cư 9 tầng xây từ thập niên 1960 được tái sinh ngoạn mục thành tổ hợp hàng chục quán cà phê nghệ thuật độc lạ, tiệm gốm thủ công và thời trang boutique. Mỗi ban công là một ô sắc màu rực rỡ với bảng hiệu neon nhìn thẳng xuống phố đi bộ Nguyễn Huệ.",
        "best_time": "08:00 – 22:30 hàng ngày",
        "price": "Miễn phí vào cửa (Phí thang máy ~5.000đ/lượt, nhiều quán hoàn trả lại)",
        "tips": "Đi bộ thong thả cầu thang bộ để khám phá những góc cổ điển độc đáo. Chọn quán cafe tầng 5-8 có ban công ngoài trời để ngắm dòng người phố đi bộ.",
        "img_file": "42-Nguyen-Hue-Finished-2755-FB-final.jpg",
        "rating": "⭐⭐⭐⭐⭐ Must Visit"
    },
    {
        "stt": 17,
        "name": "Đường Sách TP. Hồ Chí Minh (Nguyễn Văn Bình Book Street)",
        "category": "Không gian văn hóa đọc / Phố đi bộ xanh",
        "district": "Quận 1",
        "address": "Đường Nguyễn Văn Bình, P. Bến Nghé, Quận 1",
        "highlight": "Phố đi bộ rợp bóng me cổ thụ dài hơn 100m quy tụ hơn 20 gian hàng nhà xuất bản danh tiếng, quán cà phê sách ngoài trời, triển lãm ảnh nghệ thuật và các buổi tọa đàm ra mắt sách của tác giả nổi tiếng. Ốc đảo bình yên, trang nhã giữa nhịp sống hối hả.",
        "best_time": "08:00 – 21:30 hàng ngày",
        "price": "Miễn phí",
        "tips": "Điểm đọc sách và thưởng thức cafe sáng tuyệt vời dưới tán cây râm mát; check-in với xe buýt sách cổ kính và bốt điện thoại phong cách London.",
        "img_file": "duong-sach-thanh-pho-ho-chi-minh-1.jpg",
        "rating": "⭐⭐⭐⭐⭐ Must Visit"
    },
    {
        "stt": 18,
        "name": "Phố đi bộ Bùi Viện & Phố Tây Phạm Ngũ Lão",
        "category": "Phố ẩm thực đêm & Giải trí Nightlife",
        "district": "Quận 1",
        "address": "Đường Bùi Viện - Phạm Ngũ Lão, P. Phạm Ngũ Lão, Quận 1",
        "highlight": "Khu 'phố Tây ba lô' không ngủ lừng danh Sài Gòn. Khi màn đêm buông xuống, con phố bừng sáng với âm nhạc EDM sôi động từ các pub/bar ngoài trời, các quán bia sệt vỉa hè, các tiết mục xiếc múa lửa đường phố và ẩm thực đa quốc gia phong phú.",
        "best_time": "19:00 – 02:00 sáng hôm sau (Cuối tuần cấm xe tạo phố đi bộ)",
        "price": "Miễn phí vào phố",
        "tips": "Ngồi ghế nhựa vỉa hè thưởng thức bia Sài Gòn ướp lạnh, nhắm cùng đậu phộng rang tỏi ớt hoặc khô mực chiên nước mắm để cảm nhận trọn vẹn nhịp sống nightlife.",
        "img_file": "18_Pho_di_bo_Bui_Vien.jpg",
        "rating": "⭐⭐⭐⭐ Nightlife Icon"
    },
    {
        "stt": 19,
        "name": "Bến Bạch Đằng & Tuyến Buýt sông Sài Gòn (Saigon Waterbus)",
        "category": "Cảnh quan bờ sông / Trải nghiệm du lịch đường thủy",
        "district": "Quận 1",
        "address": "Số 10B Tôn Đức Thắng, P. Bến Nghé, Quận 1",
        "highlight": "Công viên bến tàu hiện đại với quảng trường lát đá, đài sen biểu tượng và bến xuất phát tuyến Waterbus dọc sông Sài Gòn từ Q1 qua Bình Thạnh đến TP. Thủ Đức (Linh Đông). Trải nghiệm ngắm trọn các tòa cao ốc Landmark 81, Bitexco và cầu Ba Son từ mặt sông mát rượi.",
        "best_time": "Tuyến buýt: 07:00 – 19:30; Công viên mở tự do 24/7",
        "price": "15.000 VNĐ/lượt buýt sông phổ thông; Tour đêm cao cấp ~339.000 VNĐ",
        "tips": "Nên đặt vé trực tuyến trước vào chuyến 16:30 - 17:30 để đón khoảnh khắc hoàng hôn buông trên sông và ngắm các tòa nhà chọc trời bừng sáng đèn.",
        "img_file": "19_Ben_Bach_Dang_Saigon_Waterbus.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 20,
        "name": "Cầu Ba Son (Cầu Thủ Thiêm 2)",
        "category": "Công trình giao thông biểu tượng / Điểm ngắm cảnh",
        "district": "Quận 1 & TP. Thủ Đức",
        "address": "Nối đường Tôn Đức Thắng (Q1) với đại lộ Mai Chí Thọ (KĐT Thủ Thiêm)",
        "highlight": "Cây cầu dây văng bất đối xứng dài 1.465m với trụ tháp chính hình vòm cao 113m nghiêng về phía Thủ Thiêm như cánh buồm căng gió. Về đêm cầu được chiếu sáng nghệ thuật lung linh, mở ra góc nhìn toàn cảnh skyline trung tâm Quận 1 ngoạn mục nhất.",
        "best_time": "17:30 – 22:00 (Thích hợp đi dạo bộ, hóng gió và ngắm cảnh)",
        "price": "Miễn phí",
        "tips": "Chân cầu phía bờ Thủ Thiêm là tụ điểm chill nổi tiếng của giới trẻ với bãi cỏ rộng rãi, xe trà chanh dạo mát và góc chụp toàn cảnh skyline Quận 1 triệu đô.",
        "img_file": "20_Cau_Ba_Son_Thu_Thiem_2.jpg",
        "rating": "⭐⭐⭐⭐⭐ Iconic Modern"
    },
    {
        "stt": 21,
        "name": "Cầu Mống (Mong Bridge)",
        "category": "Di tích kiến trúc thế kỷ 19 / Cầu bộ hành",
        "district": "Quận 1 & Quận 4",
        "address": "Nối đường Võ Văn Kiệt (Q1) và Bến Vân Đồn (Q4) qua kênh Bến Nghé",
        "highlight": "Cây cầu sắt màu xanh ngọc bích cổ nhất thành phố do công ty Levallois Perret (Pháp, công ty của Gustave Eiffel) xây dựng từ năm 1893. Thân cầu uốn hình vòng cung thanh thoát, hiện dành riêng cho người đi bộ và ngắm các tòa nhà tài chính soi bóng bên dòng kênh xanh.",
        "best_time": "16:30 – 21:00 buổi chiều mát và tối",
        "price": "Miễn phí",
        "tips": "Góc chụp ảnh từ chân cầu hướng về tòa nhà Ngân hàng Nhà nước Việt Nam chi nhánh TP.HCM mang đậm hơi thở cổ điển Đông Dương thế kỷ 20.",
        "img_file": "21_Cau_Mong_Saigon.jpg",
        "rating": "⭐⭐⭐⭐ Heritage Gem"
    },
    {
        "stt": 22,
        "name": "Nhà thờ Tân Định (Nhà thờ Màu Hồng - Church of the Sacred Heart)",
        "category": "Di sản kiến trúc tôn giáo / Điểm Check-in nổi tiếng",
        "district": "Quận 3",
        "address": "289 Hai Bà Trưng, P. Võ Thị Sáu, Quận 3",
        "highlight": "Nhà thờ cổ kính khởi công năm 1870 mang phong cách Gothic kết hợp Roman và Baroque. Nổi bật với màu sơn hồng pastel ngọt ngào độc nhất vô nhị, tháp chuông chính cao 52.6m gắn thánh giá đồng và nội thất lộng lẫy với các hàng cột đá hoa cương Ý.",
        "best_time": "08:00 – 11:30 & 14:00 – 17:00 (Nắng sáng chụp màu hồng đẹp nhất)",
        "price": "Miễn phí",
        "tips": "Lên ban công tầng 2-3 của quán cà phê Cộng đối diện bên kia đường Hai Bà Trưng để có góc chụp toàn cảnh trọn vẹn tháp chuông hồng tuyệt đẹp.",
        "img_file": "22_Nha_tho_Tan_Dinh_Pink_Church.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 23,
        "name": "Chùa Ngọc Hoàng (Phước Hải Tự / Jade Emperor Pagoda)",
        "category": "Di tích kiến trúc nghệ thuật / Văn hóa tâm linh",
        "district": "Quận 1",
        "address": "73 Mai Thị Lựu, P. Đa Kao, Quận 1",
        "highlight": "Ngôi chùa cổ do cộng đồng người Hoa xây dựng đầu thế kỷ 20, nổi tiếng linh thiêng về cầu con cái và cầu duyên lành. Lưu giữ hơn 300 bức tượng điêu khắc gỗ và giấy bồi cổ quý hiếm. Nơi cựu Tổng thống Mỹ Barack Obama từng ghé thăm trong chuyến công du năm 2016.",
        "best_time": "07:00 – 18:00 (Rằm, mùng một và dịp Vía Ngọc Hoàng mùng 9 Tết rất đông)",
        "price": "Miễn phí",
        "tips": "Cầu con cái ghé Điện thờ Kim Hoa Thánh Mẫu và 12 Bà Mụ; cầu tình duyên ghé ban thờ Ông Tơ Bà Nguyệt. Trang phục kín đáo, trang nghiêm khi chiêm bái.",
        "img_file": "23_Chua_Ngoc_Hoang_Jade_Emperor.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 24,
        "name": "Chùa Vĩnh Nghiêm (Vinh Nghiem Pagoda)",
        "category": "Danh lam cổ tự Phật giáo Bắc tông / Kiến trúc gỗ",
        "district": "Quận 3",
        "address": "339 Nam Kỳ Khởi Nghĩa, P. Võ Thị Sáu, Quận 3",
        "highlight": "Ngôi chùa bê tông cốt thép kiểu truyền thống đầu tiên tại Việt Nam khánh thành năm 1971, lấy nguyên mẫu từ chùa Vĩnh Nghiêm (Bắc Giang) - chốn tổ thiền phái Trúc Lâm. Điểm nhấn là Tháp Quán Thế Âm 7 tầng cao 40m và Tháp đá Hồng Ân 14m xây hoàn toàn bằng đá xanh Thanh Hóa.",
        "best_time": "07:00 – 21:00 hàng ngày",
        "price": "Miễn phí",
        "tips": "Trong chùa có nhà hàng ẩm thực chay Vĩnh Nghiêm nổi tiếng thanh tịnh và ngon miệng. Dịp Đại lễ Phật Đản hay Vu Lan chùa thắp đèn hoa đăng rất đẹp.",
        "img_file": "24_Chua_Vinh_Nghiem.jpg",
        "rating": "⭐⭐⭐⭐⭐ Must Visit"
    },
    {
        "stt": 25,
        "name": "Chùa Bửu Long (Thiền viện Tổ đình Bửu Long / Chùa Thái Lan)",
        "category": "Danh thắng Phật giáo Nam tông / Kỳ quan kiến trúc",
        "district": "TP. Thủ Đức",
        "address": "81 Nguyễn Xiển, P. Long Bình, TP. Thủ Đức",
        "highlight": "Tạp chí National Geographic bình chọn là một trong 20 ngôi chùa có kiến trúc Phật giáo đẹp nhất thế giới. Ngôi bảo tháp Gotama Cetiya cao 70m màu trắng viền vàng lộng lẫy, kết hợp tinh hoa triều Nguyễn và văn hóa Phật giáo Nam Á soi bóng bên hồ ngọc bích bán nguyệt.",
        "best_time": "08:00 – 11:00 & 14:00 – 18:00",
        "price": "Miễn phí",
        "tips": "Chốn tu thiền thanh tịnh tuyệt đối, không quay phim chụp ảnh thương mại trong chánh điện; trang phục lịch sự qua đầu gối và kín vai.",
        "img_file": "25_Chua_Buu_Long.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 26,
        "name": "Chùa Bà Thiên Hậu (Tuệ Thành Hội Quán - Chợ Lớn)",
        "category": "Di tích kiến trúc nghệ thuật Quốc gia / Văn hóa người Hoa",
        "district": "Quận 5",
        "address": "710 Nguyễn Trãi, P. 11, Quận 5 (Khu Chợ Lớn)",
        "highlight": "Ngôi chùa cổ trên 260 năm tuổi của cộng đồng người Hoa gốc Quảng Đông thờ Thiên Hậu Thánh Mẫu. Nổi bật với hàng trăm khoanh nhang vòng treo lơ lửng trên trần nhả khói trầm nghi ngút và các bức phù điêu gốm men xanh Cây Mai đắp nổi trên bờ nóc mái thể hiện tích xưa.",
        "best_time": "06:30 – 16:30 hàng ngày",
        "price": "Miễn phí",
        "tips": "Mua khoanh nhang vòng (~30.000 - 50.000đ), viết tên lời nguyện ước lên tờ giấy đỏ dán vào giữa vòng nhang rồi nhờ sư thầy treo lên giếng trời cầu bình an, may mắn.",
        "img_file": "26_Chua_Ba_Thien_Hau_Cho_Lon.jpg",
        "rating": "⭐⭐⭐⭐⭐ Must Visit"
    },
    {
        "stt": 27,
        "name": "Hội quán Nghĩa An (Chùa Ông Quan Đế Miếu)",
        "category": "Di tích kiến trúc Quốc gia / Hội quán người Triều Châu",
        "district": "Quận 5",
        "address": "678 Nguyễn Trãi, P. 11, Quận 5",
        "highlight": "Công trình kiến trúc đặc trưng của người Hoa Triều Châu xây dựng từ thế kỷ 19 thờ Quan Thánh Đế Quân. Nổi tiếng với nghệ thuật chạm khắc gỗ sơn son thếp vàng tinh xảo ở các bao lam, hoành phi, tượng ngựa Xích Thỏ bằng gỗ kích thước lớn và sân đình rộng rãi.",
        "best_time": "07:00 – 17:30",
        "price": "Miễn phí",
        "tips": "Tục lệ chui qua bụng ngựa Xích Thỏ và rung chuông đồng dưới cổ ngựa để cầu sức khỏe dồi dào, xua tan vận rủi và công việc làm ăn hanh thông.",
        "img_file": "27_Hoi_quan_Nghia_An_Chua_Ong.jpg",
        "rating": "⭐⭐⭐⭐ Cultural Gem"
    },
    {
        "stt": 28,
        "name": "Chùa Giác Lâm (Tổ đình Giác Lâm)",
        "category": "Di tích Lịch sử - Văn hóa Quốc gia / Ngôi chùa cổ nhất Sài Gòn",
        "district": "Tân Bình",
        "address": "565 Lạc Long Quân, P. 10, Q. Tân Bình",
        "highlight": "Tổ đình Phật giáo cổ kính nhất đất Gia Định xây dựng năm 1744 với kiến trúc chữ 'Tam' kiểu nhà rường Nam Bộ gồm 98 cột gỗ quý khắc chữ Hán chìm. Lưu giữ 113 pho tượng cổ bằng gỗ mít và bộ bao lam chạm cửu long tuyệt mỹ trên 200 năm tuổi.",
        "best_time": "06:00 – 12:00 & 13:30 – 20:00",
        "price": "Miễn phí",
        "tips": "Bảo tháp Xá Lợi 7 tầng hình lục giác cao 32m ở sân trước lưu giữ xá lợi Phật Thích Ca; lên tầng cao có thể ngắm toàn cảnh quận Tân Bình xanh mát.",
        "img_file": "28_Chua_Giac_Lam.jpg",
        "rating": "⭐⭐⭐⭐ Heritage Gem"
    },
    {
        "stt": 29,
        "name": "Lăng Tả quân Lê Văn Duyệt (Lăng Ông Bà Chiểu)",
        "category": "Di tích Lịch sử - Văn hóa Quốc gia / Quần thể lăng mộ cổ",
        "district": "Bình Thạnh",
        "address": "Số 01 Vũ Tùng, P. 1, Q. Bình Thạnh (cạnh chợ Bà Chiểu)",
        "highlight": "Nơi an nghỉ của Tổng trấn Gia Định Thành Tả quân Lê Văn Duyệt và phu nhân. Quần thể rộng 18.500m2 rợp bóng cổ thụ mang kiến trúc cung đình triều Nguyễn gồm Nhà bia, Mộ phần xây theo kiểu 'mộ quy' bằng hợp chất ô dước cổ và Thượng điện chạm rồng phượng tinh vi.",
        "best_time": "07:00 – 17:00 hàng ngày",
        "price": "Miễn phí",
        "tips": "Dịp Tết Nguyên Đán và lễ giỗ Tả quân (mùng 1-3/8 Âm lịch), lăng diễn ra các nghi lễ tế cung đình trang trọng, diễn hát bội truyền thống và xin xăm đầu năm.",
        "img_file": "29_Lang_Ong_Ba_Chieu_Le_Van_Duyet.jpg",
        "rating": "⭐⭐⭐⭐ Heritage Gem"
    },
    {
        "stt": 30,
        "name": "Chùa Pháp Hoa & Cung đường Kênh Nhiêu Lộc - Thị Nghè",
        "category": "Điểm văn hóa tâm linh / Cảnh quan du lịch kênh rạch",
        "district": "Quận 3",
        "address": "870 Trường Sa, P. 14, Quận 3",
        "highlight": "Ngôi chùa Phật giáo soi bóng êm đềm bên dòng kênh Nhiêu Lộc - Thị Nghè hồi sinh xanh mát. Chùa nổi tiếng khắp thành phố vào mỗi dịp Đại lễ Phật Đản (tháng 4 Âm lịch) khi hàng vạn ngọn hoa đăng lung linh được thả trôi sáng rực trên mặt nước dọc đường Trường Sa - Hoàng Sa.",
        "best_time": "06:00 – 20:30 (Rực rỡ nhất mùa Phật Đản và rằm tháng 7)",
        "price": "Miễn phí",
        "tips": "Trải nghiệm đi thuyền chèo ngắm cảnh kênh Nhiêu Lộc từ bến thuyền Quận 1/Quận 3, vừa nghe đờn ca tài tử vừa ngắm chùa Pháp Hoa rực rỡ hoa đăng từ mặt nước.",
        "img_file": "30_Chua_Phap_Hoa_Nhieu_Loc.jpg",
        "rating": "⭐⭐⭐⭐ Local Favorite"
    },
    {
        "stt": 31,
        "name": "Đền thờ Ấn Độ giáo Mariamman (Chùa Bà Ấn - Sri Mariamman)",
        "category": "Di sản kiến trúc Hindu giáo / Tín ngưỡng văn hóa",
        "district": "Quận 1",
        "address": "45 Trương Định, P. Bến Thành, Quận 1 (gần chợ Bến Thành)",
        "highlight": "Đền thờ Mẹ Mariamman do cộng đồng thương nhân người Ấn gốc Tamil xây dựng đầu thế kỷ 20. Tháp cổng Gopuram vươn cao đắp nổi vô số tượng thần linh sống động đầy màu sắc theo phong cách kiến trúc đền đài Nam Ấn Độ.",
        "best_time": "07:00 – 19:00 hàng ngày",
        "price": "Miễn phí",
        "tips": "Cởi giày dép để bên ngoài trước khi vào đền. Tục lệ áp trán vào bức tường đá thiêng phía sau đền và cầu nguyện để đón nhận năng lượng bình an và may mắn.",
        "img_file": "31_Den_Mariamman_Chua_Ba_An.jpg",
        "rating": "⭐⭐⭐⭐ Cultural Gem"
    },
    {
        "stt": 32,
        "name": "Thánh đường Hồi giáo Jamia Al-Musulman (Saigon Central Mosque)",
        "category": "Di sản tôn giáo Hồi giáo / Điểm check-in thanh bình",
        "district": "Quận 1",
        "address": "66 Đông Du, P. Bến Nghé, Quận 1",
        "highlight": "Xây dựng năm 1935 phục vụ cộng đồng tín đồ Hồi giáo từ Nam Á. Nét kiến trúc Hồi giáo đặc trưng với màu sơn xanh ngọc bích - trắng pastel thanh thoát, mái vòm hình củ hành, tháp Minaret và hành lang lát đá cẩm thạch mát lạnh yên ắng giữa trung tâm sầm uất.",
        "best_time": "08:00 – 20:00 (Trừ giờ cầu nguyện của tín đồ)",
        "price": "Miễn phí",
        "tips": "Khuôn viên phía sau thánh đường có quầy ẩm thực Halal chuẩn vị bán các món cà ri bò cay nồng, cơm Biryani, bánh Roti Canai rất hấp dẫn.",
        "img_file": "32_Thanh_duong_Jamia_Al_Musulman.jpg",
        "rating": "⭐⭐⭐⭐ Cultural Gem"
    },
    {
        "stt": 33,
        "name": "Nhà thờ Cha Tam (Thánh Phanxicô Xaviê - Chợ Lớn)",
        "category": "Di sản kiến trúc Công giáo / Văn hóa người Hoa Chợ Lớn",
        "district": "Quận 5",
        "address": "25 Học Lạc, P. 14, Quận 5",
        "highlight": "Khánh thành năm 1902 do Linh mục Pierre d'Assonville (Cha Tam) chủ trì xây dựng cho giáo dân người Hoa. Kiến trúc giao thoa Đông - Tây độc đáo: tháp chuông Gothic kết hợp mái ngói âm dương, cuốn thư câu đối chữ Hán và tượng hoa sen chạm khắc tinh vi.",
        "best_time": "07:00 – 11:30 & 14:00 – 18:00",
        "price": "Miễn phí",
        "tips": "Nơi ghi dấu sự kiện lịch sử ngày 2/11/1963. Sau khi tham quan có thể đi bộ sang chợ vải Soái Kình Lâm và khu phố sủi cảo Hà Tôn Quyền kế bên.",
        "img_file": "33_Nha_tho_Cha_Tam_Cho_Lon.jpg",
        "rating": "⭐⭐⭐⭐ Cultural Gem"
    },
    {
        "stt": 34,
        "name": "Chợ Bình Tây (Chợ Lớn Mới - Binh Tay Market)",
        "category": "Di tích kiến trúc nghệ thuật / Chợ đầu mối lâu đời",
        "district": "Quận 6",
        "address": "57A Tháp Mười, P. 2, Quận 6",
        "highlight": "Xây dựng năm 1928 do thương gia người Hoa Quách Đàm hiến tặng đất và tài trợ. Kiến trúc Á - Đông đặc trưng với mái ngói chồng lớp kiểu vảy cá, tháp chuông trung tâm bát giác và hoa viên lộ thiên chính giữa đặt tượng cụ Quách Đàm.",
        "best_time": "06:00 – 18:00 hàng ngày",
        "price": "Miễn phí",
        "tips": "Trung tâm bán buôn (sỉ) lớn nhất miền Nam. Bạn có thể mua đặc sản hạt sen sấy, mứt gừng, khô bò, gia vị thuốc bắc với giá sỉ cực tốt tại tầng trệt.",
        "img_file": "34_Cho_Binh_Tay_Cho_Lon.jpg",
        "rating": "⭐⭐⭐⭐⭐ Must Visit"
    },
    {
        "stt": 35,
        "name": "Chợ hoa đêm & Phố ẩm thực Hồ Thị Kỷ",
        "category": "Chợ hoa đêm truyền thống / Thiên đường ẩm thực đường phố",
        "district": "Quận 10",
        "address": "Hẻm 52 Hồ Thị Kỷ, P. 1, Quận 10",
        "highlight": "Chợ đầu mối hoa tươi lớn nhất Sài Gòn hoạt động thâu đêm quy tụ muôn ngàn loài hoa Đà Lạt và miền Tây; kết hợp phố ẩm thực nức tiếng với hàng trăm món ăn vặt Campuchia - Việt Nam: chè Campuchia cô Có, bún Num-bo-chóc, bánh tráng nướng, trà đào dầm.",
        "best_time": "Phố ẩm thực: 15:00 – 23:00; Chợ hoa sỉ: 00:00 – 04:00 sáng",
        "price": "Miễn phí",
        "tips": "Gửi xe ở đầu hẻm đường Lý Thái Tổ rồi đi bộ vào. Chỉ cần khoảng 100.000 - 150.000 VNĐ là bạn có thể thưởng thức no nê hàng chục món ăn đường phố hấp dẫn.",
        "img_file": "35_Cho_hoa_Ho_Thi_Ky.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 36,
        "name": "Chợ Tân Định (Chợ ẩm thực & thời trang trăm năm)",
        "category": "Chợ truyền thống lịch sử / Thiên đường ẩm thực Sài Gòn",
        "district": "Quận 1",
        "address": "336 Hai Bà Trưng, P. Tân Định, Quận 1",
        "highlight": "Ngôi chợ cổ xây dựng năm 1926 với mặt tiền 3 tháp chuông kiểu Pháp cổ kính. Nổi danh là 'chợ nhà giàu' với các sạp bán vải vóc lụa là cao cấp và khu ẩm thực đêm nức tiếng: cháo sườn bà Hào, xôi gà Tân Định da giòn lòng đào trứng non, chè trang thơm ngọt.",
        "best_time": "Chợ lồng: 06:00 – 17:00; Khu ăn đêm trước cổng: 17:00 – 01:00 sáng",
        "price": "Miễn phí",
        "tips": "Sau khi chụp ảnh bên Nhà thờ Màu Hồng đối diện, hãy ghé qua chợ Tân Định thưởng thức đĩa xôi gà xé lòng đào trứng non hoặc tô cháo sườn sụn nóng hổi.",
        "img_file": "36_Cho_Tan_Dinh.jpg",
        "rating": "⭐⭐⭐⭐ Foodie Heaven"
    },
    {
        "stt": 37,
        "name": "Phố lồng đèn Lương Nhữ Học (Chợ Lớn Quận 5)",
        "category": "Tuyến phố văn hóa lễ hội / Không gian truyền thống",
        "district": "Quận 5",
        "address": "Tuyến đường Lương Nhữ Học - Nguyễn Trãi, P. 11, Quận 5",
        "highlight": "Con phố thủ công truyền thống rực rỡ nhất Sài Gòn mỗi dịp Tết Trung Thu và Tết Nguyên Đán. Hàng trăm cửa tiệm treo kín hàng vạn chiếc lồng đèn giấy kính đỏ hình cá chép, rồng bay, đèn kéo quân và đèn lồng lụa Hội An lung linh tỏa sáng cả góc trời Chợ Lớn.",
        "best_time": "17:00 – 22:00 (Rực rỡ nhất tháng 7 - rằm tháng 8 Âm lịch)",
        "price": "Miễn phí vào phố",
        "tips": "Nên đi vào các ngày đầu tháng 8 Âm lịch để tránh quá tải chen chúc. Hãy ủng hộ các cửa hàng 1-2 chiếc lồng đèn nhỏ xinh trước khi chụp ảnh check-in.",
        "img_file": "37_Pho_long_den_Luong_Nhu_Hoc.jpg",
        "rating": "⭐⭐⭐⭐ Festive Spot"
    },
    {
        "stt": 38,
        "name": "Phố đồ cổ & tranh ảnh Lê Công Kiều",
        "category": "Phố di sản nghệ thuật / Đồ cổ & Mỹ nghệ",
        "district": "Quận 1",
        "address": "Đường Lê Công Kiều, P. Nguyễn Thái Bình, Quận 1",
        "highlight": "Con phố đồ cổ ngắn nhưng danh tiếng bậc nhất Đông Nam Á dài 200m quy tụ hàng chục cửa hàng trưng bày tiền cổ, đồ đồng thời Nguyễn, gốm sứ Chu Đậu, đồ gỗ cẩn xà cừ, máy hát đĩa than và các kỷ vật thời kỳ Đông Dương.",
        "best_time": "08:30 – 18:00 hàng ngày",
        "price": "Miễn phí",
        "tips": "Địa điểm yêu thích của những tâm hồn hoài cổ (vintage). Khi tham quan hãy cẩn thận tránh va quẹt vào các hiện vật gốm sứ quý giá trưng bày ngoài hiên.",
        "img_file": "38_Pho_do_co_Le_Cong_Kieu.jpg",
        "rating": "⭐⭐⭐⭐ Vintage Charm"
    },
    {
        "stt": 39,
        "name": "Thảo Cầm Viên Sài Gòn (Saigon Zoo and Botanical Gardens - Vườn thú 1864)",
        "category": "Vườn bách thảo & Sở thú lịch sử / Sinh thái đô thị",
        "district": "Quận 1",
        "address": "Số 02 Nguyễn Bỉnh Khiêm, P. Bến Nghé, Quận 1",
        "highlight": "Xây dựng từ năm 1864, là vườn thú lâu đời thứ 8 trên thế giới và là 'lá phổi xanh' cổ thụ giữa lòng thành phố. Bảo tồn hơn 1.300 cá thể động vật thuộc 125 loài quý hiếm cùng hơn 2.500 cây gỗ đại thụ quý giá, vườn phong lan, nhà xương rồng và hồ sen thanh tịnh.",
        "best_time": "07:00 – 17:30 (Mở cửa tất cả các ngày)",
        "price": "60.000 VNĐ/người lớn (>1.3m); 40.000 VNĐ/trẻ em (1m-1.3m)",
        "tips": "Địa điểm dã ngoại số 1 cho gia đình có trẻ nhỏ. Thuê xe điện dạo quanh vườn thú hoặc mang thảm cắm trại dã ngoại dưới bóng cây me tây trăm tuổi.",
        "img_file": "39_Thao_Cam_Vien_Sai_Gon.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 40,
        "name": "Công viên Văn hóa Đầm Sen (Dam Sen Cultural Park)",
        "category": "Tổ hợp công viên giải trí / Công viên nước & Cảnh quan",
        "district": "Quận 11",
        "address": "Số 03 Hòa Bình, P. 3, Quận 11",
        "highlight": "Tổ hợp giải trí xanh rộng hơn 50ha gồm Đầm Sen Khô với hơn 30 trò chơi cảm giác mạnh, rạp xiếc, thủy cung, vườn chim thú hoang dã và Đầm Sen Nước (Water Park) sở hữu hệ thống máng trượt xoắn ốc khổng lồ và hồ tạo sóng mát lạnh.",
        "best_time": "08:00 – 18:00 (Thứ 2 - Chủ Nhật)",
        "price": "Vé vào cổng từ 140.000 VNĐ; Vé trọn gói ~260.000 – 300.000 VNĐ",
        "tips": "Dịp bắn pháo hoa Tết và lễ hội lớn, khu vực bờ hồ trung tâm Đầm Sen là điểm ngắm pháo hoa nghệ thuật tầm thấp và mặt nước cực kỳ mãn nhãn.",
        "img_file": "40_Cong_vien_Dam_Sen.jpg",
        "rating": "⭐⭐⭐⭐ Family Fun"
    },
    {
        "stt": 41,
        "name": "Khu Du lịch Văn hóa Suối Tiên (Suoi Tien Theme Park)",
        "category": "Công viên chủ đề văn hóa tâm linh / Giải trí dân gian",
        "district": "TP. Thủ Đức",
        "address": "120 Xa lộ Hà Nội, P. Tân Phú, TP. Thủ Đức (Cạnh ga Metro số 1)",
        "highlight": "Công viên chuyên đề văn hóa lịch sử thần thoại Việt Nam đầu tiên với diện tích 150ha. Điểm nhấn là biển Tiên Đồng Ngọc Nữ nhân tạo với tượng Lạc Long Quân tạc vào vách núi cao 70m, lâu đài Băng Tuyết lạnh âm 5 độ C, nông trại Suối Tiên Farm và đại cung Tiên Ngư.",
        "best_time": "08:00 – 17:30 hàng ngày",
        "price": "150.000 VNĐ/người lớn; 80.000 VNĐ/trẻ em",
        "tips": "Có thể di chuyển thẳng từ trung tâm Quận 1 đến cổng Suối Tiên bằng tuyến tàu điện Metro số 1 (Ga Suối Tiên / Bến xe Miền Đông mới) cực kỳ tiện lợi.",
        "img_file": "41_KDL_Suoi_Tien.jpg",
        "rating": "⭐⭐⭐⭐ Theme Park Icon"
    },
    {
        "stt": 42,
        "name": "Cầu Ánh Sao & Hồ Bán Nguyệt (Starlight Bridge - Phú Mỹ Hưng)",
        "category": "Công trình cảnh quan đô thị / Điểm dạo mát lãng mạn",
        "district": "Quận 7",
        "address": "Khu đô thị Phú Mỹ Hưng, đường Tôn Dật Tiên, P. Tân Phú, Quận 7",
        "highlight": "Cầu bộ hành uốn cong hình mặt trăng dài 170m bắc qua kênh Thầy Tiêu nối Hồ Bán Nguyệt với khu Kênh Đào. Trang bị hệ thống phun nước và đèn LED 7 màu đổi sắc liên tục cùng hàng ngàn mắt đèn sáng rực trên mặt cầu như dải ngân hà đầy sao.",
        "best_time": "Phun nước & lên đèn LED: 18:00 – 22:00 (Thứ 5 - Chủ Nhật)",
        "price": "Miễn phí",
        "tips": "Dọc theo bờ Hồ Bán Nguyệt có các cung đường dạo bộ xanh mát lát đá và chuỗi nhà hàng, quán cà phê ven hồ lãng mạn cho các cặp đôi hẹn hò.",
        "img_file": "42_Cau_Anh_Sao_Phu_My_Hung.jpg",
        "rating": "⭐⭐⭐⭐ Romantic Spot"
    },
    {
        "stt": 43,
        "name": "Khu di tích Lịch sử Địa đạo Củ Chi (Bến Dược & Bến Đình)",
        "category": "Di tích Lịch sử Quốc gia đặc biệt / Kỳ quan ngầm quân sự",
        "district": "Huyện Củ Chi",
        "address": "Xã Phú Mỹ Hưng (Bến Dược) & Xã Nhuận Đức (Bến Đình), Huyện Củ Chi",
        "highlight": "'Thành phố trong lòng đất' huyền thoại dài hơn 250km đào hoàn toàn bằng tay thời kháng chiến với hệ thống 3 tầng hầm thông nhau gồm bệnh xá, phòng họp, bếp Hoàng Cầm không khói, kho vũ khí và bẫy chông bí mật. Top 7 công trình ngầm kỳ thú nhất thế giới.",
        "best_time": "07:00 – 17:00 hàng ngày",
        "price": "35.000 VNĐ/khách Việt Nam; 125.000 VNĐ/khách quốc tế",
        "tips": "Trải nghiệm chui thử vào đoạn hầm địa đạo; thưởng thức củ mì luộc chấm muối mè thơm bùi tại bếp Hoàng Cầm và thử bắn súng thể thao tại trường bắn quốc phòng.",
        "img_file": "43_Dia_dao_Cu_Chi.jpg",
        "rating": "⭐⭐⭐⭐⭐ Must Visit"
    },
    {
        "stt": 44,
        "name": "Khu Dự trữ Sinh quyển Rừng ngập mặn Cần Giờ & Đảo Khỉ",
        "category": "Khu dự trữ sinh quyển thế giới UNESCO / Du lịch sinh thái",
        "district": "Huyện Cần Giờ",
        "address": "Xã Long Hòa, Huyện Cần Giờ (cách trung tâm ~45km qua phà Bình Khánh)",
        "highlight": "'Lá phổi xanh' ven biển của TP.HCM được UNESCO công nhận năm 2000. Quần thể rừng đước bạt ngàn nguyên sinh với hơn 1.000 chú khỉ tự nhiên tại Đảo Khỉ, đi cano xuyên rừng ngập mặn khám phá Chiến khu Rừng Sác huyền thoại và thưởng thức hải sản chợ Hàng Dương.",
        "best_time": "07:30 – 16:30 (Thích hợp đi tour trong ngày hoặc cắm trại)",
        "price": "35.000 – 40.000 VNĐ/vé Đảo Khỉ; Cano Rừng Sác ~100.000 VNĐ/người",
        "tips": "Cẩn thận giữ chặt mắt kính, điện thoại, nón mũ khi vào Đảo Khỉ. Trên đường về nhớ ghé chợ Hàng Dương mua tôm tít, cua biển hấp chấm muối ớt xanh nóng hổi.",
        "img_file": "44_Rung_ngap_man_Can_Gio_Dao_Khi.jpg",
        "rating": "⭐⭐⭐⭐⭐ Top Choice"
    },
    {
        "stt": 45,
        "name": "Làng Du lịch Sinh thái Nông trang Xanh (Green Noen Củ Chi)",
        "category": "Nông trại sinh thái & Trải nghiệm đồng quê / Nông nghiệp sạch",
        "district": "Huyện Củ Chi",
        "address": "816/18 Nguyễn Thị Rành, Xã An Nhơn Tây, Huyện Củ Chi",
        "highlight": "Trang trại nông nghiệp hữu cơ xanh mát rộng hơn 20ha theo mô hình Nhật Bản và Hàn Quốc. Du khách được tự tay hái nấm linh chi, hái dưa lưới công nghệ cao, vắt sữa bò sữa, thăm chuồng cừu dê, cưỡi ngựa và thưởng thức ẩm thực từ nông sản sạch tại chỗ.",
        "best_time": "08:00 – 17:30 (Đẹp nhất vào sáng sớm hoặc chiều mát)",
        "price": "50.000 VNĐ/người lớn (gồm hái nấm tươi và tham quan nông trại)",
        "tips": "Trải nghiệm 'chữa lành' xả stress tuyệt vời cho gia đình và trẻ nhỏ tiếp xúc thiên nhiên; có dịch vụ homestay nhà tre mộc mạc bên hồ sen.",
        "img_file": "45_Nong_trang_Xanh_Green_Noen_Cu_Chi.jpg",
        "rating": "⭐⭐⭐⭐ Eco Adventure"
    }
]

def make_thumbnail(src_path, dst_path, target_width=140, target_height=90):
    try:
        with PILImage.open(src_path) as im:
            im = im.convert('RGB')
            # Fit and crop nicely
            im.thumbnail((target_width * 2, target_height * 2), PILImage.Resampling.LANCZOS)
            # Create a neatly centered/cropped version
            w, h = im.size
            # Calculate aspect ratio
            aspect = w / h
            target_aspect = target_width / target_height

            if aspect > target_aspect:
                # wider: crop width
                new_w = int(h * target_aspect)
                left = (w - new_w) // 2
                im_cropped = im.crop((left, 0, left + new_w, h))
            else:
                # taller: crop height
                new_h = int(w / target_aspect)
                top = (h - new_h) // 2
                im_cropped = im.crop((0, top, w, top + new_h))

            im_final = im_cropped.resize((target_width, target_height), PILImage.Resampling.LANCZOS)
            im_final.save(dst_path, 'JPEG', quality=92)
            return True
    except Exception as e:
        print(f"Error processing thumbnail for {src_path}: {e}")
        return False

def generate_master_excel(output_filename):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "45 Địa Điểm Du Lịch TP.HCM"

    # Styles
    font_title = Font(name="Segoe UI", size=16, bold=True, color="1E3A8A")
    font_subtitle = Font(name="Segoe UI", size=10, bold=False, color="64748B")
    font_header = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    fill_header = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")

    font_data = Font(name="Segoe UI", size=10, color="0F172A")
    font_bold = Font(name="Segoe UI", size=10, bold=True, color="0F172A")
    font_tips = Font(name="Segoe UI", size=9, color="475569")

    fill_even = PatternFill(fill_type=None)
    fill_odd = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

    border_thin = Border(
        left=Side(style="thin", color="CBD5E1"),
        right=Side(style="thin", color="CBD5E1"),
        top=Side(style="thin", color="CBD5E1"),
        bottom=Side(style="thin", color="CBD5E1")
    )

    align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
    align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)

    # Row 1: Title
    ws.merge_cells("A1:K1")
    ws["A1"] = "BẢNG TỔNG HỢP 45 ĐỊA ĐIỂM DU LỊCH TP. HỒ CHÍ MINH (NHÚNG ẢNH THỰC TẾ CHUẨN ĐẸP)"
    ws["A1"].font = font_title
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 42.0

    # Row 2: Subtitle
    ws.merge_cells("A2:K2")
    ws["A2"] = "Dữ liệu chuẩn hóa 2026 | Nhúng ảnh thực tế chất lượng cao, đầy đủ thông tin vị trí, đặc điểm, giờ tham quan, giá vé & mẹo local"
    ws["A2"].font = font_subtitle
    ws["A2"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 22.0

    # Row 3: Headers (1 single column for Image)
    headers = [
        "STT",
        "Tên Địa Điểm / Danh Thắng",
        "Phân Loại",
        "Quận / Huyện",
        "Địa Chỉ / Tọa Độ",
        "Đặc Điểm Nổi Bật & Trải Nghiệm",
        "Thời Điểm Lý Tưởng",
        "Giá Vé Tham Khảo",
        "Mẹo Du Lịch Local (Tips)",
        "Hình Ảnh Thực Tế",
        "Đánh Giá / Ghi Chú"
    ]

    for col_idx, h_text in enumerate(headers, 1):
        cell = ws.cell(3, col_idx)
        cell.value = h_text
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_thin

    ws.row_dimensions[3].height = 34.0

    # Column widths
    col_widths = {
        "A": 6.0,
        "B": 28.0,
        "C": 24.0,
        "D": 16.0,
        "E": 32.0,
        "F": 45.0,
        "G": 25.0,
        "H": 20.0,
        "I": 45.0,
        "J": 24.0,   # Column for embedded Image
        "K": 18.0
    }
    for col_letter, width in col_widths.items():
        ws.column_dimensions[col_letter].width = width

    # Data Rows
    for row_idx, item in enumerate(destinations, 4):
        current_fill = fill_odd if (row_idx % 2 == 1) else fill_even
        ws.row_dimensions[row_idx].height = 82.0  # Height for neat image display

        # Col 1: STT
        c1 = ws.cell(row_idx, 1, item["stt"])
        c1.font = font_bold
        c1.alignment = Alignment(horizontal="center", vertical="center")

        # Col 2: Name
        c2 = ws.cell(row_idx, 2, item["name"])
        c2.font = font_bold
        c2.alignment = align_left

        # Col 3: Category
        c3 = ws.cell(row_idx, 3, item["category"])
        c3.font = font_data
        c3.alignment = align_left

        # Col 4: District
        c4 = ws.cell(row_idx, 4, item["district"])
        c4.font = font_data
        c4.alignment = Alignment(horizontal="center", vertical="center")

        # Col 5: Address
        c5 = ws.cell(row_idx, 5, item["address"])
        c5.font = font_data
        c5.alignment = align_left

        # Col 6: Highlights
        c6 = ws.cell(row_idx, 6, item["highlight"])
        c6.font = font_data
        c6.alignment = align_left

        # Col 7: Best time
        c7 = ws.cell(row_idx, 7, item["best_time"])
        c7.font = font_data
        c7.alignment = align_left

        # Col 8: Ticket price
        c8 = ws.cell(row_idx, 8, item["price"])
        c8.font = font_bold
        c8.alignment = align_center

        # Col 9: Tips
        c9 = ws.cell(row_idx, 9, item["tips"])
        c9.font = font_tips
        c9.alignment = align_left

        # Col 10: Image placeholder / text
        c10 = ws.cell(row_idx, 10, "")
        c10.alignment = Alignment(horizontal="center", vertical="center")

        # Col 11: Rating
        c11 = ws.cell(row_idx, 11, item["rating"])
        c11.font = font_data
        c11.alignment = Alignment(horizontal="center", vertical="center")

        # Apply fills and borders to all columns A-K
        for col_idx in range(1, 12):
            cell = ws.cell(row_idx, col_idx)
            cell.fill = current_fill
            cell.border = border_thin

        # Embed Image into Col 10 (J)
        raw_img_name = item["img_file"]
        jpg_img_path = os.path.join('jpg', raw_img_name)
        if not os.path.exists(jpg_img_path):
            # fallback check in tphcm
            jpg_img_path = os.path.join('tphcm', raw_img_name)

        if os.path.exists(jpg_img_path):
            thumb_path = os.path.join(thumb_dir, f"thumb_{item['stt']:02d}.jpg")
            # Create thumbnail 150x90
            make_thumbnail(jpg_img_path, thumb_path, target_width=150, target_height=90)

            # Add to worksheet
            xl_img = OpenpyxlImage(thumb_path)
            xl_img.width = 150
            xl_img.height = 90
            # Anchor at cell J{row_idx}
            ws.add_image(xl_img, f"J{row_idx}")

    wb.save(output_filename)
    print(f" Xuất thành công: {output_filename} (45 địa điểm, nhúng 45 ảnh thực tế chuẩn đẹp)")

if __name__ == "__main__":
    generate_master_excel("Danh_Sach_45_Dia_Diem_Du_Lich_TP_Ho_Chi_Minh.xlsx")
    generate_master_excel("Danh_Sach_45_Dia_Diem_Du_Lich_TPHCM.xlsx")
