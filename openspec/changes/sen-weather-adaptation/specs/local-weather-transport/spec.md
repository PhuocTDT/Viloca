## ADDED Requirements

### Requirement: Gợi ý gắn với vùng xác định

Hệ thống SHALL dùng vùng được xác định từ metadata địa điểm/hoạt động và cấu hình nội dung tương ứng. Hệ thống MUST NOT suy ra vùng từ thành phố gần nhất trong danh sách ba thành phố hiện có. Chưa biết vùng SHALL chỉ có lời khuyên chung, không gắn phương tiện đặc trưng của nơi khác.

#### Scenario: Hội An và Đà Nẵng ở gần nhau
- **WHEN** địa điểm có metadata Hội An
- **THEN** nội dung dùng quy tắc Hội An, không bị thay bằng Đà Nẵng do tọa độ tâm thành phố gần nhất

#### Scenario: Chưa xác định vùng
- **WHEN** item không có mapping vùng đáng tin cậy
- **THEN** không hiển thị thuyền rồng, xích lô hoặc xe ôm Hà Giang như dịch vụ địa phương của item đó

### Requirement: Phương tiện đặc trưng khi dự báo thuận lợi

Hệ thống SHALL gợi ý theo bảng: Huế — thuyền rồng/xích lô; Hội An — xe đạp; Miền Tây — xuồng ba lá/ghe máy; Hà Giang — xe máy hoặc tài xế địa phương. Nội dung SHALL chỉ là gợi ý có điều kiện, không xác nhận dịch vụ đang mở hoặc bảo đảm an toàn. Dự báo không rõ MUST NOT được coi là thuận lợi.

Điều kiện thuận lợi SHALL yêu cầu WMO 0–3, đủ dữ liệu liên quan và không vượt ngưỡng ảnh hưởng trong toàn khoảng. Mã có mưa MUST được dùng cho nội dung mưa ngay cả khi lượng/xác suất chưa vượt ngưỡng nhắc chủ động.

#### Scenario: Huế có dự báo thuận lợi
- **WHEN** vùng là Huế và đầy đủ dữ liệu liên quan cho thấy không vượt ngưỡng ảnh hưởng
- **THEN** có thể hiển thị thuyền rồng trên sông Hương hoặc xích lô kèm yêu cầu kiểm tra dịch vụ thực tế

#### Scenario: Thiếu dữ liệu gió của hoạt động đường thủy
- **WHEN** điểm ở Miền Tây nhưng thiếu dữ liệu gió
- **THEN** app không gọi điều kiện là thuận lợi để quảng bá chuyến ghe; nêu chưa đủ dữ liệu và cần kiểm tra đơn vị vận hành

#### Scenario: Mã mưa nhẹ nhưng xác suất thấp
- **WHEN** WMO là 61, lượng mưa dưới 1 mm và xác suất dưới 60%
- **THEN** app dùng nội dung điều kiện mưa nhẹ, không mô tả trời đẹp để gợi ý xe đạp

### Requirement: Điều chỉnh phương tiện khi thời tiết xấu

Hệ thống SHALL ưu tiên nội dung theo loại nguy cơ: nghiêm trọng, thiếu dữ liệu, xấu thông thường, thuận lợi. Với Huế/Hội An SHALL đưa phương án taxi/xe công nghệ có điều kiện đường còn hoạt động; với Hà Giang SHALL không đề xuất tự chạy đèo khi mưa/sương mù; với Miền Tây SHALL cân nhắc dời hoạt động đường thủy. Phương tiện có mái che MUST NOT được mô tả là khắc phục mọi nguy cơ.

#### Scenario: Mưa hoặc sương mù tại Hà Giang
- **WHEN** hoạt động đường đèo có nguy cơ mưa/tầm nhìn hạn chế
- **THEN** app không gợi ý tự chạy xe máy; có thể nêu ô tô có tài xế khi tuyến được xác nhận hoạt động, hoặc hoãn nếu điều kiện nghiêm trọng

#### Scenario: Nguy cơ nghiêm trọng ở Huế
- **WHEN** hoạt động đường thủy có dự báo giông/gió mạnh
- **THEN** ưu tiên dời và kiểm tra đơn vị vận hành, không chỉ đổi nhãn phương tiện sang taxi rồi nói lịch đã an toàn

### Requirement: Điều kiện riêng cho đi bộ và đi sớm

Hệ thống SHALL không coi đi bộ ở Hội An hoặc đi sớm ở Miền Tây là phương án mặc định cho mọi thời tiết xấu. Đi bộ chỉ được gợi ý có điều kiện cho đoạn ngắn khi mưa nhẹ và không có nguy cơ đã biết; đi sớm cần dự báo đúng giờ tốt hơn và kiểm tra vận hành. Không có dữ liệu ngập/đóng đường SHALL không được diễn đạt thành “đã xác nhận không ngập”.

#### Scenario: Hội An mưa lớn
- **WHEN** Hội An có dự báo mưa lớn hoặc giông
- **THEN** app ưu tiên trú trong nhà/dời hoạt động; không đề xuất đi bộ quanh phố cổ như giải pháp mặc định

#### Scenario: Hội An mưa nhẹ
- **WHEN** dự báo mưa nhẹ, không có nguy cơ cao được ghi nhận
- **THEN** lời gợi ý chỉ nêu đi bộ đoạn ngắn nếu điều kiện thực tế phù hợp hoặc taxi tới điểm đón trả được phép, không khẳng định đường đã được kiểm tra

#### Scenario: Chợ nổi có buổi sáng xấu hơn
- **WHEN** dự báo sáng sớm tại điểm chợ nổi xấu hơn khung giờ hiện tại
- **THEN** app không gợi ý đi sớm và chuyển sang phương án dời hoặc chờ xác nhận của đơn vị vận hành

### Requirement: Gợi ý không tự sửa lịch và có giải thích

Hệ thống SHALL nêu lý do gợi ý, vùng, khung thời gian và giới hạn dữ liệu bằng tiếng Việt/Anh. Hiển thị hoặc mở gợi ý MUST NOT sửa phương tiện/lịch đã lưu, đặt xe hay liên hệ người khác. Nếu gợi ý dẫn đến dời hoạt động SHALL đi qua luồng quyết định của người dùng.

#### Scenario: Người dùng chỉ đọc phương tiện thay thế
- **WHEN** người dùng xem gợi ý taxi trong khi lịch đang ghi xe đạp
- **THEN** phương tiện/lịch vẫn giữ nguyên và app không đặt xe hoặc gửi yêu cầu cho bên thứ ba

#### Scenario: Người dùng muốn dời chuyến ghe
- **WHEN** người dùng chọn xem phương án dời từ thẻ phương tiện
- **THEN** app mở luồng lựa chọn ngày/giờ có xem trước; chỉ lưu sau khi người dùng xác nhận đích cụ thể
