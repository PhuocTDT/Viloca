## ADDED Requirements

### Requirement: Bốn lựa chọn do người dùng quyết định

Hệ thống SHALL trình bày bốn nhóm lựa chọn: dời muộn hơn, đổi ngày, thay trong nhà, giữ nguyên. Không có phương án hợp lệ SHALL hiển thị lý do thay vì bịa phương án. Mọi thay đổi lịch MUST yêu cầu người dùng chọn đích cụ thể và bấm nút mô tả thay đổi đó; việc tải dự báo, đóng bảng hoặc chọn một nhóm hành động MUST NOT sửa lịch.

#### Scenario: Người dùng chưa chọn
- **WHEN** cảnh báo xuất hiện rồi người dùng đóng bảng
- **THEN** mọi ngày, giờ, địa điểm và thứ tự hoạt động vẫn giữ nguyên

#### Scenario: Chỉ chọn nhóm dời giờ
- **WHEN** người dùng bấm “Dời sang muộn hơn”
- **THEN** app mở danh sách giờ/chi tiết, không ghi thay đổi cho đến khi người dùng chọn và xác nhận giờ cụ thể

### Requirement: Dời muộn hơn trong cùng ngày

Hệ thống SHALL chỉ đề xuất giờ còn lại trong cùng ngày, bước 30 phút, đủ thời lượng và khoảng di chuyển, không trùng hoạt động đã có, không vi phạm giờ đóng cửa đã biết. Phương án do Sen đề xuất SHALL giảm ảnh hưởng theo toàn bộ khoảng và không thêm nguy cơ cao khác. Hệ thống MUST NOT tự dời hoạt động lân cận hoặc chuyển sang ngày sau.

#### Scenario: Có giờ phù hợp
- **WHEN** lịch 16:00–17:00 bị ảnh hưởng và 19:00–20:00 thỏa mọi ràng buộc
- **THEN** người dùng xem trước 16:00 → 19:00 và chỉ khi bấm “Dời sang 19:00” app mới cập nhật item

#### Scenario: Trùng hoặc không đủ khoảng di chuyển
- **WHEN** giờ dự kiến trùng một hoạt động khác hoặc khoảng cách giữa hai hoạt động không đủ thời gian di chuyển
- **THEN** phương án bị loại khỏi danh sách đã kiểm tra, lịch lân cận không bị dịch tự động

#### Scenario: Không còn giờ tốt hơn trong ngày
- **WHEN** mọi giờ còn lại đều xấu hơn/tương đương, đã qua, đóng cửa hoặc không đủ thời lượng
- **THEN** app giải thích không tìm được giờ phù hợp và cho chọn nhóm hành động khác

### Requirement: Đổi ngày trong phạm vi chuyến đi

Hệ thống SHALL cho chọn ngày và giờ khác trong khoảng ngày của chuyến đi, kiểm tra lịch trống/thời lượng/di chuyển/giờ mở cửa. Ngày chưa có dự báo SHALL được đánh dấu rõ và chỉ dùng qua lựa chọn đổi thủ công, không gắn nhãn phù hợp thời tiết. Hệ thống MUST NOT tự kéo dài chuyến đi.

#### Scenario: Đổi sang ngày có dự báo phù hợp
- **WHEN** người dùng chọn ngày/giờ hợp lệ có dự báo mới và xác nhận
- **THEN** item được cập nhật ngày, buổi, giờ và thứ tự nhất quán trong cùng thao tác lưu

#### Scenario: Đổi sang ngày chưa có dự báo
- **WHEN** ngày đích nằm trong chuyến đi nhưng ngoài dữ liệu dự báo
- **THEN** app nêu “Chưa có dự báo”, cho người dùng chọn đổi thủ công với nút rõ nghĩa và không nói ngày đó trời đẹp hơn

#### Scenario: Ngày đích ngoài chuyến đi
- **WHEN** người dùng xem ngày sau ngày kết thúc chuyến đi
- **THEN** luồng này không cho xác nhận dời sang ngày đó; việc mở rộng chuyến đi thuộc thao tác riêng

### Requirement: Thay bằng hoạt động trong nhà có căn cứ

Hệ thống SHALL lấy phương án từ hoạt động/địa điểm thật, đang hoạt động, có metadata xác nhận không gian trong nhà. Phương án SHALL cùng vùng, mặc định trong 10 km, có thông tin thời lượng và hiển thị giá/giờ mở cửa hoặc trạng thái chưa biết. Category hoặc nội dung do AI suy đoán MUST NOT đủ để xác nhận trong nhà. Thay thế chỉ tác động item người dùng chọn, không xóa ngày hoặc mất ghi chú cá nhân.

#### Scenario: Chọn lớp làm đèn lồng đã có dữ liệu
- **WHEN** có lớp trong nhà phù hợp vùng/giờ/thời lượng và người dùng chọn thay hoạt động đi thuyền bằng lớp đó
- **THEN** app xem trước hoạt động cũ → mới, cập nhật đúng nguồn dữ liệu sau xác nhận và bỏ snapshot địa điểm cũ không còn đúng
- **AND** ghi chú cá nhân được giữ lại

#### Scenario: Quán cà phê chỉ có category
- **WHEN** một quán có category Café nhưng chưa xác nhận có không gian trong nhà
- **THEN** quán không được xếp vào nhóm thay thế trong nhà đã kiểm tra

#### Scenario: Không có dữ liệu phù hợp
- **WHEN** catalog không có hoạt động trong nhà phù hợp
- **THEN** app báo chưa tìm thấy, có thể gợi ý loại hoạt động để tìm thủ công, không tự tạo địa điểm hay thay item

#### Scenario: Thông tin giờ mở cửa thiếu
- **WHEN** địa điểm có không gian trong nhà nhưng chưa biết giờ mở cửa
- **THEN** hiển thị trong nhóm cần người dùng kiểm tra, không gọi là phương án chắc chắn khả thi

### Requirement: Giữ nguyên và giới hạn thay đổi dịch vụ

Hệ thống SHALL lưu “Giữ nguyên” cho sự kiện hiện tại mà không sửa lịch hoặc tăng phiên bản lịch. Cảnh báo mới chỉ theo quy tắc nguy cơ tăng/mới. Mọi lựa chọn SHALL chỉ sửa lịch cá nhân trong Viloca, không ngầm đổi/hủy đặt chỗ, vé hay phương tiện.

#### Scenario: Người dùng giữ nguyên trong mưa lớn
- **WHEN** người dùng chọn giữ nguyên sau khi đọc cảnh báo
- **THEN** lịch giữ nguyên, quyết định được lưu và nội dung ảnh hưởng vẫn có thể xem lại
- **AND** app không tự chọn phương án khác thay người dùng

#### Scenario: Hoạt động có vé hoặc đặt chỗ
- **WHEN** người dùng dời lịch một hoạt động có đặt chỗ
- **THEN** app nói rõ chỉ cập nhật lịch trong Viloca và người dùng cần kiểm tra với nhà cung cấp

### Requirement: Xác thực và cập nhật nguyên tử

Hệ thống SHALL xác thực chủ chuyến đi, phiên bản lịch, event/fingerprint, dữ liệu đích và các ràng buộc lịch tại lần xác nhận. Các thay đổi cùng quyết định SHALL lưu trong một giao dịch. Mọi đường sửa lịch hiện hữu SHALL làm thay đổi revision phù hợp. Snapshot cho phương án theo thời tiết SHALL được dịch vụ xác thực, không tin đánh giá tự khai của client.

#### Scenario: Người không sở hữu chuyến đi
- **WHEN** một tài khoản khác gọi API quyết định bằng trip/item ID của người dùng
- **THEN** yêu cầu bị từ chối, lịch và lịch sử quyết định không bị đọc hoặc sửa trái phép

#### Scenario: Hai thiết bị cùng sửa lịch
- **WHEN** thiết bị B đã sửa lịch sau khi thiết bị A xem phương án
- **THEN** lần xác nhận của A bị từ chối với trạng thái lịch đã thay đổi, tải lại dữ liệu và yêu cầu chọn lại

#### Scenario: Lỗi giữa thao tác lưu
- **WHEN** bất kỳ phần ghi lịch hoặc quyết định thất bại
- **THEN** toàn bộ giao dịch rollback, UI giữ lịch cũ và cho thử lại

#### Scenario: Bấm hai lần hoặc mất response
- **WHEN** cùng `request_id` được gửi lại sau khi thao tác đầu đã thành công
- **THEN** trả lại kết quả cũ, không dời/thay thêm lần nữa hoặc ghi trùng quyết định

### Requirement: Dữ liệu mới tại xác nhận và phục hồi lỗi

Phương án thay lịch theo thời tiết SHALL dùng snapshot lấy không quá 30 phút tại xác nhận. Khi quá hạn SHALL lấy lại và cho xem phương án cập nhật trước khi lưu. Offline MUST NOT tự xếp hàng ghi thay đổi để thực hiện khi có mạng. Sau lưu thành công SHALL đồng bộ UI và cache từ kết quả server.

#### Scenario: Mở bảng lâu khiến dự báo cũ
- **WHEN** người dùng xác nhận sau khi snapshot vượt 30 phút
- **THEN** app tải lại dự báo; nếu phương án đổi thì người dùng xem và chọn lại, không âm thầm lưu giờ khác

#### Scenario: Offline trước khi xác nhận
- **WHEN** người dùng mất mạng trước khi lưu
- **THEN** lịch không đổi, hiển thị không thể lưu và không tự lưu sau khi có mạng

#### Scenario: Lưu thành công rồi mở offline
- **WHEN** thay đổi đã thành công và người dùng mở lại chuyến đi khi offline
- **THEN** cache hiển thị lịch đã được server xác nhận, không quay về item cũ

### Requirement: Hoàn tác có kiểm tra phiên bản

Hệ thống SHALL cho hoàn tác trong 10 giây sau lần thay đổi thành công bằng dữ liệu trước thao tác. Hoàn tác SHALL được kiểm tra quyền và revision như thao tác sửa; không được ghi đè sửa đổi phát sinh sau đó.

#### Scenario: Hoàn tác ngay
- **WHEN** người dùng bấm hoàn tác trong 10 giây và chưa có thay đổi tiếp theo
- **THEN** hoạt động được trả về dữ liệu cũ trong giao dịch và cache đồng bộ

#### Scenario: Lịch đã được sửa sau thao tác
- **WHEN** một thay đổi khác đã xảy ra trước khi người dùng bấm hoàn tác
- **THEN** app từ chối ghi đè, tải lịch mới và thông báo không thể hoàn tác tự động
