# Hướng Dẫn Kiểm Tra Tính Năng Bản Đồ (Map)

> Áp dụng cho: [app/map.tsx](../app/map.tsx), [src/hooks/useUserLocation.ts](../src/hooks/useUserLocation.ts), [src/services/awsLocation.ts](../src/services/awsLocation.ts), [src/tasks/dwellDetectionTask.ts](../src/tasks/dwellDetectionTask.ts), [src/services/notifications.ts](../src/services/notifications.ts).

## 1. Chuẩn bị trước khi test

- **Thiết bị**: máy thật hoặc emulator Android **có Google Play Services** (AWS Location + GPS giả lập cần dịch vụ định vị hoạt động). Máy thật cho kết quả GPS thật, chính xác hơn.
- **Biến môi trường** trong `.env.local` phải có:
  - `EXPO_PUBLIC_AWS_REGION`
  - `EXPO_PUBLIC_AWS_MAP_API_KEY`
  - Thiếu 2 biến này → bản đồ sẽ trắng/không load được tile (API key rỗng).
- **Kết nối mạng**: cần internet để tải style bản đồ (AWS Location) và gọi API tính tuyến đường.
- **Dữ liệu địa điểm**: địa điểm dùng để test cần có `lat`/`lng` trong bảng `locations` (cột được thêm ở migration `20260704000000_add_coordinates_to_locations.sql`). Nếu địa điểm chưa có toạ độ, chạy `scripts/geocode-locations.ts` để geocode trước, hoặc kiểm tra trực tiếp trong Supabase Table Editor.
- **Build**: dùng dev client đã build lại sau khi sửa `map.tsx` (không dùng Expo Go vì `@maplibre/maplibre-react-native` là native module).

---

## 2. Test luồng vào màn Bản đồ

| Bước | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Vào **Địa điểm** bất kỳ có toạ độ → nhấn nút chỉ đường/xem bản đồ (`app/location/[id].tsx`) | Điều hướng sang `/map?destLat=...&destLng=...&destName=...` |
| 2 | Vào **Experience detail** (`app/experience/[id].tsx`) → nhấn chỉ đường | Cũng điều hướng đúng sang `/map` với tham số toạ độ |
| 3 | Kiểm tra URL params khi thiếu `destLat`/`destLng` | App không crash, `destLat`/`destLng` mặc định về `0` (không nên xảy ra trong luồng thật, chỉ test phòng lỗi) |

---

## 3. Test quyền truy cập vị trí (Permission Flow)

| Bước | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Vào Cài đặt hệ thống → gỡ quyền vị trí của app → mở lại màn Map | Hiện màn hình "Cần quyền vị trí" với icon, mô tả và nút **Cấp quyền** |
| 2 | Nhấn **Cấp quyền** → chọn "Không cho phép" | Vẫn ở màn permission, không crash |
| 3 | Nhấn **Cấp quyền** → chọn "Chỉ khi dùng ứng dụng" | Chuyển sang hiển thị bản đồ, chấm vị trí người dùng xuất hiện |
| 4 | Mở app khi đã từng cấp quyền trước đó | Vào thẳng bản đồ, không hỏi lại quyền (do `getForegroundPermissionsAsync` check ở lần mount đầu) |

---

## 4. Test hiển thị bản đồ nền (Map Style)

| Bước | Kiểm tra | Kết quả mong đợi |
|---|---|---|
| 1 | Bản đồ load xong | Thấy tile bản đồ AWS Location (style "Standard"), không bị trắng/xám |
| 2 | Logo & nút attribution mặc định của MapLibre | **Không hiển thị** (đã tắt bằng `logo={false}` / `attribution={false}`) |
| 3 | Tắt wifi/4G rồi mở lại màn Map | Bản đồ không load được tile (do cần fetch style descriptor qua URL) — chấp nhận được vì cần internet, nhưng không được crash app |
| 4 | Sai `EXPO_PUBLIC_AWS_MAP_API_KEY` (test thử với key rỗng/sai) | Bản đồ không load tile, không crash — nên có log lỗi network trong console |

---

## 5. Test chấm vị trí người dùng & marker điểm đến

| Bước | Kiểm tra | Kết quả mong đợi |
|---|---|---|
| 1 | Sau khi cấp quyền, chờ vài giây | Chấm xanh (UserLocation) xuất hiện đúng vị trí hiện tại, có animation |
| 2 | Di chuyển thiết bị (hoặc giả lập di chuyển GPS trong emulator: Extended Controls → Location) | Chấm vị trí cập nhật theo (do `animated` prop) |
| 3 | Marker điểm đến (chấm tròn màu xanh viền trắng) | Hiển thị đúng toạ độ `destLat`/`destLng` được truyền vào |
| 4 | Tên địa điểm ở thanh thông tin cuối màn hình | Hiển thị đúng `destName`, không bị cắt xén kỳ lạ (test với tên dài) |

---

## 6. Test tính toán tuyến đường (Route)

| Bước | Kiểm tra | Kết quả mong đợi |
|---|---|---|
| 1 | Mở màn Map với vị trí người dùng cách điểm đến vài km | Badge "Đang tìm đường..." hiện góc trên, biến mất khi có kết quả |
| 2 | Sau khi có route | Đường polyline màu xanh (`colors.nomad.primary`) nối từ vị trí hiện tại đến điểm đến |
| 3 | Camera tự động | Camera tự "fit" để nhìn thấy cả điểm xuất phát và điểm đến (không bị cắt góc), có animation mượt (~600ms) |
| 4 | **Test fallback khi Routes API lỗi**: đặt `EXPO_PUBLIC_AWS_MAP_API_KEY` sai hoặc tắt mạng đúng lúc gọi route | Không crash — vẽ **đường thẳng** nối 2 điểm thay vì đường theo route thật (catch block trong `map.tsx`) |
| 5 | Khoảng cách hiển thị ở thanh dưới | `< 1km` hiển thị dạng mét (vd "850 m"), `>= 1km` hiển thị dạng km 1 số thập phân (vd "3.2 km") — kiểm tra hàm `formatDistance` |
| 6 | Đổi điểm đến sang vị trí rất xa (khác tỉnh/thành) | Route vẫn tính được (hoặc fallback đường thẳng), không bị treo app |

---

## 7. Test nút quay lại & UI phụ

| Bước | Kiểm tra | Kết quả mong đợi |
|---|---|---|
| 1 | Nhấn nút back (góc trên trái) | Quay lại đúng màn trước đó (`router.back()`) |
| 2 | Xoay ngang/dọc thiết bị (nếu app hỗ trợ) | Layout không vỡ, `insets` (notch/status bar) vẫn đúng |
| 3 | Thiết bị có tai thỏ/notch | Nút back và badge loading không bị đè lên status bar (dùng `useSafeAreaInsets`) |

---

## 8. Test định vị nền + phát hiện dừng chân (Dwell Detection) — ⚠️ Lưu ý quan trọng

Khi rà lại code, hàm `startDwellTracking()` trong [src/tasks/dwellDetectionTask.ts](../src/tasks/dwellDetectionTask.ts) **hiện chưa được gọi ở bất kỳ đâu trong app** — `app/_layout.tsx` chỉ import file này để **đăng ký định nghĩa task** (`TaskManager.defineTask`), chứ không có màn hình/luồng nào thực sự bật tracking khi bắt đầu chuyến đi "Đang diễn ra". Vì vậy:

- **Không thể test được đầy đủ qua luồng người dùng bình thường** — dù trip có status `active`, app sẽ không tự bật theo dõi vị trí nền.
- Đây là điểm cần bổ sung: cần gọi `startDwellTracking()` khi trip chuyển sang `active` (và `stopDwellTracking()` khi trip kết thúc/rời trang), ví dụ ở `app/trip/[id].tsx`.

**Cách test tạm thời (dành cho dev, không phải test qua UI):**

1. Trong `app/trip/[id].tsx` (hoặc file tạm thời), tự import và gọi `startDwellTracking()` khi màn hình mount để kiểm thử.
2. Cấp thêm quyền **vị trí nền** (Android: "Cho phép mọi lúc" — vì `startLocationUpdatesAsync` cần background location permission, không chỉ foreground).
3. Kiểm tra thông báo foreground service Android xuất hiện: tiêu đề "Viloca đang theo dõi vị trí", nội dung "Để gợi ý địa điểm thú vị gần bạn".
4. Đứng yên tại một vị trí có địa điểm trong bán kính 0.5km (kiểm tra bằng RPC `nearby_locations` chạy thử trong Supabase SQL editor) trong **10 phút liên tục**.
5. Sau 10 phút, kỳ vọng: app gọi RPC `nearby_locations`, nếu có kết quả sẽ gửi push notification "Địa điểm thú vị gần bạn 📍" kèm tên 1–2 địa điểm gần nhất.
6. Di chuyển ra khỏi bán kính 0.5km trước khi đủ 10 phút → bộ đếm dwell phải reset (kiểm tra qua log hoặc AsyncStorage key `@viloca/dwell_state`).
7. Test không bị **spam thông báo**: đứng yên lâu hơn 10 phút nhiều lần liên tiếp tại cùng địa điểm đã được thông báo → không gửi lại thông báo cho cùng location id (do `@viloca/dwell_notified_ids`), chỉ gửi lại nếu có địa điểm mới trong bán kính chưa từng thông báo.
8. Kiểm tra `stopDwellTracking()` dừng đúng: gọi hàm này rồi kiểm tra `TaskManager.isTaskRegisteredAsync` trả về false và state trong AsyncStorage bị xoá.

**Kiểm tra riêng RPC (không cần chạy app):** chạy trực tiếp trong Supabase SQL editor:
```sql
select * from nearby_locations(10.7769, 106.7009, 0.5, '{}');
```
kỳ vọng trả về tối đa 5 địa điểm `is_active = true` có toạ độ, sắp theo khoảng cách gần nhất.

---

## 9. Test thông báo đẩy (Push Notification)

| Bước | Kiểm tra | Kết quả mong đợi |
|---|---|---|
| 1 | Lần đầu mở app / màn nào gọi `requestNotificationPermission()` | Xin quyền thông báo hệ thống (Android 13+ bắt buộc) |
| 2 | Từ chối quyền thông báo | `sendNearbyLocationNotification` không throw lỗi, chỉ không hiển thị được thông báo |
| 3 | Android: kiểm tra kênh thông báo | Có kênh tên "Địa điểm gần bạn" (`nearby`), độ ưu tiên DEFAULT, có rung |
| 4 | Trigger thông báo với 1 địa điểm | Nội dung: "Bạn có biết {tên địa điểm} không?" |
| 5 | Trigger thông báo với nhiều địa điểm | Nội dung: "{địa điểm 1} và {N-1} nơi khác đang gần bạn" |
| 6 | Chạm vào thông báo | Kiểm tra `data: { type: 'nearby' }` được đính kèm — hiện **chưa có handler điều hướng khi tap notification**, nên xác nhận đây có phải hành vi mong muốn hay cần bổ sung |

---

## 10. Checklist tổng hợp nhanh

- [ ] Vào được màn Map từ Location detail và Experience detail
- [ ] Xin quyền vị trí đúng luồng (từ chối / đồng ý / đã cấp trước đó)
- [ ] Bản đồ AWS Location load tile thành công
- [ ] Chấm vị trí người dùng + marker điểm đến hiển thị đúng toạ độ
- [ ] Route vẽ đúng, có fallback đường thẳng khi API lỗi
- [ ] Khoảng cách format đúng đơn vị (m/km)
- [ ] Camera tự fit bounds mượt mà
- [ ] Nút back hoạt động, layout an toàn với notch/status bar
- [ ] ⚠️ Dwell detection: xác nhận với team là tính năng **chưa có nút/luồng bật trong UI** — cần quyết định bổ sung trước khi đưa vào bản demo/báo cáo là "đã hoàn thiện"
- [ ] Thông báo đẩy hoạt động đúng nội dung, đúng kênh Android
