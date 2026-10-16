## 1. Backup (bước chặn)

- [x] 1.1 Export toàn bộ bảng `locations` ra file SQL/CSV và lưu ngoài repo — Supabase free tier không có backup tự động, đây là đường rollback duy nhất cho mọi UPDATE phía sau
- [x] 1.2 Ghi lại số liệu baseline để verify sau: tổng 70 active, verified SG 6 / HN 15 / DN 26, `is_featured` 0, bảng `vibes` 0 rows
- [x] 1.3 Xác nhận export đọc lại được (mở file, kiểm có đủ 70 rows) — export lỗi mà không biết thì tệ hơn không export

## 2. Review và đánh verified 23 địa điểm TP.HCM

- [x] 2.1 Query ra 23 rows `city = 'SG' AND verified = false`, lấy `id, name, address, photos, category, style_tag`
- [x] 2.2 Review từng row: có `name` thật, `address` hợp lý, `photos` trỏ tới ảnh S3 còn sống. Ghi lại id nào đạt, id nào không
- [x] 2.3 `UPDATE locations SET verified = true WHERE id IN (<danh sách id đã review>)` — theo danh sách id cụ thể, không dùng `WHERE city = 'SG'` (design D8)
- [x] 2.4 Verify `count(*) WHERE city='SG' AND is_active AND verified` = 29 (hoặc thấp hơn nếu 2.2 loại bớt row — ghi rõ số thực tế)

## 3. Migration: derive vibes, price_per_person, duration_minutes

- [x] 3.1 Tạo migration mới với timestamp riêng tới mức giây (design D2 — không dùng chung prefix với migration nào đã có)
- [x] 3.2 Derive `vibes`: tách `style_tag` theo dấu phẩy, trim từng phần tử, chỉ ghi khi `vibes` đang rỗng hoặc null (idempotent)
- [x] 3.3 Derive `price_per_person` từ `price_level` theo band ở design D3: 1→30.000, 2→80.000, 3→200.000, 4→500.000; chỉ ghi khi `price_per_person = 0`
- [x] 3.4 Derive `duration_minutes` theo category ở mức best-effort; giữ 120 cho category không khớp (spec cho phép, 120 là giá trị đúng với nhiều loại)
- [x] 3.5 Bọc migration trong transaction; chạy lại lần hai xác nhận không nhân bản phần tử `vibes` và không đổi `price_per_person`
- [x] 3.6 Verify: `count WHERE vibes <> '{}'` = 70 và `count WHERE price_per_person > 0` = 70

## 4. Migration: derive cover_image

- [x] 4.1 Tạo migration riêng (timestamp riêng) set `cover_image` = URL đầu tiên trong `photos`, đã trim
- [x] 4.2 Để `cover_image` null với row không có `photos` — không chèn placeholder, không dùng `picsum.photos` (spec cấm)
- [x] 4.3 Verify `count WHERE cover_image NOT NULL` = 70 và không `cover_image` nào chứa `picsum`

## 5. Backfill hint

- [x] 5.1 Sửa `supabase/functions/batch-generate-hints/index.ts`: `.select()` dùng `coalesce(short_description, long_description)` thay cho `description` (đang 0/70)
- [x] 5.2 Đọc lại prompt sinh hint, xác nhận nó yêu cầu teaser gợi tò mò và cấm nhắc tên/địa chỉ (spec `location-free-tier-content`)
- [x] 5.3 Deploy function, invoke với `--limit=10` để sinh mẫu 10 hint
- [x] 5.4 **Cổng người quyết định:** đọc 10 hint đó. Là teaser hay bản tóm tắt nhạt? Có lộ tên địa điểm không? Nếu kém — sửa prompt, xóa 10 hint vừa sinh, quay lại 5.3. `hint` null thì vô hại, `hint` dở thì có hại
- [x] 5.5 Sau khi mẫu đạt, invoke cho toàn bộ 70 rows
- [x] 5.6 Verify `count WHERE hint NOT NULL` = 70 và `hint_generated_at` đã ghi
- [x] 5.7 Verify không hint nào lộ tên: query các row có `hint ILIKE '%' || name || '%'` — kỳ vọng 0 rows

## 6. Set is_featured

- [x] 6.1 Chọn tay 2–3 địa điểm mỗi thành phố (SG/HN/DN) từ các row `verified = true` có `cover_image` và `hint` (design D7 — không chọn random, card này đổi mỗi deploy thì tệ)
- [x] 6.2 `UPDATE locations SET is_featured = true WHERE id IN (<danh sách>)`
- [x] 6.3 Verify mỗi thành phố có ≥1 featured, và không featured nào có `verified = false` (spec `featured-locations`)
- [x] 6.4 Mở home trong app, xác nhận card nổi bật render thật — đây là feature đang chết, phải thấy nó sống

## 7. Reseed bảng vibes

- [x] 7.1 Query phân bố: mỗi vibe trong `locations.vibes` xuất hiện ở bao nhiêu địa điểm active
- [x] 7.2 Áp ngưỡng ≥3 địa điểm (design D4). **Nếu còn dưới 5 vibe thì hạ ngưỡng xuống 2** — ngưỡng này là phỏng đoán, số liệu ở 7.1 mới quyết
- [x] 7.3 Tạo migration reseed bảng `vibes` từ các vibe đạt ngưỡng, `ON CONFLICT (name) DO NOTHING`
- [x] 7.4 Verify bảng `vibes` có ≥1 row, và `useVibes` lấy dữ liệu từ bảng thay vì chạy nhánh fallback parse `style_tag`

## 8. Bỏ rating khỏi tầng free

- [x] 8.1 Tạo migration recreate `locations_preview` không có cột `rating` (design D6 — không backfill, không có nguồn thật)
- [ ] 8.2 Verify `GET /rest/v1/locations_preview?select=*` không trả về `rating`
- [x] 8.3 Xác nhận không app code nào đọc `rating` từ preview view sẽ vỡ — `PlaceGridCard` và `FeaturedPlaceCard` đang đọc `location.rating` từ bảng `locations`, nên chúng không bị ảnh hưởng ở change này

## 9. Verify toàn bộ và xác nhận ba feature đã sống

- [x] 9.1 Đếm lại đầy đủ tầng free: `hint`, `cover_image`, `vibes <> '{}'`, `price_per_person > 0` đều = 70
- [ ] 9.2 Xác nhận card nổi bật ở home render (feature chết #1)
- [x] 9.3 Xác nhận lọc của AI planner hoạt động thật: tạo trip với vibe cụ thể, kiểm query chính của `plan-trip` trả về rows thay vì rơi xuống fallback; đổi vibe thấy pool đổi theo (feature chết #2)
- [x] 9.4 Xác nhận `VibeChips` đọc từ bảng `vibes` (feature chết #3)
- [x] 9.5 Đếm số địa điểm còn lại sau khi lọc ngân sách ở từng band, từng thành phố. **Nếu Hà Nội (15 rows) không đủ dựng lịch trình 3 ngày ở band thấp — ghi lại làm input ưu tiên cho change bơm dữ liệu, không tắt lọc lại** (design, Open Questions)
- [x] 9.6 Ghi số liệu cuối vào proposal hoặc ghi chú change, để lần sau không phải đo lại production
