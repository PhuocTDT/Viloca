## ADDED Requirements

### Requirement: Dự báo gắn với đúng hoạt động

Hệ thống SHALL đánh giá dự báo theo tọa độ và toàn bộ khoảng thời gian của hoạt động trong múi giờ `Asia/Ho_Chi_Minh`. Hệ thống MUST NOT thay thế bằng thời tiết hiện tại nơi người dùng đứng. Các khoảng lượng mưa/xác suất mưa SHALL được chuẩn hóa theo thời gian mà dữ liệu nguồn đại diện.

#### Scenario: Người dùng ở nơi khác điểm đến
- **WHEN** người dùng ở TP.HCM mở lịch đi thuyền tại Hội An từ 16:00 đến 17:30
- **THEN** đánh giá dùng tọa độ hoạt động tại Hội An và mọi khoảng dự báo giao với 16:00–17:30 giờ Việt Nam
- **AND** không dùng thời tiết TP.HCM hoặc bỏ qua nửa giờ cuối

#### Scenario: Thiết bị dùng múi giờ khác
- **WHEN** thiết bị dùng múi giờ Mỹ nhưng hoạt động tại Việt Nam có ngày giờ đã lưu
- **THEN** hoạt động được đối chiếu đúng ngày giờ Việt Nam, không lệch sang ngày trước/sau

#### Scenario: Chưa có giờ hoặc thời lượng
- **WHEN** item chỉ ghi buổi chiều hoặc thiếu thời lượng
- **THEN** Sen đánh giá sơ bộ cả buổi theo thiết kế và nói rõ khoảng buổi
- **AND** yêu cầu bổ sung giờ/thời lượng trước khi đưa ra phương án dời cụ thể đã kiểm tra

### Requirement: Phạm vi đánh giá và trạng thái thiếu dữ liệu

Hệ thống SHALL nhắc chủ động cho hoạt động chưa qua thuộc chuyến đi chưa hoàn tất trong 72 giờ tới; hỗ trợ xem dự báo trong 7 ngày theo dữ liệu trả về. Thiếu ngày đi, tọa độ hoặc dữ liệu thời gian SHALL được trình bày là chưa đủ dữ liệu. Hệ thống MUST NOT lấy dự báo ngày gần nhất để điền vào một ngày không có dự báo.

#### Scenario: Chuyến đi chưa có ngày bắt đầu
- **WHEN** chuyến đi chưa có `start_date`
- **THEN** giao diện mời đặt ngày đi để kiểm tra thời tiết và không phát cảnh báo theo ngày giả định

#### Scenario: Hoạt động nằm ngoài tầm dự báo
- **WHEN** người dùng xem một hoạt động sau ngày cuối cùng nhà cung cấp trả về
- **THEN** giao diện ghi “Chưa có dự báo cho ngày này”, không ghi trời đẹp hoặc đề xuất dời dựa trên dự báo ngày khác

#### Scenario: Hoạt động đã qua
- **WHEN** hoạt động đã kết thúc hoặc chuyến đi ở trạng thái hoàn tất
- **THEN** Sen không tạo thẻ yêu cầu thay đổi lịch cho hoạt động đó

### Requirement: Phân loại nguy cơ độc lập với biểu tượng thời tiết

Hệ thống SHALL dùng mã WMO gốc, lượng/xác suất mưa, gió giật, tầm nhìn và loại tiếp xúc hoạt động để phân loại theo cấu hình phiên bản trong thiết kế. Sương mù, giông và dữ liệu không rõ MUST NOT được suy ra là trời đẹp từ icon/nhãn hiện tại. Nguy cơ cao đã có bằng chứng SHALL không bị hạ mức chỉ vì thiếu biến khác.

#### Scenario: Sương mù trên hoạt động đường đèo
- **WHEN** hoạt động có tiếp xúc đường đèo và mã 45/48 hoặc tầm nhìn dưới 1.000 m
- **THEN** hệ thống ghi nhận nguy cơ hạn chế tầm nhìn dù icon hiện tại có thể là nhiều mây

#### Scenario: Ngưỡng thử nghiệm được vượt qua
- **WHEN** hoạt động ngoài trời có xác suất mưa 60% hoặc lượng mưa 1 mm trong giờ liên quan
- **THEN** hệ thống đánh dấu cần chú ý theo cấu hình mặc định
- **AND** không gọi ngưỡng này là tiêu chuẩn đảm bảo an toàn

#### Scenario: Giông kèm dữ liệu thiếu
- **WHEN** WMO là 95 nhưng không có dữ liệu tầm nhìn
- **THEN** nguy cơ giông vẫn được hiển thị và phần đánh giá tổng thể nêu dữ liệu còn thiếu

#### Scenario: Trong nhà có phần di chuyển
- **WHEN** điểm đến trong nhà nhưng phần di chuyển có dữ liệu cho thấy nguy cơ cao
- **THEN** hệ thống vẫn cảnh báo phần di chuyển, không coi toàn bộ hành trình là không bị ảnh hưởng

### Requirement: Phân biệt lần đầu và thay đổi dự báo

Hệ thống SHALL so sánh đánh giá cùng item, fingerprint lịch và khoảng thời gian. Khi chưa có baseline hợp lệ, lời nhắc MUST mô tả dự báo hiện tại thay vì tuyên bố đã thay đổi. Một sự kiện mới SHALL chỉ xuất hiện khi mới có ảnh hưởng, vượt mức đã được chấp nhận hoặc có loại nguy cơ mới.

#### Scenario: Lần đầu mở lịch đã có mưa
- **WHEN** chưa có đánh giá trước và dự báo hiện tại có mưa lớn
- **THEN** lời nhắc nói “Dự báo hiện tại…” và cho xem phương án mà không nói “Dự báo vừa thay đổi”

#### Scenario: Chỉ dao động cùng mức
- **WHEN** xác suất mưa đổi 65% sang 70% nhưng loại và mức ảnh hưởng không đổi
- **THEN** cập nhật số liệu mà không tạo một lời nhắc mới

#### Scenario: Người dùng đổi ngày hoạt động
- **WHEN** item được chuyển sang một ngày khác
- **THEN** đánh giá theo fingerprint lịch mới, không so dự báo ngày cũ với ngày mới để tuyên bố thời tiết đổi

### Requirement: Tôn trọng quyết định và chống nhắc lặp

Hệ thống SHALL lưu episode, chữ ký nguy cơ và mức người dùng đã chấp nhận theo tài khoản/chuyến đi/hoạt động/fingerprint lịch. Quyết định giữ nguyên SHALL có hiệu lực qua lần mở app và thiết bị khác. Episode chỉ kết thúc sau hai đánh giá mới cách nhau tối thiểu 30 phút đều hết điều kiện nhắc; nguy cơ tăng hoặc mới xuất hiện SHALL được giải thích khi nhắc lại.

#### Scenario: Mở lại sau khi giữ nguyên
- **WHEN** người dùng đã chọn giữ nguyên và lần mở app khác có cùng hoặc thấp hơn nguy cơ đã chấp nhận
- **THEN** Sen không nhắc lại cùng sự kiện

#### Scenario: Nguy cơ mới sau khi giữ nguyên
- **WHEN** người dùng đã chấp nhận mưa thông thường nhưng dự báo mới thêm giông
- **THEN** Sen được hiển thị một cảnh báo mới giải thích nguy cơ giông, vẫn không tự đổi lịch

#### Scenario: Dao động quanh ngưỡng
- **WHEN** xác suất mưa lần lượt 65%, 55%, 65% trong cùng đợt chưa đủ điều kiện kết thúc
- **THEN** không tạo ba đợt cảnh báo và không nhắc lại mức mà người dùng đã chấp nhận

#### Scenario: Thời tiết tốt lên sau khi đã dời
- **WHEN** nguy cơ hết sau khi người dùng đã dời hoạt động
- **THEN** cảnh báo cũ được giải quyết theo quy tắc episode và hoạt động vẫn ở giờ người dùng đã chọn

### Requirement: Làm mới có giới hạn và minh bạch về độ mới

Hệ thống SHALL kiểm tra khi mở lịch trình, khi quay lại app và mỗi 30 phút khi màn hình lịch trình hoạt động. Cache trong 30 phút SHALL được dùng lại; làm mới thủ công SHALL cách nhau ít nhất 60 giây. Dữ liệu quá 60 phút hoặc fetch lỗi SHALL có nhãn dữ liệu cũ/không tải được. Bản đầu MUST NOT hứa cảnh báo nền khi app đóng.

#### Scenario: Offline với cache cũ
- **WHEN** thiết bị offline và snapshot đã lấy hơn 60 phút
- **THEN** giao diện ghi thời điểm lấy dữ liệu và không tạo kết luận mới về thay đổi thời tiết từ snapshot đó

#### Scenario: Chuyển chuyến khi đang tải
- **WHEN** response của chuyến A trả về sau khi người dùng chuyển sang chuyến B
- **THEN** response đó không được cập nhật cảnh báo hoặc lựa chọn của chuyến B

#### Scenario: App đóng
- **WHEN** dự báo đổi trong lúc app không hoạt động ở bản đầu
- **THEN** hệ thống kiểm tra lại khi người dùng quay lại lịch trình và không mô tả rằng đã gửi cảnh báo ngay lúc app đóng

### Requirement: Chip thời tiết và bảng Sen có thể hiểu, không chặn thao tác

Hệ thống SHALL hiển thị chip thời tiết ở mép dưới ảnh bìa chuyến đi, với biểu tượng có màu, nhiệt độ/điều kiện hiện tại khi có dữ liệu và huy hiệu đếm cảnh báo. Chạm chip SHALL mở bảng Sen chứa hoạt động, nơi, thời gian bị ảnh hưởng, loại ảnh hưởng và thời điểm lấy dữ liệu. Nhiều hoạt động SHALL được gom trong bảng có số lượng, sắp theo mức ảnh hưởng rồi độ gần thời gian. Nội dung SHALL hỗ trợ Việt/Anh và phân biệt dự báo với sự chắc chắn. Hệ thống SHALL không đặt thẻ cảnh báo lớn dưới ô ngày đi/ngày về hoặc chip cạnh tiêu đề ngày trong timeline.

#### Scenario: Nhiều hoạt động bị ảnh hưởng
- **WHEN** có ba hoạt động thuộc cùng chuyến đi cần xem xét
- **THEN** chip hiển thị huy hiệu ba hoạt động và chỉ mở bảng lựa chọn khi người dùng chạm chip
- **AND** không xếp chồng ba hộp thoại hoặc tự sửa hoạt động nào

#### Scenario: Gợi ý giờ ít mưa hơn
- **WHEN** một giờ có dự báo ít ảnh hưởng hơn
- **THEN** Sen dùng câu “được dự báo ít mưa hơn” thay vì “chắc chắn tạnh mưa”
