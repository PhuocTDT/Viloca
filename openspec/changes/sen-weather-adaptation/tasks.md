## 1. Chuẩn bị dữ liệu và cấu hình

- [x] 1.1 Tạo cấu hình có phiên bản cho ngưỡng ảnh hưởng, cửa sổ 72 giờ, dự báo 7 ngày, TTL 30/60 phút và bán kính 10 km theo design; ghi rõ đây là ngưỡng sản phẩm thử nghiệm.
- [x] 1.2 Định nghĩa metadata vùng, trong nhà/ngoài trời, mức tiếp xúc thời tiết, thời lượng, nguồn xác nhận và giờ mở cửa có cấu trúc; giữ `unknown` cho dữ liệu cũ.
- [ ] 1.3 Lập mapping vùng Huế/Hội An/Miền Tây/Hà Giang và bộ địa điểm đủ thông tin để thử; không dùng nearestCityCode để suy ra vùng mới.
- [ ] 1.4 Tạo fixture dự báo cố định: lần đầu mưa, tốt→xấu, giông, sương mù, gió, nguy cơ giảm, thiếu giờ/biến và lệch múi giờ; không thêm tài khoản hoặc mật khẩu local vào Git.

## 2. Dịch vụ dự báo và cache

- [ ] 2.1 Tách adapter Open-Meteo theo giờ, kiểm tra HTTP/schema/đơn vị và chuẩn hóa khoảng mưa theo giờ kết thúc, timezone Việt Nam và các giá trị null.
- [ ] 2.2 Thêm cache/gộp request theo tọa độ và khoảng ngày, lưu fetched_at riêng với model-issued-at nếu có; cấu hình hạn mức và attribution phù hợp triển khai.
- [ ] 2.3 Thêm trigger tải khi mở/foreground/làm mới và timer 30 phút khi màn hình hoạt động; hủy request cũ, giới hạn refresh thủ công 60 giây.
- [ ] 2.4 Xây lớp service phía server cấp/kiểm tra snapshot tham chiếu để việc xác nhận phương án không tin đánh giá thời tiết tự khai từ client.
- [ ] 2.5 Kiểm thử cache cũ, lỗi HTTP, response thiếu biến, tọa độ đổi và chuyển chuyến khi đang tải; duy trì tương thích WeatherChip và trang thời tiết hiện tại.

## 3. Đánh giá ảnh hưởng và chống nhắc lặp

- [ ] 3.1 Viết hàm thuần xác định khoảng hoạt động/khung buổi theo start_date, day_number, visit_time và thời lượng; xử lý chưa có ngày/giờ/tọa độ.
- [ ] 3.2 Viết phân loại nguy cơ theo WMO gốc, mưa, gió, tầm nhìn và exposure; ưu tiên nguy cơ đã biết khi thiếu biến, không gộp sương mù thành trời đẹp.
- [ ] 3.3 Thực hiện baseline, schedule fingerprint, risk signature và episode; chỉ so cùng hoạt động/thời gian, phân biệt lần đầu với dự báo thay đổi.
- [ ] 3.4 Thực hiện giữ nguyên qua phiên/thiết bị, nguy cơ mới/tăng, hồi phục qua hai snapshot cách nhau 30 phút và chống dao động quanh ngưỡng.
- [ ] 3.5 Kiểm thử các scenario trong `trip-weather-awareness`, gồm timezone thiết bị khác Việt Nam, hoạt động đã qua và ngày ngoài tầm dự báo.

## 4. Đề xuất lịch và phương tiện

- [ ] 4.1 Viết tìm giờ muộn hơn cùng ngày theo bước 30 phút, xét đủ thời lượng, dự báo cả khoảng, lịch trống, mở cửa và đệm di chuyển.
- [ ] 4.2 Viết tìm ngày/giờ khác trong chuyến đi; phân biệt phương án đã kiểm tra và đổi thủ công khi chưa có dự báo, không tự mở rộng chuyến đi.
- [ ] 4.3 Viết truy vấn/xếp hạng địa điểm trong nhà có xác nhận theo vùng/bán kính/sở thích/ngân sách; xử lý thiếu giá/giờ mở cửa và không có phương án.
- [ ] 4.4 Thêm rule và nội dung phương tiện cho bốn vùng; ưu tiên nguy cơ cao/thiếu dữ liệu, quy tắc đi bộ Hội An và đi sớm Miền Tây, không ngụ ý xác nhận dịch vụ đang hoạt động.
- [ ] 4.5 Kiểm thử trùng lịch, thiếu duration, đóng cửa, khoảng di chuyển không đủ, mưa nhẹ chưa vượt ngưỡng và địa điểm Café chưa xác nhận trong nhà.

## 5. Schema, quyền và giao dịch quyết định

- [ ] 5.1 Viết migration bổ sung metadata, revision, weather events/decisions với unique key, foreign key, RLS và xóa theo chủ sở hữu/chuyến đi; mặc định không phát sinh thay đổi lịch.
- [ ] 5.2 Bảo đảm mọi đường ghi trip/items hiện hữu tăng itinerary_revision khi thay nội dung liên quan; kiểm tra thao tác thêm/xóa/kéo thả/đổi ngày/đổi buổi.
- [ ] 5.3 Viết RPC xác nhận bốn hành động: kiểm tra ownership, expected_revision, fingerprint, snapshot mới, request_id và ràng buộc lịch; rollback toàn bộ khi lỗi.
- [ ] 5.4 Viết lưu bản trước/sau, hoàn tác trong 10 giây có kiểm tra revision; thay địa điểm phải bỏ snapshot experience cũ và giữ ghi chú cá nhân.
- [ ] 5.5 Kiểm thử tích hợp local: owner/non-owner, giữ nguyên không tăng revision, bấm hai lần, response mất, rollback, hai thiết bị sửa song song và snapshot không được xác thực.

## 6. Giao diện Sen và đồng bộ lịch

- [ ] 6.1 Đặt chip thời tiết nổi bật ở mép dưới ảnh bìa, biểu tượng có màu và huy hiệu đếm; chạm để mở bảng Sen gom hoạt động theo mức ảnh hưởng/thời gian và thể hiện thời điểm lấy dự báo; không tự mở modal chặn thao tác.
- [ ] 6.2 Thêm bảng bốn lựa chọn, chooser cụ thể, xem trước trước→sau và một nút xác nhận có nội dung chính xác; đóng bảng không lưu.
- [ ] 6.3 Hiển thị thiếu dữ liệu/không có phương án/đổi thủ công, phân biệt sửa lịch cá nhân với đổi vé hoặc đặt chỗ.
- [ ] 6.4 Nối API xác nhận/hoàn tác, xử lý stale revision và retry theo request_id; chỉ đổi UI và cache chuyến đi sau kết quả server.
- [ ] 6.5 Thêm bản dịch Việt/Anh, trạng thái loading/error/offline và nhãn truy cập; kiểm tra font lớn/màn hình hẹp, không cắt tên hoạt động hoặc bốn lựa chọn.
- [ ] 6.6 Hiển thị gợi ý phương tiện theo vùng và điều kiện; mở luồng dời khi người dùng chọn, không tự sửa phương tiện/đặt xe.

## 7. Nghiệm thu và rollout

- [ ] 7.1 Chạy TypeScript, các kiểm thử hiện có và các test có ý nghĩa của ba capability; sửa hồi quy trước rollout.
- [ ] 7.2 Kiểm tra UI bằng fixture: thuyền Hội An mưa chiều, không có giờ tốt hơn, thiếu hoạt động trong nhà, Hà Giang sương mù và Miền Tây sáng sớm xấu hơn.
- [ ] 7.3 Kiểm tra giữ nguyên qua mở lại/thiết bị khác, dự báo tốt lên không tự khôi phục lịch, offline không tự lưu khi nối mạng và cache đúng sau lưu thành công.
- [ ] 7.4 Rà soát đủ dữ liệu cho vùng sẽ bật, ngưỡng thử nghiệm và giới hạn sử dụng nhà cung cấp; bật feature flag ở local rồi rollout giới hạn.
- [ ] 7.5 Viết hướng dẫn kiểm tra và rollback bằng tắt flag; xác nhận không xóa hay hoàn nguyên những thay đổi người dùng đã chọn. Tạo backlog riêng nếu bổ sung thông báo khi app đóng.
