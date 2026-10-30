# Bản đồ tĩnh offline của chuyến đi

## Cách sử dụng

1. Khi có mạng, mở chuyến đi → nút bản đồ → chọn ngày.
2. Chờ nền đường phố và tuyến đường tải đầy đủ. Chọn **Lưu bản đồ offline**.
3. App mở bản đã lưu và hiện thời gian lưu. Lặp lại cho những ngày cần dùng offline.
4. Khi mất mạng, mở **Chuyến đi** → chuyến đã lưu → bản đồ. Dùng `+`, `−`, `↔` để phóng to, thu nhỏ, xem toàn bộ ảnh. Danh sách bên dưới đối chiếu số điểm dừng với tên, giờ, địa chỉ và ghi chú.

Ảnh nằm trong bộ nhớ tài liệu của app, không phụ thuộc cache ảnh tạm hoặc trình duyệt. Đây là ảnh tĩnh, không bám vị trí GPS và không tính lại tuyến khi đang offline. Xóa dữ liệu app hoặc gỡ app sẽ xóa các bản đã lưu.

## Nguồn bản đồ và tuyến đường

- Nền đường phố: OpenFreeMap/OpenMapTiles/OpenStreetMap, hiển thị bằng MapLibre GL JS 5.9.0 trong WebView. Không cần khóa Mapbox hoặc CARTO.
- Tuyến: OSRM, chế độ `driving`, giữ thứ tự điểm dừng của lịch trình. Chỉ lưu sau khi tuyến thực tế và nền bản đồ đã tải xong; không thay bằng đường thẳng khi dịch vụ tính tuyến lỗi.
- Ảnh PNG chụp toàn tuyến ở mật độ 2×, giữ thông tin nguồn bản đồ. Không tải trước vùng địa lý hoặc nhiều mức zoom.
- Mỗi tài khoản/chuyến/ngày có một bản lưu. Ghi tệp mới hoàn chỉnh rồi mới đổi con trỏ bản lưu; lỗi ghi không làm mất bản cũ.
- Khi tọa độ, thứ tự, giờ, tên, địa chỉ hoặc ghi chú thay đổi, app báo bản đồ cũ cần lưu lại. Bản cũ dùng danh sách điểm dừng đi kèm lúc chụp để tránh ghép nhầm.
- Nếu có điểm chưa có tọa độ, app báo rõ và chặn lưu một lộ trình thiếu điểm.

Nguồn tham khảo: [OpenFreeMap Quick Start](https://openfreemap.org/quick_start/), [MapLibre MapOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/), [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem-legacy/).

## Kiểm tra

- `npx tsc --noEmit`
- `npx jest --runInBand`
- `node scripts/verify-offline-map.cjs`: cần Playwright và Microsoft Edge trên máy phát triển. Dùng bản đồ thật tại Đà Nẵng, xác nhận nền có dữ liệu địa lý, xuất PNG, mở trong phiên trình duyệt mới không có mạng, kiểm tra zoom/toàn ảnh và từ chối chụp khi tuyến hoặc nền tải lỗi. Ảnh kiểm tra nằm ở `.expo/offline-map-qa/`.

Trước khi phát hành, kiểm tra thêm trên Android/iOS thật:

1. Lưu ít nhất hai ngày có tuyến khác nhau; kiểm tra số điểm và tên đường trong ảnh.
2. Bật chế độ máy bay, tắt hẳn app, mở lại và truy cập chuyến đi từ danh sách. Cả lịch trình lẫn ảnh từng ngày phải mở được.
3. Phóng to/thu nhỏ và đổi ngày khi offline; không thấy ảnh của ngày/chuyến khác.
4. Có mạng trở lại, đổi thứ tự điểm rồi mở bản đã lưu: phải có cảnh báo cũ; lưu lại thành công phải hết cảnh báo.
5. Ngắt mạng lúc tải hoặc lưu: không báo thành công cho bản thiếu; bản đã lưu trước đó vẫn mở được.

Kiểm thử trình duyệt không thay thế kiểm thử vòng đời app, quyền lưu trữ và WebView trên thiết bị thật.
