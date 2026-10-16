## Context

Bảng `locations` trên production có 70 rows active và mang 33 cột thuộc hai thế hệ schema cùng tồn tại — `hint` cạnh `short_description`, `vibes` cạnh `style_tag`, `cover_image` cạnh `photos`, `price_per_person` cạnh `price_level`, `coordinates` cạnh `lat`/`lng`. Các lệnh `DROP COLUMN` trong [20260626000000_alter_locations_table.sql](../../../supabase/migrations/20260626000000_alter_locations_table.sql) chưa bao giờ được áp lên DB thật, nên không cột nào thực sự mất.

Thế hệ cũ (tầng free) rỗng hoàn toàn, thế hệ mới (tầng pro) đầy. Số liệu đo trực tiếp từ production:

```
TẦNG FREE                      TẦNG PRO
  hint                 0/70      name               70/70
  cover_image          0/70      photos (S3)        70/70
  vibes (khác rỗng)    0/70      style_tag          70/70
  price_per_person >0  0/70      price_level        70/70
  rating               0/70      address            68/70
  duration (khác 120)  0/70      coordinates        68/70
                                 short_description  67/70
                                 long_description   33/70
                                 description         0/70
```

Mọi cột tầng free đều có nguồn dẫn xuất ở tầng pro. Không cần thu thập dữ liệu mới, không cần nhập tay — đây là bài toán biến đổi dữ liệu, không phải bài toán curation.

Ràng buộc quan trọng: project đang ở Supabase free tier và **không có backup tự động**. Mọi thao tác ghi hàng loạt phải tự lo phần rollback.

## Goals / Non-Goals

**Goals:**

- Điền nội dung tầng free cho 70 địa điểm hiện có bằng cách dẫn xuất từ các cột tầng pro
- Khôi phục ba feature đang chết âm thầm: card nổi bật ở home, lọc vibe/ngân sách của AI planner, bảng `vibes`
- Nâng số địa điểm hiển thị của TP.HCM từ 6 lên 29 bằng cách review và đánh verified 23 row đã curate
- Giữ toàn bộ thay đổi trong lớp SQL cộng một dòng trong edge function — không chạm app code
- Mọi migration idempotent, chạy lại được không gây hại

**Non-Goals:**

- Kích hoạt freemium gating (drop `public_read_locations`, sửa RPC `search_locations`, chuyển query site sang preview view) — change riêng, và change này là tiền đề cho nó
- Thêm địa điểm mới hay hỗ trợ thành phố Huế — change riêng
- Dọn 33 cột hai thế hệ hay sửa timestamp trùng trong migration chain — change riêng; change này cố tình để nguyên và chỉ ghi thêm về phía trước
- Tìm nguồn rating thật — `rating` bị loại khỏi tầng free, không backfill
- Thay ảnh placeholder `picsum.photos` ở chỗ khác trong hệ thống

## Decisions

### D1: Migration mới chỉ-tiến, không sửa migration tháng 6 đã hỏng

Viết migration mới thay vì sửa `20260626000000_enrich_locations_fields.sql`.

Lý do: không ai biết chắc migration tháng 6 nào đã chạy trên production — chính sự mơ hồ đó tạo ra bug này. Sửa một migration có thể đã được áp là đánh cược vào trạng thái không quan sát được. Ghi về phía trước thì trạng thái cuối xác định bất kể lịch sử.

Đã cân nhắc: sửa tại chỗ migration cũ rồi `db push`. Loại — trên DB thật nó có thể không chạy lại, và trên DB mới nó vẫn fail vì các DROP đứng trước.

### D2: Mỗi migration một timestamp riêng, giây khác nhau

Mỗi migration mới mang timestamp riêng biệt tới mức giây, không dùng chung prefix.

Lý do: timestamp trùng `20260626000000_` chính là nguyên nhân gốc của bug này. Thứ tự alphabet khiến `alter` chạy trước `enrich` và drop đúng những cột mà `enrich` định update. Lặp lại khuôn đó là mời bug quay lại.

### D3: `price_per_person` dẫn xuất từ `price_level`, không từ `category`

```
price_level 1  →     30.000 VND
price_level 2  →     80.000 VND
price_level 3  →    200.000 VND
price_level 4  →    500.000 VND
```

Lý do: migration tháng 6 dẫn xuất giá từ `category`, nhưng `category` là free-text phân cách phẩy đã trôi khỏi 14 giá trị chuẩn — tồn tại những giá trị như `Văn hóa truyền thống`, `Nghệ thuật đương đại`, `Ẩm thực Việt ba miền`. Khớp theo nó thì vỡ âm thầm. `price_level` sạch, là số, nằm trong khoảng 1–4 và có ở 70/70 rows.

Đã cân nhắc: band theo category như bản tháng 6. Loại vì taxonomy đã trôi. Đã cân nhắc: giá thật từng địa điểm. Loại — không có nguồn, và để lọc ngân sách hoạt động thì band là đủ.

### D4: `vibes` tách từ `style_tag`, bảng `vibes` chỉ lấy phần phổ biến

`locations.vibes` lấy toàn bộ token tách từ `style_tag`. Nhưng bảng `vibes` (nguồn cho chip) chỉ seed những vibe xuất hiện ở **tối thiểu 3 địa điểm active**.

Lý do: `style_tag` chứa cả vibe dùng được (`Cổ kính`, `Bình yên`) lẫn mô tả một-lần (`Kiến trúc Pháp`, `Nhà rường cổ`, `Văn hóa Sa Huỳnh`). Để lọc thì cái đuôi dài đó vô hại. Để làm chip thì nó tạo ra một hàng chip mà mỗi chip chỉ ra một kết quả — tệ hơn là không có chip.

Ngưỡng 3 là phỏng đoán có căn cứ chứ không phải số đo. Cần kiểm lại sau khi derive: nếu nó để lại dưới 5 vibe thì hạ xuống 2.

### D5: `hint` sinh qua edge function đã có, không viết cứng vào SQL

Sửa `batch-generate-hints` để select `coalesce(short_description, long_description)` thay cho `description` (0/70), rồi invoke một lần.

Lý do: function này đã tồn tại và làm đúng việc đó — chọn row có `hint IS NULL`, sinh qua Claude, ghi `hint` + `hint_generated_at`. Đã xác nhận 0/70 rows thiếu cả hai cột nguồn, nên nó phủ được toàn bộ 70 row. Viết 70 hint bằng tay là công việc duy nhất trong change này không cần thiết.

Đã cân nhắc: hint tĩnh trong SQL. Loại — 70 đoạn viết tay, và không scale khi thêm địa điểm.

### D6: Loại `rating` khỏi tầng free thay vì backfill

`locations_preview` bỏ cột `rating`. Không ghi giá trị rating nào.

Lý do: không có nguồn rating thật. Migration tháng 6 set cứng `4.0` cho mọi địa điểm. Rating giống nhau trên mọi card là thứ user phát hiện ngay, và nó làm xói niềm tin đúng vào lúc app đang cố thuyết phục rằng địa điểm được tuyển chọn. Thiếu rating thì thật thà; rating bịa thì không.

### D7: `is_featured` chọn tay, không chọn theo thuật toán

Chọn 2–3 địa điểm mỗi thành phố bằng tay từ các row đã verified có `cover_image`.

Lý do: không có tín hiệu chất lượng nào để xếp hạng theo — không rating, không lượt xem, không bookmark. Chọn random thì card nổi bật đổi mỗi lần deploy. Card nổi bật là bề mặt dễ thấy nhất của app; nó xứng đáng được chọn chủ ý.

### D8: Đánh verified có review, không quét toàn bộ

23 row TP.HCM được liệt kê ra để review trước, rồi đánh verified theo danh sách id cụ thể.

Lý do: `verified` là cổng duy nhất ngăn dữ liệu chưa kiểm tới tay user — RPC `search_locations` lọc theo nó. Một lệnh `UPDATE locations SET verified = true WHERE city = 'SG'` sẽ đánh verified cho bất cứ thứ gì rơi vào bảng sau này, biến cổng đó thành vô nghĩa. Mẫu 5 row đã kiểm (Thảo Cầm Viên, Địa Đạo Củ Chi, Chùa Ngọc Hoàng, Nhà Thờ Tân Định, Đường Sách Nguyễn Văn Bình) đều là địa điểm thật, nên khả năng cao cả 23 đều đạt — nhưng "khả năng cao" không phải "đã kiểm".

## Risks / Trade-offs

**Ghi hàng loạt lên production không có backup** → Supabase free tier không có backup tự động. Export `locations` ra CSV/SQL trước khi chạy migration đầu tiên. Đây là bước chặn, không phải bước nên làm.

**Migration chạy một phần rồi lỗi giữa đường** → Mỗi migration bọc trong một transaction và idempotent (`WHERE` loại các row đã xử lý). Chạy lại an toàn; chạy nửa vời thì rollback.

**`style_tag` tách ra vibe rác** → Ngưỡng ≥3 địa điểm chặn ở tầng bảng `vibes`. `locations.vibes` vẫn nhận cả đuôi dài, nhưng ở đó nó chỉ ảnh hưởng `overlaps()` — nhiều vibe hơn thì khớp rộng hơn, không vỡ.

**Chi phí và chất lượng sinh hint** → 70 lần gọi Claude, chi phí không đáng kể. Chất lượng thì có. `hint` phải gợi tò mò mà không tiết lộ tên/địa chỉ, và nó là toàn bộ nội dung mà free user thấy. Kiểm tay một mẫu 10 hint trước khi chạy hết 70; nếu prompt cho ra bản tóm tắt nhạt thay vì teaser, sửa prompt trước.

**`hint` có thể làm lộ tên địa điểm** → Nguồn là `short_description`/`long_description`, vốn có thể nhắc tên. Spec cấm điều đó. Cần kiểm sau khi sinh: query các hint có chứa `name` của chính row đó.

**Lọc ngân sách bật lên có thể làm hẹp pool của planner** → Hiện `price_per_person = 0` nên mọi địa điểm pass mọi ngân sách. Sau khi derive, ngân sách thấp sẽ loại địa điểm thật — đó là mục đích, nhưng nó có thể khiến thành phố ít dữ liệu như Hà Nội (15 row) không dựng nổi lịch trình. Kiểm lại số địa điểm còn lại sau khi lọc ở từng band ngân sách của từng thành phố.

**Migration chain vẫn vỡ sau change này** → Change này không sửa timestamp trùng hay các DROP chưa áp. `supabase db push` lên project mới vẫn fail. Đó là nợ đã biết, thuộc change `repair-migration-chain`.

## Migration Plan

```
0. Export locations ra file          ← bước chặn, không có backup tự động
1. Review 23 row SG → đánh verified theo danh sách id
2. Derive vibes / price_per_person / duration_minutes
3. Derive cover_image từ photos
4. Sửa batch-generate-hints, deploy, invoke → backfill hint
5. Kiểm mẫu hint (lộ tên? teaser hay tóm tắt?)
6. Set is_featured bằng tay
7. Reseed bảng vibes (ngưỡng ≥3)
8. Bỏ rating khỏi locations_preview
9. Verify: đếm lại toàn bộ, xác nhận ba feature đã sống
```

Bước 1–3 và 6–8 là SQL thuần, rollback bằng cách restore từ export ở bước 0. Bước 4 sửa code có version control, rollback bằng git. Bước 5 là cổng người quyết định — nếu hint chất lượng kém thì dừng tại đây, sửa prompt, chạy lại; `hint` null thì vô hại, `hint` dở thì có hại.

## Open Questions

- Ngưỡng ≥3 cho bảng `vibes` còn lại bao nhiêu vibe? Nếu dưới 5 thì hạ xuống 2. Chỉ biết sau khi derive.
- Các band VND ở D3 có khớp giá thật ở Việt Nam cho thang `price_level` không? Hiện là phỏng đoán có căn cứ, chưa đối chiếu với dữ liệu giá thật của địa điểm.
- Sau khi bật lọc ngân sách, Hà Nội (15 row) còn đủ địa điểm để dựng lịch trình 3 ngày ở band ngân sách thấp không? Nếu không thì đó là tín hiệu ưu tiên cho change bơm dữ liệu, không phải lý do để tắt lọc lại.
