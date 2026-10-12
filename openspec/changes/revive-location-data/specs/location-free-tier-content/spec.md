## ADDED Requirements

### Requirement: Mọi địa điểm active phải có nội dung tầng free

Mỗi row trong `locations` với `is_active = true` SHALL có các cột tầng free được điền: `hint`, `cover_image`, `vibes`, `price_per_person`. Giá trị dẫn xuất từ các cột nguồn đã curate (`short_description`, `long_description`, `photos`, `style_tag`, `price_level`), không nhập tay từng row.

Mảng rỗng `{}` và số 0 KHÔNG được coi là đã điền với `vibes` và `price_per_person` — đó chính là trạng thái hiện tại đang làm hỏng việc lọc ở `plan-trip`.

`duration_minutes` dẫn xuất theo category ở mức best-effort: nó không chặn việc lọc nào, và với nhiều category thì 120 phút là giá trị đúng chứ không phải dấu hiệu chưa điền.

#### Scenario: Truy vấn view preview trả về nội dung chứ không phải null

- **WHEN** một client đọc `locations_preview` cho bất kỳ địa điểm active nào
- **THEN** `hint` không null và không rỗng
- **AND** `cover_image` không null với địa điểm có `photos`
- **AND** `vibes` có tối thiểu một phần tử
- **AND** `price_per_person` lớn hơn 0

#### Scenario: Địa điểm mới thêm vào cũng phải đạt chuẩn này

- **WHEN** một địa điểm được thêm vào `locations` với `is_active = true` nhưng thiếu cột tầng free
- **THEN** quy trình backfill điền chúng từ các cột nguồn
- **AND** địa điểm đó không xuất hiện ở tầng free cho tới khi `hint` được điền

### Requirement: `vibes` dẫn xuất từ `style_tag`

`locations.vibes` (mảng text) SHALL được điền bằng cách tách `locations.style_tag` theo dấu phẩy và trim từng phần tử. `style_tag` đang có dữ liệu ở 70/70 rows và là nguồn duy nhất đáng tin cho vibe.

#### Scenario: Tách style_tag phân cách phẩy

- **WHEN** một địa điểm có `style_tag = 'Cổ điển, Nhộn nhịp, Kiến trúc Pháp, Hoài cổ'`
- **THEN** `vibes` bằng `ARRAY['Cổ điển','Nhộn nhịp','Kiến trúc Pháp','Hoài cổ']`

#### Scenario: Chạy lại không nhân bản dữ liệu

- **WHEN** migration derive được chạy lần thứ hai trên cùng dữ liệu
- **THEN** `vibes` giữ nguyên giá trị, không bị append trùng phần tử

### Requirement: `price_per_person` dẫn xuất từ `price_level`

`locations.price_per_person` (VND) SHALL được dẫn xuất từ `locations.price_level` (thang 1–4, đang có ở 70/70 rows) theo các band cố định, để bộ lọc ngân sách trong `plan-trip` hoạt động thật.

#### Scenario: Mỗi mức giá map sang một band VND

- **WHEN** một địa điểm có `price_level` trong khoảng 1 đến 4
- **THEN** `price_per_person` nhận giá trị VND tương ứng với band đó
- **AND** giá trị đó lớn hơn 0

#### Scenario: Bộ lọc ngân sách của trip planner loại được địa điểm

- **WHEN** `plan-trip` lọc bằng `price_per_person <= budget_per_person` với ngân sách thấp hơn band cao nhất
- **THEN** các địa điểm đắt hơn ngân sách bị loại khỏi pool
- **AND** kết quả không còn là toàn bộ địa điểm của thành phố

### Requirement: `cover_image` dẫn xuất từ `photos`

`locations.cover_image` SHALL là URL đầu tiên trong danh sách `photos` phân cách phẩy. KHÔNG được dùng ảnh placeholder sinh tự động (ví dụ `picsum.photos`) làm cover — ảnh không liên quan đến địa điểm tệ hơn là không có ảnh.

#### Scenario: Lấy URL đầu tiên từ danh sách photos

- **WHEN** một địa điểm có `photos` chứa một hoặc nhiều URL phân cách phẩy
- **THEN** `cover_image` bằng URL đầu tiên, đã trim

#### Scenario: Không chèn ảnh placeholder

- **WHEN** backfill cover image chạy
- **THEN** không `cover_image` nào trỏ tới dịch vụ ảnh random
- **AND** địa điểm không có `photos` thì `cover_image` để null, để UI xử lý trạng thái thiếu ảnh

### Requirement: `hint` sinh từ mô tả đã curate

`locations.hint` SHALL được sinh từ `coalesce(short_description, long_description)`. Cột `description` KHÔNG được dùng làm nguồn — nó rỗng ở 70/70 rows vì migration định điền nó chưa bao giờ chạy.

`hint` MUST gợi tò mò mà không tiết lộ tên hay địa chỉ địa điểm, vì đây là nội dung tầng free hiển thị khi `name` và `address` bị che.

#### Scenario: Backfill phủ hết các địa điểm có mô tả

- **WHEN** quy trình sinh hint chạy trên các địa điểm active có `hint` null
- **THEN** mọi địa điểm có `short_description` hoặc `long_description` nhận được một `hint`
- **AND** `hint_generated_at` được ghi dấu thời gian

#### Scenario: Hint không làm lộ field premium

- **WHEN** một `hint` được sinh cho một địa điểm
- **THEN** nội dung hint không chứa `name` của địa điểm đó
- **AND** không chứa `address` của địa điểm đó

### Requirement: Tầng free không phơi ra số liệu bịa

Tầng free SHALL KHÔNG phơi ra chỉ số nào không có nguồn dữ liệu thật. `rating` bị loại khỏi `locations_preview` cho tới khi tồn tại nguồn rating thật.

#### Scenario: Preview view không trả về rating

- **WHEN** một client đọc `locations_preview`
- **THEN** response không chứa cột `rating`

#### Scenario: Không set rating mặc định đồng loạt

- **WHEN** một migration backfill điền các cột tầng free
- **THEN** nó không ghi cùng một giá trị rating cho mọi địa điểm

### Requirement: Bảng `vibes` phản ánh vibe đang dùng thật

Bảng `vibes` SHALL được seed từ các giá trị phân biệt trong `locations.vibes` của các địa điểm active, sau khi cột đó đã được điền. Bảng hiện có 0 rows vì seed query chạy khi `locations.vibes` còn rỗng.

#### Scenario: Bảng vibes có dữ liệu sau khi derive

- **WHEN** bảng `vibes` được reseed sau khi `locations.vibes` đã điền
- **THEN** bảng chứa tối thiểu một row
- **AND** mỗi row khớp với một vibe xuất hiện ở ít nhất một địa điểm active

#### Scenario: VibeChips đọc từ bảng chứ không dùng fallback

- **WHEN** app tải vibe chips
- **THEN** dữ liệu đến từ bảng `vibes`
- **AND** nhánh fallback parse `style_tag` không được dùng
