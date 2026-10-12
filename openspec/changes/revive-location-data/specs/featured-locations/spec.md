## ADDED Requirements

### Requirement: Mỗi thành phố được hỗ trợ phải có địa điểm nổi bật

Với mỗi mã thành phố được hỗ trợ, SHALL tồn tại tối thiểu một địa điểm có `is_featured = true` và `is_active = true`. Hiện tại `is_featured = true` có 0 rows trên toàn bảng, nên section nổi bật ở home render rỗng ở mọi thành phố.

#### Scenario: Card nổi bật ở home render được

- **WHEN** home screen truy vấn địa điểm nổi bật mà không lọc category
- **THEN** truy vấn trả về một địa điểm
- **AND** card nổi bật render thay vì để lại khoảng trắng

#### Scenario: Mọi thành phố được hỗ trợ đều có bao phủ

- **WHEN** đếm số địa điểm nổi bật theo từng mã thành phố đang có dữ liệu
- **THEN** mỗi mã thành phố đó trả về số đếm tối thiểu là 1

### Requirement: Địa điểm nổi bật phải đã verified và đủ nội dung

Một địa điểm chỉ SHALL được đánh `is_featured` khi nó có `verified = true` và có đủ nội dung tầng free theo `location-free-tier-content`. Card nổi bật là bề mặt dễ thấy nhất của app, nên nó không được hiển thị row chưa review hoặc thiếu dữ liệu.

#### Scenario: Địa điểm chưa verified không được nổi bật

- **WHEN** các địa điểm được đánh dấu nổi bật
- **THEN** không địa điểm nào có `verified = false` mang `is_featured = true`

#### Scenario: Địa điểm nổi bật có đủ nội dung hiển thị

- **WHEN** một địa điểm nổi bật được đọc
- **THEN** nó có `cover_image` không null
- **AND** nó có `hint` không null
- **AND** nó có tối thiểu một phần tử trong `vibes`

### Requirement: Địa điểm TP.HCM đã curate phải được đánh verified

23 địa điểm TP.HCM đã curate thủ công đang mang `verified = false` và vì vậy bị RPC `search_locations` loại bỏ, khiến TP.HCM chỉ hiển thị 6 trong 29 địa điểm nó đã có. Những row này SHALL được review rồi đánh `verified = true`.

#### Scenario: Số địa điểm hiển thị của TP.HCM tăng

- **WHEN** đếm số địa điểm có `city = 'SG'`, `is_active = true` và `verified = true`
- **THEN** số đếm là 29

#### Scenario: Việc đánh verified là có review, không phải quét toàn bộ

- **WHEN** các địa điểm được đánh verified
- **THEN** mỗi row được đánh đã được kiểm tra có `name`, `address` và `photos`
- **AND** không có lệnh nào đánh verified cho toàn bảng bất kể nội dung
