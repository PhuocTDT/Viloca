## Why

Viloca đang hiển thị thời tiết nhưng chưa giúp người dùng xử lý hoạt động bị ảnh hưởng bởi dự báo mới. Sen cần giải thích ảnh hưởng, đưa ra lựa chọn phù hợp địa phương và chỉ thay đổi lịch khi người dùng chọn phương án cụ thể.

## What Changes

- Đối chiếu dự báo theo giờ với địa điểm, giờ và thời lượng hoạt động sắp tới; phân biệt dự báo xấu được phát hiện lần đầu với dự báo thực sự thay đổi.
- Hiển thị lời nhắc của Sen kèm bốn lựa chọn: dời muộn hơn trong ngày, đổi ngày, thay bằng hoạt động trong nhà, giữ nguyên. Đóng lời nhắc không được coi là đồng ý đổi lịch.
- Chỉ đề xuất giờ/ngày thay thế sau khi kiểm tra dự báo, lịch trống và thông tin mở cửa; thiếu dữ liệu phải nói rõ. Dự báo tốt hơn không đồng nghĩa bảo đảm an toàn hoặc chắc chắn tạnh mưa.
- Đề xuất địa điểm trong nhà từ dữ liệu được xác nhận, phù hợp khu vực và nhu cầu; không mặc định mọi quán cà phê đều ở trong nhà.
- Gợi ý phương tiện mang tính địa phương cho Huế, Hội An, Miền Tây, Hà Giang. Điều chỉnh gợi ý theo mưa, giông, gió và sương mù; không mặc định đi bộ, ô tô hay đi sớm luôn an toàn khi thời tiết xấu.
- Lưu quyết định để không nhắc lặp lại, bảo vệ lịch trình khi mất mạng/lưu lỗi và khi có thay đổi đồng thời từ thiết bị khác.
- Phạm vi bản đầu được đề xuất: kiểm tra khi mở lịch trình, quay lại app hoặc làm mới trong màn hình lịch trình. Không hứa theo dõi khi app đóng; thông báo nền là giai đoạn riêng.
- Đợt làm việc này chỉ tạo tài liệu đặc tả và kế hoạch, không thay đổi mã ứng dụng hoặc cơ sở dữ liệu.

## Capabilities

### New Capabilities

- `trip-weather-awareness`: Dự báo theo giờ, nhận diện ảnh hưởng lên hoạt động và quản lý vòng đời cảnh báo.
- `weather-itinerary-decisions`: Bốn lựa chọn của người dùng, đề xuất khả thi, kiểm tra và lưu thay đổi lịch an toàn.
- `local-weather-transport`: Gợi ý phương tiện theo vùng và điều kiện thời tiết, có xử lý khi thiếu dữ liệu.

### Modified Capabilities

Không sửa yêu cầu của các capability đã có trong `openspec/specs/`.

## Impact

- `src/hooks/useWeather.ts`, `app/weather/index.tsx`: tái sử dụng lớp truy xuất dự báo; giữ tương thích phần thời tiết hiện tại.
- `app/trip/[id].tsx`: điểm tích hợp cảnh báo, lựa chọn, xem trước và cập nhật danh sách sau khi lưu thành công.
- `src/lib/weather-codes.ts`: tách biểu tượng hiển thị khỏi phân loại rủi ro; hiện tại sương mù được gộp vào nhiều mây, không phù hợp để quyết định phương tiện.
- `src/types/index.ts`, `src/lib/i18n.ts`, thành phần Sen: thêm kiểu dữ liệu, thông điệp và giao diện Việt/Anh.
- Supabase: metadata hoạt động/địa điểm, phiên bản lịch trình, trạng thái cảnh báo/quyết định và thao tác cập nhật có giao dịch, kiểm tra chủ sở hữu.
- Open-Meteo: lấy dự báo theo giờ, ghi nhận thời điểm lấy dữ liệu, cache và hạn chế gọi trùng. Không dùng AI để tự bịa dự báo, địa điểm hay giờ mở cửa.
- Dữ liệu thử nghiệm cần kịch bản thời tiết cố định; không cần tạo thêm tài khoản và không đưa tài khoản local vào Git.
