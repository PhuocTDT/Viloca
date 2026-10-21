# Viloca — Hiện trạng & Lộ trình phát triển

Oct 19, 2026 · @r3dh4t

## Tóm tắt

Viloca đã có đủ lõi "khám phá → lên lịch bằng AI → ghi nhật ký", nhưng mô hình kinh doanh freemium chưa hoạt động thật và app chưa có lý do để người dùng quay lại hằng ngày.

Viloca là app du lịch Việt Nam (Expo SDK 56, React Native 0.85, Supabase), khoảng 5 tháng tuổi, có 68 địa điểm đã duyệt ở TP.HCM (27), Hà Nội (15) và Đà Nẵng (26). Số liệu này lấy từ tài liệu trong repo, chưa kiểm tra trực tiếp trên database production.

Ba việc nên làm đầu tiên:

1. **Bật gating thật cho bảng `locations`.** Policy `public_read_locations` vẫn còn, nên ai có anon key cũng đọc được tên, địa chỉ và tọa độ; UI che nhưng API thì không.
2. **Làm thanh toán Pro.** Nút "Nâng cấp" hiện chỉ đóng modal, và cột `plan` chỉ đổi được bằng tay.
3. **Nối Home với chuyến đi của người dùng** (chuyến sắp tới, lịch hôm nay) và thêm push notification, để có lý do mở app mỗi ngày.

## Hiện trạng: tính năng đã có

App có 10 nhóm tính năng chạy được; phần lớn đã dịch sang tiếng Anh (chuyển VI/EN).

| Nhóm | Những gì đã có |
| --- | --- |
| Đăng ký / đăng nhập | Email + mật khẩu, OTP xác thực email, Google Auth, chọn độ tuổi, splash, validation màn đăng ký |
| Home | Mascot Sen với bong bóng thoại xoay vòng, thanh tìm kiếm, chip danh mục từ DB, địa điểm nổi bật, lưới gợi ý có khoảng cách từ vị trí người dùng, lễ hội sắp tới, vibe chips, filter sheet |
| Tìm kiếm | RPC `search_locations` bỏ dấu tiếng Việt (unaccent), lọc theo danh mục và thành phố |
| Tạo chuyến đi | Form 992 dòng: điểm đến, ngày, vibe, ngân sách, đi với ai, mức vận động, ăn kiêng; tự lên lịch hoặc để AI lên lịch |
| AI lên lịch | Edge function `plan-trip` chạy trên AWS Bedrock, xác thực JWT, trừ credit (gói free 3 lượt), lọc theo vibe và ngân sách, mỗi slot có lý do gợi ý |
| Chi tiết chuyến đi | Ba tab. Timeline: kéo thả sắp xếp, chuyển hoạt động giữa các ngày, thêm/xóa địa điểm, nút mở Google Maps theo thứ tự. Journal: nhật ký theo ngày kèm mood. Info: đổi trạng thái chuyến đi, chia sẻ lịch trình dạng text |
| Địa điểm | Màn chi tiết phân tầng: free chỉ thấy gợi ý ẩn tên (`hint`), ảnh bìa, vibe; pro thấy tên, địa chỉ, ảnh đầy đủ |
| Cộng đồng | Tab Khám phá là feed bài viết: tạo bài tối đa 5 ảnh, like, comment, lưu bài, share |
| Hồ sơ | Sửa hồ sơ và avatar, thống kê số chuyến đi và số địa điểm, danh sách bài viết và chuyến đi của tôi, huy hiệu gói và số credit AI còn lại |
| Khác | Bookmark/favorite, cấu hình build APK qua EAS, 29 test Jest cho `trip-utils` |

## Vấn đề phát hiện

Có 8 vấn đề, trong đó hai cái đầu ảnh hưởng trực tiếp đến doanh thu.

| # | Vấn đề | Bằng chứng trong repo |
| --- | --- | --- |
| 1 | Freemium chưa bị chặn thật | Migration `20260627000002_enable_public_read_locations` vẫn hiệu lực. Proposal `revive-location-data` ghi việc bật gating là "ngoài scope, có change riêng" và chưa làm |
| 2 | Nút "Nâng cấp Pro" không làm gì | `create-trip.tsx:845` chỉ đóng modal. Không có Stripe, RevenueCat, MoMo hay VNPay. Cột `plan` chỉ đổi được bằng tay |
| 3 | Code chết hoặc chưa nối | `usePackingList`, `useTodaySchedule`, `useUpcomingTrip` không màn hình nào dùng; `useExperiences` vẫn đọc mock; ô "Đánh giá" trên Profile gán cứng `'0'` |
| 4 | Journal chưa đủ | Trên `main`, journal chỉ lưu text và mood; khi insert luôn gán `photos: []`, `weather: null` (`trip/[id].tsx:669`). Nhánh `feat/trip-journal-lifecycle-stats` (commit `7bd33c5`, chưa merge vào `main`) đã thêm ảnh, thời tiết, tự chuyển trạng thái chuyến đi, màn hoàn thành và bản đồ thống kê |
| 5 | Không có notification, offline, analytics | `package.json` không có `expo-notifications` hay NetInfo |
| 6 | Test, CI và kỹ thuật | Chỉ có test cho `trip-utils`; không có `.github/`; `trip/[id].tsx` 2046 dòng, `create-trip.tsx` 992 dòng; chuỗi migration có nhiều file trùng timestamp và `supabase db push` không dùng được; còn khoảng 50 checkbox kiểm thử thủ công chưa tick (chủ yếu map WebView, Android thật, test APK) |
| 7 | Dữ liệu còn mỏng | Hà Nội ở mức ngân sách thấp nhất (≤30k) chỉ còn 13 địa điểm, Đà Nẵng 12; một lịch 3 ngày cần khoảng 15 slot nên Hà Nội không dựng nổi mà không lặp địa điểm |
| 8 | Tài liệu lệch với code | `SPEC_MVP.md` và `ARCHITECTURE.md` còn mô tả cấu trúc cũ (`(tabs)`, `onboarding`, mock data); `README.md` trống; `CLAUDE.md` nói chỉ có 2 route group và không có test; `ROADMAP.md` và `Viloca_Phase1_Plan.md` mâu thuẫn nhau |

Hai task còn treo của `revive-location-data`: 8.2 (migration DDL `drop_rating_from_locations_preview` cần chạy trong SQL editor) và 9.2 (xác nhận card nổi bật render ở Home).

## Định hướng sản phẩm hiện tại

Viloca đang chuyển từ "app lập kế hoạch du lịch chung" sang **khám phá văn hóa địa phương, được AI cá nhân hóa, kinh doanh theo freemium**. Đây là suy luận từ code và các change gần đây, không phải một quyết định đã được ghi ra.

- **Bán sự tò mò**: tầng free chỉ thấy gợi ý ẩn tên, muốn biết địa điểm là đâu thì phải nâng cấp.
- **AI là sản phẩm chính**: lên lịch bằng AI bị giới hạn credit (free 3 lượt).
- **Sen là bản sắc thương hiệu**: mascot xuất hiện ở Home và đổi lời thoại.
- **Địa phương hóa**: lễ hội, vibe, dữ liệu 3 thành phố, hai ngôn ngữ.
- **Cộng đồng UGC** là lớp giữ chân.

Roadmap trong repo (`ROADMAP.md`, `Viloca_Phase1_Plan.md`) nhắm đúng retention và growth nhưng gần như chưa triển khai, và hai file này mâu thuẫn nhau (ví dụ ngân sách và AI chatbot ở Phase 1 hay Phase 4). Tài liệu này đề xuất thay chúng bằng một lộ trình duy nhất.

## Lộ trình đề xuất

Bốn giai đoạn, khoảng 8–12 tuần cho A–C; thời gian là ước lượng, cần chỉnh theo số người và thời gian thực tế.

### Giai đoạn A: Dọn nền (1–2 tuần)

Mục tiêu: đóng lỗ hổng bảo mật và sạch nợ kỹ thuật trước khi mở rộng.

- [ ] Áp migration còn treo `drop_rating_from_locations_preview` trong SQL editor; xác nhận card nổi bật render ở Home
- [ ] Bật gating thật: bỏ policy `public_read_locations`, sửa RPC `search_locations`, chuyển các query sang `locations_preview`
- [ ] Chuẩn hóa chuỗi migration (đổi tên file trùng timestamp), thử `supabase db push` trên môi trường staging
- [ ] Nối `useUpcomingTrip` và `useTodaySchedule` vào Home (chuyến đi sắp tới, lịch hôm nay); quyết định số phận `usePackingList`
- [ ] Bỏ mock experiences và số `'0'` gán cứng ở Profile
- [ ] Tách `trip/[id].tsx` thành TimelineTab, JournalTab, InfoTab
- [ ] Thêm CI (typecheck + jest) và test cho các luồng chính; chạy nốt checklist test thủ công trên Android thật
- [ ] Cập nhật `README.md`, `CLAUDE.md`; gộp các roadmap về một nguồn
- [ ] Thêm analytics để có số liệu cho các quyết định sau

### Giai đoạn B: Hoàn thiện lõi và kiếm tiền (3–4 tuần)

Mục tiêu: có người trả tiền và có lý do để họ quay lại.

- [ ] Thanh toán Pro (RevenueCat/IAP hoặc cổng VN như PayOS, MoMo), webhook cập nhật `plan`, gói mua thêm credit AI
- [ ] Trip lifecycle: tự chuyển `planning → active → completed` theo ngày, màn Trip Summary khi kết thúc (đã có trên nhánh `feat/trip-journal-lifecycle-stats`, chưa merge; cần xem lại và merge thay vì làm lại)
- [ ] Journal đầy đủ: ảnh từ thư viện, thời tiết, xem lại theo dòng thời gian (ảnh và thời tiết đã có trên cùng nhánh đó; phần xem lại theo dòng thời gian chưa kiểm tra)
- [ ] Push notification: nhắc trước chuyến đi, nhắc ghi nhật ký khi đang đi
- [ ] Ngân sách và chi tiêu theo chuyến (dự kiến so với thực tế, chia danh mục) và packing list
- [ ] Onboarding quiz chọn phong cách du lịch để cá nhân hóa ngay lần đầu
- [ ] Làm đầy dữ liệu: Hà Nội và Đà Nẵng ở mức ngân sách thấp, sau đó thêm Huế và Nha Trang (đã có file seed Nha Trang)

### Giai đoạn C: Giữ chân và tăng trưởng (4–6 tuần)

Mục tiêu: mỗi chuyến đi tạo ra người dùng mới, mỗi tuần có lý do mở app.

- [ ] Public Trip Story: link chia sẻ mở được không cần tài khoản, kèm nút "Tạo chuyến của bạn"
- [ ] Streak "Địa điểm hôm nay" và "On This Day" gửi lại kỷ niệm sau 1 tuần, 1 tháng, 1 năm
- [ ] Bản đồ trong chuyến đi khi đang đi
- [ ] Feed cộng đồng: theo dõi người dùng, gắn bài với địa điểm, sau đó review công khai

### Giai đoạn D: Mở rộng (sau)

Group trip với Supabase Realtime, local guide, referral, thêm tỉnh thành, chế độ offline.

## Tính năng đề xuất để tạo điểm độc đáo

10 ý tưởng tận dụng những gì Viloca đã có (Sen, văn hóa địa phương, AI, bảng `festivals`, cơ chế `hint` ẩn tên). Đây là đề xuất chưa được kiểm chứng với người dùng, nên chọn 2–3 ý để thử trước.

| # | Tính năng | Ý tưởng | Vì sao giữ chân |
| --- | --- | --- | --- |
| 1 | Sen lớn cùng bạn | Mascot thay đổi theo hành vi: đi nhiều nơi thì nở thêm cánh hoa, có "tâm trạng" theo chuyến đi | Gắn bó với nhân vật hơn là với một công cụ |
| 2 | Hộ chiếu văn hóa | Mỗi địa điểm check-in được một con dấu, gom thành bộ sưu tập ("Cà phê Sài Gòn xưa", "Làng nghề Hà Nội"), bản đồ 63 tỉnh dần được tô màu | Sưu tập và tiến độ thấy được |
| 3 | Giải mã địa điểm | Biến gợi ý ẩn tên của gói free thành trò đoán nơi chốn, đoán đúng được điểm | Giới hạn của gói free trở thành trò chơi, không còn là rào chặn |
| 4 | Lịch lễ hội thông minh | Dùng bảng `festivals` để đề xuất chuyến đi quanh Tết, Trung thu, rằm Hội An; nhắc trước 2–4 tuần | Quay lại theo mùa |
| 5 | Sen kể chuyện tại chỗ | Khi gần một địa điểm trong lịch trình, Sen kể ngắn một câu chuyện văn hóa; nâng `hint` thành "câu chuyện địa điểm" | Giá trị ngay khi đang đi |
| 6 | AI điều chỉnh lịch theo thời gian thực | Hôm nay mưa, quán đóng cửa hay đang mệt: bấm một nút để Sen sắp xếp lại phần còn lại của ngày | AI hữu ích mỗi ngày, không chỉ một lần lúc tạo lịch |
| 7 | Thẻ tổng kết chuyến đi | Cuối chuyến tự tạo ảnh tổng kết (ảnh, quãng đường, mood, câu trích nhật ký) để chia sẻ; làm thẻ ảnh tĩnh, không làm video | Mỗi lần chia sẻ là một lượt giới thiệu |
| 8 | Đi cùng bạn bè có bình chọn | Mời bạn vào chuyến đi, mỗi người đề xuất địa điểm và cả nhóm bình chọn | Hiệu ứng mạng: người được mời phải tải app |
| 9 | Gợi ý theo mùa và thời tiết | Gắn dự báo thời tiết vào từng ngày, tự đề xuất phương án trong nhà khi có mưa | Giảm chuyến đi hỏng vì thời tiết |
| 10 | Thử thách hàng tuần theo thành phố | Ví dụ "Ăn 3 món phở khác nhau ở Hà Nội", kết hợp huy hiệu | Tạo thói quen hàng tuần |

## Kế hoạch coding ngày mai

Bắt đầu bằng Giai đoạn A, theo thứ tự dưới đây. Bước 1 cần bạn chạy SQL trên Supabase, vì migration DDL không áp được qua REST API.

1. **Gating `locations`.** Đọc `supabase/migrations/20260627000002_enable_public_read_locations.sql` và `20260921000002_update_locations_rls_freemium.sql`, viết migration mới bỏ policy công khai. Sau đó sửa `src/hooks/useLocationSearch.ts` (RPC `search_locations`) và dọn mọi nơi gọi `from('locations')` (tìm bằng grep) sang `locations_preview`. Cần thử với tài khoản free và pro.
2. **Nối Home.** `app/(app)/index.tsx` cùng `src/hooks/useUpcomingTrip.ts` và `src/hooks/useTodaySchedule.ts`.
3. **Dọn code chết.** `src/hooks/useExperiences.ts` (mock), `usePackingList`, số `'0'` trong `app/(app)/profile/index.tsx`.
4. **CI.** Thêm workflow chạy `tsc` và `jest` (hiện chưa có `.github/`).
5. **Tách `app/trip/[id].tsx`** nếu còn thời gian, vì đây là file rủi ro nhất khi sửa tiếp.

Cần bạn quyết định trước khi code:

- [ ] Có môi trường Supabase staging để thử gating và migration không? Nếu chỉ có production thì cần backup trước.
- [ ] Thanh toán Pro dùng IAP (App Store/Google Play) hay cổng thanh toán Việt Nam? Điều này ảnh hưởng tới việc duyệt app trên store.
- [ ] Thành phố tiếp theo để bơm dữ liệu: Huế hay Nha Trang?
- [ ] Chọn công cụ analytics (PostHog hay Supabase).
- [ ] Roadmap nào là bản chính thức: giữ tài liệu này và gỡ `ROADMAP.md` cũ khỏi repo, hay chuyển nội dung này vào `docs/`?
