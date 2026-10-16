## Why

Toàn bộ cột tầng free của bảng `locations` đang rỗng trên production — `hint`, `cover_image`, `vibes`, `price_per_person`, `rating`, `duration_minutes` đều 0/70 rows có dữ liệu — trong khi các cột tầng pro (`name`, `photos`, `style_tag`, `price_level`, `short_description`) đầy 67–70/70. Dữ liệu đã được curate, nhưng nằm sai tầng so với mô hình freemium.

Nguyên nhân gốc: migration [20260626000000_enrich_locations_fields.sql](../../../supabase/migrations/20260626000000_enrich_locations_fields.sql) chưa bao giờ chạy. Nó trùng timestamp với `20260626000000_alter_locations_table.sql`, thứ tự alphabet khiến `alter` chạy trước và DROP đúng những cột mà `enrich` định UPDATE. Bằng chứng trong dữ liệu: dòng đầu của `enrich` là `UPDATE locations SET description = short_description`, mà `description` hiện 0/70 còn `short_description` là 67/70.

Hệ quả là ba feature đang chết âm thầm — không crash, không log, chỉ trả về rỗng:

1. **Card nổi bật ở home không bao giờ render.** `is_featured = true` có 0 rows, nên `useFeaturedLocation` luôn trả `null`.
2. **Cá nhân hóa của AI trip planner vô hiệu.** `plan-trip` lọc bằng `.overlaps('vibes', vibes)` — `vibes` là mảng rỗng ở mọi row nên query chính luôn trả 0 rows và rơi xuống fallback; `.lte('price_per_person', budget)` với `price_per_person = 0` thì luôn pass. Vibe và ngân sách user chọn ở `create-trip` không ảnh hưởng gì đến lịch trình.
3. **Bảng `vibes` rỗng.** Migration seed nó bằng `unnest(locations.vibes)`, vốn rỗng, nên `VibeChips` đang chạy nhánh fallback parse `style_tag`.

Thêm vào đó, 23 rows TP.HCM đã curate thủ công (Thảo Cầm Viên, Địa Đạo Củ Chi, Chùa Ngọc Hoàng, Nhà Thờ Tân Định, Đường Sách Nguyễn Văn Bình…) đang mang `verified = false` nên bị search loại bỏ. TP.HCM — thành phố test chính — đang chạy ở 6/29 địa điểm nó đã có.

Change này sửa cả bốn thứ bằng SQL thuần cộng một dòng trong edge function, không chạm app code. Nó cũng là tiền đề cho việc kích hoạt freemium gating: không thể che `name`/`address` trước khi tầng free có nội dung thay thế.

## What Changes

- Review và flip `verified = true` cho 23 rows TP.HCM đã curate → TP.HCM từ 6 lên 29 địa điểm hiển thị
- Viết lại `enrich_locations_fields` thành migration mới chạy được trên schema hiện tại: `style_tag` (text, phân cách phẩy) → `vibes[]`, `price_level` (1–4) → `price_per_person` (band VND), `duration_minutes` theo category
- Dẫn `photos` → `cover_image` (lấy URL đầu tiên trong danh sách)
- Sửa `batch-generate-hints` select `coalesce(short_description, long_description)` thay cho `description` (đang 0/70), rồi chạy backfill `hint` cho toàn bộ 70 rows — đã xác nhận 0/70 rows thiếu cả hai nguồn
- Set `is_featured` cho tối thiểu một địa điểm mỗi thành phố
- Reseed bảng `vibes` sau khi `locations.vibes` đã có dữ liệu
- **BREAKING (nội bộ, không ảnh hưởng client):** `rating` bị loại khỏi tầng free. Không có nguồn rating thật; migration cũ set cứng `4.0` đồng loạt cho mọi địa điểm, và một con số giống nhau trên mọi card là thứ user nhận ra ngay. View `locations_preview` bỏ cột này.

## Capabilities

### New Capabilities

- `location-free-tier-content`: Mọi địa điểm active phải có nội dung tầng free dẫn xuất từ các cột nguồn đã curate — `hint`, `cover_image`, `vibes[]`, `price_per_person`, `duration_minutes` — và tầng free không được phơi ra số liệu bịa.
- `featured-locations`: Mỗi thành phố được hỗ trợ phải có tối thiểu một địa điểm `is_featured`, để section nổi bật ở home luôn render.

### Modified Capabilities

(không có — `register-validation`, `trip-utils-tests`, `unit-test-infrastructure` không liên quan)

## Impact

- **supabase/migrations/**: 3 migration mới — derive cột tầng free, set `is_featured`, reseed bảng `vibes` + bỏ `rating` khỏi `locations_preview`
- **supabase/functions/batch-generate-hints/index.ts**: đổi cột nguồn trong `.select()`, cần redeploy và invoke một lần
- **Không chạm app code.** `useFeaturedLocation`, `VibeChips`, `plan-trip`, các card ở home đều đang query đúng cột — chúng chỉ đang nhận về rỗng. Dữ liệu đầy lên là chúng hoạt động.
- **Phụ thuộc bên ngoài**: `ANTHROPIC_API_KEY` (hoặc Bedrock creds) phải còn hiệu lực để `batch-generate-hints` chạy
- **Rủi ro**: UPDATE hàng loạt trên bảng production 70 rows. Cần snapshot/export trước khi chạy, và mỗi migration phải idempotent để chạy lại được.
- **Ngoài scope, có change riêng**: kích hoạt freemium gating (drop `public_read_locations`, sửa RPC `search_locations`, chuyển 7 query site sang preview view), hỗ trợ thành phố Huế, dọn migration chain

---

## Kết quả (đo trên production sau khi áp, 2026-10-12)

### Tầng free — từ 0/70 lên đủ

| | trước | sau |
|---|---|---|
| `hint` | 0/70 | **70/70** |
| `cover_image` | 0/70 | **70/70** |
| `vibes` khác rỗng | 0/70 | **70/70** |
| `price_per_person` > 0 | 0/70 | **70/70** |
| `rating` | 0/70 | bỏ khỏi tầng free (D6) |

`hint`: 0 row lộ tên địa điểm, 0 row lộ tên thành phố, 0 row còn markdown. Độ dài 54–94 từ (trung bình 71) — cao hơn mức 60 từ đặt trong prompt nhưng mọi câu đều trọn. Sinh qua Bedrock; 1 row (`Cà Phê Tư Ký`) phải sửa tay vì `short_description` của nó kết thúc bằng "Một mảnh Sài Gòn xưa còn sót lại" nên model liên tục bê tên thành phố vào qua 3 lần sinh lại.

### Số địa điểm hiển thị

| | trước | sau |
|---|---|---|
| SG verified | 6 | **27** |
| HN verified | 15 | 15 |
| DN verified | 26 | 26 |
| **tổng** | **47** | **68** |

21 trong 23 row TP.HCM được đánh verified sau review. 2 row bị loại vì thiếu cả `address` lẫn `coordinates`: `Xưởng Gốm Workshop Sài Gòn` và `Wonderlust Art Space` — cả hai còn mang category `Workshop`, không thuộc 14 giá trị chuẩn.

### Ba feature đã sống lại

1. **Card nổi bật ở home** — `is_featured` từ 0 lên 9 row (3 mỗi thành phố). Query của `useFeaturedLocation` chạy bằng anon key nay trả về row thật thay vì `null`.
2. **Lọc của AI planner** — query chính của `plan-trip` (`overlaps(vibes) + price_per_person <= budget`) nay trả 6–12 row tùy vibe, trước đây luôn trả 0 và rơi xuống fallback. Vibe và ngân sách user chọn giờ có tác dụng thật.
3. **Bảng `vibes`** — từ 0 lên 17 row. `useVibes` đọc từ bảng (với role `authenticated`; RLS bảng này là `TO authenticated` nên anon vẫn thấy 0 — không ảnh hưởng vì home nằm sau auth).

### Số địa điểm còn lại sau khi bật lọc ngân sách

| city | ≤30k | ≤80k | ≤200k | ≤500k |
|---|---|---|---|---|
| SG | 21 | 26 | 27 | 27 |
| HN | **13** | 15 | 15 | 15 |
| DN | 12 | 21 | 25 | 26 |

**Ghi nhận cho change bơm dữ liệu (task 9.5):** Hà Nội ở band ngân sách thấp nhất chỉ còn **13 địa điểm**. Một lịch trình 3 ngày cần ~15 slot (5 slot/ngày), nên **Hà Nội không dựng nổi lịch trình 3 ngày ở band ≤30k mà không lặp địa điểm**. Đây là input ưu tiên cho việc bơm dữ liệu — không phải lý do để tắt lọc ngân sách lại. Đà Nẵng cũng giảm từ 26 xuống 12 ở band thấp nhất.

### Chưa hoàn tất

Task 8.2 còn treo: migration [20261012010300_drop_rating_from_locations_preview.sql](../../../supabase/migrations/20261012010300_drop_rating_from_locations_preview.sql) là DDL (`DROP VIEW` / `CREATE VIEW`), không áp được qua REST API. Cần chạy trong Supabase SQL editor. `supabase db push` không dùng được — xem phần ghi chú về migration chain.
