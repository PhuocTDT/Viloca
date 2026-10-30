## Context

Yêu cầu gốc: khi dự báo ảnh hưởng đến lịch trình, Sen hỏi người dùng muốn dời giờ, đổi ngày, thay bằng hoạt động trong nhà hay giữ nguyên. Phương tiện được gợi ý theo nét địa phương và điều kiện thời tiết. Người dùng yêu cầu hoàn thiện đặc tả trước khi triển khai.

Hiện trạng đã kiểm tra:

- `useWeather` lấy thời tiết hiện tại; màn hình `/weather` lấy dự báo tổng hợp 7 ngày. Chưa có so sánh giữa các lần dự báo, cảnh báo theo hoạt động hay xử lý quyết định.
- `TripItem` có ngày tương đối, buổi, `visit_time`, thứ tự và địa điểm; chưa có thời lượng được xác nhận, loại tiếp xúc thời tiết hoặc vùng phục vụ gợi ý phương tiện.
- `Location` có tọa độ, mô tả và giờ mở cửa dạng chuỗi. Chưa có trường xác nhận trong nhà/ngoài trời. Giờ mở cửa dạng chuỗi không đủ để tự khẳng định một phương án có thể đặt được.
- Bộ mã thời tiết hiện gộp sương mù vào nhiều mây. Không được dùng nhãn hiển thị này để quyết định xe máy, thuyền hoặc hoạt động ngoài trời.
- Danh sách tâm thành phố mới có Hà Nội, TP.HCM, Đà Nẵng. Không được gán Huế, Hội An, Miền Tây, Hà Giang vào thành phố gần nhất để suy ra dự báo hoặc văn hóa di chuyển.
- Một số thao tác sửa lịch hiện lưu nhiều hàng riêng lẻ và cập nhật giao diện trước kết quả. Luồng mới cần một thao tác có giao dịch, phát hiện lịch đã bị sửa ở nơi khác.

## Goals / Non-Goals

**Goals:**

- Người dùng hiểu hoạt động nào bị ảnh hưởng, trong thời gian nào, theo dự báo lấy lúc nào.
- Có bốn lựa chọn rõ ràng; chỉ lưu phương án cụ thể mà người dùng chọn.
- Đề xuất có căn cứ về dự báo, thời gian trống và dữ liệu địa điểm; nói rõ thông tin chưa biết.
- Nhắc vừa đủ, xử lý lỗi/mất mạng/thay đổi đồng thời mà không làm mất lịch cũ.
- Gợi ý phương tiện đúng vùng, không gọi một phương tiện là chắc chắn an toàn chỉ vì có mái che.

**Non-Goals của bản đầu đề xuất:**

- Không tự sửa lịch, tự đặt/hủy dịch vụ hoặc liên hệ nhà cung cấp.
- Không theo dõi liên tục khi app đóng, chưa có push notification/background job. Cảnh báo xuất hiện khi người dùng mở hoặc quay lại lịch trình; giao diện phải nói đúng giới hạn này.
- Không xác nhận an toàn đường đèo, đường ngập hoặc hoạt động đường thủy bằng một điểm dự báo thời tiết.
- Không mở rộng ngày kết thúc chuyến đi hoặc tự sắp lại toàn bộ ngày để nhường chỗ.
- Không triển khai tính năng trong đợt đặc tả này.

## Decisions

### 1. Luồng người dùng

Trên mép dưới ảnh bìa chuyến đi có chip thời tiết hiện tại nổi bật, biểu tượng đổi màu theo điều kiện và huy hiệu đếm hoạt động cần xem. Chạm chip mới mở bảng thời tiết/Sen; không đặt thẻ cảnh báo lớn dưới ô ngày đi hoặc cạnh tên ngày trong timeline. Bảng có thể nói: “Chiều nay Hội An được dự báo có mưa lớn 🌧️ Lịch đi thuyền thả đèn lúc 16:00 có thể bị ảnh hưởng. Bạn muốn Sen làm gì?” Bảng ghi địa điểm, thời gian và thời điểm lấy dự báo, không khẳng định chắc chắn sẽ mưa.

Chip mở bảng tổng hợp, từ đó người dùng chọn hoạt động để xem phương án; không tự bật hộp thoại chặn màn hình. Nhiều hoạt động bị ảnh hưởng được gom dưới một huy hiệu đếm; mỗi hoạt động có quyết định riêng. Thứ tự ưu tiên: mức ảnh hưởng cao hơn, sau đó thời gian gần hơn.

| Lựa chọn | Hành vi | Khi chưa đủ điều kiện |
| --- | --- | --- |
| Dời sang muộn hơn | Chọn một giờ còn lại trong cùng ngày, xem trước giờ cũ → giờ mới, bấm “Dời sang 19:00” để lưu | Không có khoảng phù hợp: giải thích, không tự đẩy sang ngày sau |
| Đổi sang ngày khác | Chọn ngày và giờ trong chuyến đi, xem dự báo nếu còn trong tầm dự báo | Ngày ngoài tầm dự báo có nhãn “Chưa có dự báo”; chỉ cho đổi thủ công với lựa chọn rõ ràng của người dùng |
| Thay bằng hoạt động trong nhà | Chọn một địa điểm đã xác nhận có không gian trong nhà; xem tên, khu vực, thời lượng, giá nếu có, phần lịch sẽ thay | Không có dữ liệu: báo chưa tìm được phương án, cho tìm/chọn thủ công; không tạo tên địa điểm giả |
| Giữ nguyên lịch trình | Lưu quyết định giữ nguyên cho cảnh báo hiện tại; không thay đổi hoạt động | Nếu chưa lưu được quyết định, báo lỗi và cho thử lại; lịch vẫn nguyên |

Chọn một nhóm hành động chỉ mở bước chọn chi tiết. Nút hành động cuối cùng mô tả chính xác thay đổi và là lần đồng ý duy nhất để lưu. Đóng bảng/quay lại/hết thời gian không phải là đồng ý. Khi lưu thành công, hiển thị thay đổi và nút “Hoàn tác” trong 10 giây; hoàn tác cũng kiểm tra phiên bản lịch, không ghi đè sửa đổi mới.

Lời nhắc ví dụ khi có dữ liệu phù hợp: “19:00–20:00 được dự báo ít mưa hơn. Sen có thể dời hoạt động sang 19:00.” Không dùng “19:00 chắc chắn tạnh”. Với dịch vụ có đặt chỗ, nêu rõ đây chỉ là sửa lịch cá nhân, chưa đổi vé/giờ với nhà cung cấp.

### 2. Dự báo theo thời gian hoạt động

Tiếp tục dùng Open-Meteo, bổ sung `weather_code`, `precipitation_probability`, `precipitation`, `wind_gusts_10m`, `visibility` theo giờ, phạm vi 7 ngày và múi giờ `Asia/Ho_Chi_Minh`. Theo [tài liệu Open-Meteo](https://open-meteo.com/en/docs), lượng mưa/xác suất mưa theo giờ mô tả giờ vừa kết thúc; visibility có đơn vị mét, gió mặc định km/h. Adapter phải chuẩn hóa khoảng thời gian để không lệch một giờ. Đây là dữ liệu dự báo, không phải xác nhận điều kiện tại hiện trường.

- Dùng tọa độ của hoạt động, không dùng thời tiết tại vị trí hiện tại của người dùng thay cho điểm đến. Không có tọa độ: hiển thị thiếu dữ liệu, cho người dùng bổ sung/chọn địa điểm.
- Ngày hoạt động = `start_date + day_number - 1`, theo lịch địa phương Việt Nam, không theo múi giờ thiết bị.
- Có giờ và thời lượng hợp lệ: xét toàn bộ khoảng hoạt động cùng khoảng di chuyển đã biết. Chưa có thời lượng: đánh giá sơ bộ cả buổi và yêu cầu chọn thời lượng trước khi đề xuất lịch cụ thể.
- Chỉ có buổi: đánh giá 07:00–12:00, 12:00–18:00 hoặc 18:00–23:00; lời nhắc ghi “buổi”, không giả định người dùng đã chọn 07:00/13:00/18:00.
- Hoạt động đã qua hoặc chuyến đi hoàn tất không được nhắc. Chưa đặt ngày đi: mời đặt ngày, không suy đoán ngày thực hiện.
- Thẻ chủ động chỉ xét hoạt động trong 72 giờ tới. Người dùng vẫn có thể mở xem dự báo đến 7 ngày; quá phạm vi trả về phải ghi chưa có dữ liệu.

Tách `weather-service` (fetch/validate/cache) và `weather-impact` (hàm thuần phân loại) khỏi UI. Dùng mẫu câu Việt/Anh có dữ liệu điền vào; không cần gọi LLM hoặc trừ lượt AI cho cảnh báo này.

### 3. Quy tắc ảnh hưởng và giới hạn của suy luận

Các ngưỡng sau là **mặc định sản phẩm đề xuất để thử nghiệm**, không phải chuẩn khí tượng hay chứng nhận an toàn. Tập trung trong một cấu hình có phiên bản để điều chỉnh sau kiểm thử.

| Nhóm | Điều kiện khởi điểm | Cách dùng |
| --- | --- | --- |
| Cần chú ý | Xác suất mưa ≥60% hoặc lượng mưa ≥1 mm trong một giờ giao với hoạt động | Nhắc cho hoạt động ngoài trời, đạp xe, đi bộ hoặc hoạt động nhạy với mưa |
| Ảnh hưởng cao | WMO 65/67/82/95/96/99; hoặc lượng mưa ≥5 mm/giờ; hoặc gió giật ≥40 km/h | Ưu tiên cảnh báo, không quảng bá xe đạp/xe máy/thuyền như lựa chọn phù hợp |
| Hạn chế tầm nhìn | WMO 45/48 hoặc visibility <1.000 m | Cảnh báo riêng cho đường đèo, xe máy, xe đạp và đường thủy; không gọi là chỉ “nhiều mây” |
| Hiện tượng đặc biệt | Mã mưa đóng băng/tuyết hoặc mã chưa hỗ trợ | Không gộp vào trời đẹp; nêu hiện tượng nếu xác định được, nếu không thì ghi chưa đủ dữ liệu để tư vấn |
| Chưa rõ | Thiếu biến bắt buộc, giờ không khớp, tọa độ không có hoặc dữ liệu quá cũ | Không kết luận trời đẹp, không đưa phương án gắn nhãn “ít ảnh hưởng hơn” |

Các biến bắt buộc cho đánh giá đầy đủ là mã WMO, xác suất/lượng mưa, gió giật và tầm nhìn tại mọi khoảng cần xét. Một nguy cơ cao đã biết vẫn phải hiển thị dù các biến khác thiếu; dữ liệu thiếu không được làm hạ mức ảnh hưởng.

Riêng gợi ý phương tiện ngoài trời, mã WMO có mưa dù chưa vượt ngưỡng lượng/xác suất vẫn không được gọi là trời thuận lợi: dùng nội dung điều kiện mưa nhẹ. Nhóm thuận lợi yêu cầu WMO 0–3, đủ dữ liệu và không có ngưỡng ảnh hưởng bị vượt trong toàn khoảng. Phân loại phải xét mã hiện tượng trước, tránh mô tả trời đẹp khi WMO đã ghi mưa.

Hoạt động trong nhà vẫn có phần di chuyển ngoài trời. Chỉ bỏ cảnh báo mưa thông thường cho thời gian ở trong nhà; vẫn xét giông, gió hoặc tầm nhìn trên phần di chuyển có dữ liệu. Không có dữ liệu tuyến đường thì chỉ tư vấn theo điểm đến và ghi giới hạn, không kết luận toàn tuyến an toàn.

### 4. Khi nào được gọi là “thời tiết thay đổi”

Lưu kết quả đánh giá trước theo hoạt động, lịch đã chọn và vị trí. So sánh các bản dự báo cho **cùng một khoảng hoạt động**, không so thời tiết sáng hôm nay với tối ngày mai.

- Lần đầu đã có nguy cơ: nói “Dự báo hiện tại…”, không nói “Dự báo vừa thay đổi”.
- Từ không có ảnh hưởng sang có ảnh hưởng, tăng mức ảnh hưởng hoặc xuất hiện loại nguy cơ mới: tạo sự kiện cần xem xét.
- Chỉ thay số xác suất trong cùng nhóm: cập nhật chi tiết, không nhắc lại.
- Người dùng giữ nguyên: không nhắc lại sự kiện đó sau đóng/mở app hoặc đổi thiết bị. Mức tăng hoặc loại nguy cơ mới được tạo sự kiện mới và giải thích phần thay đổi.
- Nguy cơ giảm/hết: giải quyết thẻ cũ, không tự khôi phục lịch trước khi người dùng đã dời/thay hoạt động.
- Người dùng sửa ngày/giờ/địa điểm: đánh giá lại theo lịch mới; quyết định cũ không áp dụng nhầm.

Sự kiện có `episode_id` và `risk_signature` (các loại nguy cơ cùng mức độ), gắn `schedule_fingerprint`; không dùng timestamp tải API làm khóa chống trùng. Chỉ kết thúc một đợt cảnh báo khi có hai lần đánh giá mới liên tiếp cách nhau ít nhất 30 phút đều hết điều kiện nhắc. Nhờ vậy dao động quanh ngưỡng không tạo nhiều đợt mới. Khi giảm trong cùng đợt, mức đã được người dùng chấp nhận vẫn được nhớ; chỉ mức vượt mức đã chấp nhận hoặc nguy cơ mới mới nhắc lại.

### 5. Làm mới và dữ liệu cũ

- Fetch khi mở lịch trình, khi quay lại app và mỗi 30 phút khi màn hình lịch trình đang hoạt động; dùng cache mới trong 30 phút, gộp yêu cầu cùng tọa độ/khoảng ngày.
- “Làm mới” cho tải mới, giới hạn tối thiểu 60 giây giữa hai lần tải thủ công; hủy response cũ khi chuyển chuyến đi/tọa độ.
- Cache quá 60 phút hoặc tải thất bại: ghi rõ thời điểm lấy dữ liệu. Không phát sinh khẳng định mới “dự báo đã thay đổi” từ cache cũ.
- Lựa chọn dời theo thời tiết phải có snapshot mới trong 30 phút tại lúc xác nhận; nếu cũ thì tải lại và yêu cầu người dùng xem phương án đã cập nhật. Khi offline không xếp hàng thay đổi lịch để tự áp dụng sau.
- Lưu `fetched_at`; chỉ hiển thị thời điểm phát hành mô hình nếu nhà cung cấp thực sự cung cấp, không đánh đồng hai thời điểm.

Phương án background/push bị tách khỏi bản đầu vì cần scheduler, đăng ký thiết bị, quyền thông báo và chính sách tần suất riêng. Khi chưa có các thành phần đó, không viết “Sen luôn theo dõi thời tiết cho bạn”.

### 6. Sinh và xác thực phương án

**Dời giờ/ngày:** tìm khoảng trống theo thời lượng, bước 30 phút, không sớm hơn hiện tại; xem hết các giờ dự báo giao với khoảng đó. Phải giảm mức ảnh hưởng và không thêm nguy cơ cao khác. Không tự dời các hoạt động lân cận. Giữ khoảng di chuyển tính được; chưa có dữ liệu di chuyển dùng đệm 30 phút và gắn nhãn ước tính. Thiếu thông tin thời lượng của hoạt động lân cận thì không khẳng định “không trùng”; yêu cầu bổ sung trước khi đưa vào danh sách đề xuất đã kiểm tra.

**Trong nhà:** dùng trường xác nhận `shelter_type` và `shelter_verified_at`, vị trí/vùng, giờ mở cửa có cấu trúc, thời lượng và trạng thái đang hoạt động. Lọc trong cùng vùng, mặc định bán kính 10 km; ưu tiên phù hợp sở thích/ngân sách và quãng di chuyển ngắn. Không mở rộng phạm vi âm thầm. Dữ liệu thiếu giá ghi “Chưa có giá”; thiếu giờ mở cửa ghi “Cần kiểm tra giờ mở cửa”. Những lựa chọn thiếu dữ liệu chỉ nằm trong nhóm cần người dùng tự kiểm tra, không gắn nhãn đã kiểm tra phù hợp.

Không suy ra “trong nhà” chỉ từ category Café/Văn hóa hoặc từ lời sinh bởi AI. Nếu catalog chưa có lớp làm đèn lồng hoặc địa điểm phù hợp, có thể gợi ý **loại hoạt động** để người dùng tìm, nhưng chỉ thay lịch bằng địa điểm/hoạt động cụ thể mà người dùng đã chọn.

Chỉ cho chọn trong phạm vi ngày chuyến đi. Giờ mở cửa xác nhận đóng, trùng lịch hoặc không đủ thời gian di chuyển là điều kiện chặn. Ngoài phạm vi dự báo hoặc chưa biết giờ mở cửa cho phép **đổi thủ công**, với nhãn thiếu dữ liệu và nút có nội dung rõ ràng; không trình bày như một phương án được Sen bảo đảm phù hợp.

### 7. Gợi ý phương tiện theo vùng

Đây là quy tắc nội dung sản phẩm dựa trên ví dụ của người dùng, không phải xác nhận dịch vụ đang hoạt động. Chỉ hiển thị khi vùng được xác định bằng metadata; `Mekong Delta` phải có các địa phương/thành phố thuộc vùng được ánh xạ rõ ràng. Không dùng từ khóa mơ hồ hoặc tâm thành phố gần nhất để gán vùng.

| Vùng | Khi dự báo thuận lợi cho hoạt động | Khi có mưa/gió/tầm nhìn hạn chế |
| --- | --- | --- |
| Huế | Thuyền rồng trên sông Hương, xích lô | Gợi ý taxi/xe công nghệ khi đường vẫn lưu thông; với hoạt động trên sông, ưu tiên dời và kiểm tra đơn vị vận hành |
| Hội An | Xe đạp quanh phố cổ/đồng lúa | Taxi đến điểm được phép đón trả; đi bộ đoạn ngắn chỉ khi mưa nhẹ, không có dấu hiệu ngập/giông và phù hợp điều kiện thực tế. Mưa lớn: ưu tiên trú trong nhà/dời hoạt động |
| Miền Tây | Xuồng ba lá/ghe máy ra chợ nổi theo đơn vị vận hành | Chỉ gợi ý đi sớm nếu dự báo đúng khung giờ tốt hơn và đơn vị vận hành xác nhận; nếu không thì dời buổi/ngày. Không suy ra “sáng sớm luôn êm” |
| Hà Giang | Xe máy hoặc tài xế địa phương theo nhu cầu người dùng | Không đề xuất tự chạy đèo khi mưa/sương mù; có thể xem phương án ô tô có tài xế nếu tuyến còn hoạt động và được đơn vị địa phương xác nhận. Điều kiện nghiêm trọng: ưu tiên hoãn |

Thứ tự lựa chọn nội dung: nguy cơ nghiêm trọng → thông tin còn thiếu → điều kiện xấu thông thường → điều kiện thuận lợi. Ô tô/taxi không được dùng để bỏ qua cảnh báo đóng đường/ngập/giông. Không có nguồn dữ liệu đóng đường/đơn vị vận hành trong bản đầu thì dùng câu điều kiện, không tuyên bố đã xác minh.

Gợi ý phương tiện không thay đổi phương tiện hoặc lịch trình đã lưu. Vùng không có cấu hình chỉ nhận lời khuyên chung phù hợp dữ liệu hiện có. Không bổ sung nội dung của Huế cho Hội An hoặc ngược lại.

### 8. Lưu quyết định và thay đổi lịch

Đề xuất thay đổi schema bổ sung, giữ tương thích dữ liệu cũ:

- Metadata địa điểm/hoạt động: vùng chuẩn hóa, `shelter_type` (`indoor/outdoor/mixed/unknown`), nguồn/ngày xác nhận, `weather_exposure` (thông thường/đường thủy/xe đạp/đường đèo), thời lượng và giờ mở cửa cấu trúc. Dữ liệu cũ mặc định `unknown`, không backfill theo category một cách mù quáng.
- `trips.itinerary_revision`: tăng khi bất kỳ nguồn nào sửa ngày chuyến đi hoặc thêm/sửa/xóa item. Mọi đường ghi hiện hữu phải tham gia cơ chế phiên bản, không chỉ tính năng thời tiết.
- `trip_weather_events`: chủ sở hữu, trip/item, episode, fingerprint lịch, signature/mức nguy cơ, snapshot tham chiếu, trạng thái và thời điểm. RLS chỉ chủ chuyến đi được truy cập.
- `trip_weather_decisions`: event, hành động, dữ liệu trước/sau, phiên bản lịch, khóa yêu cầu duy nhất và thời điểm. Giữ dữ liệu đủ để hoàn tác và nhận biết retry; xóa theo trip/account.
- Cache snapshot dự báo tách khỏi lịch/quyết định; cache có thể hết hạn mà không xóa quyết định giữ nguyên.

Lưu bằng RPC có giao dịch: xác thực chủ sở hữu, khóa trip để kiểm tra phiên bản, kiểm tra event còn đúng item/giờ, xác thực dữ liệu đích và ràng buộc lịch. Snapshot dùng để xếp hạng theo thời tiết phải do lớp dịch vụ phía server cấp/kiểm tra, không tin giá trị nguy cơ do client tự gửi. Nhận `expected_revision` và `request_id` để chống ghi đè và bấm hai lần.

- Dời: đổi `day_number`, `time_slot`, `visit_time` và thứ tự cần thiết trong một giao dịch.
- Thay: giữ ID item và ghi nguồn địa điểm mới; xóa các trường snapshot `experience_*` cũ không còn đúng, giữ ghi chú cá nhân; lưu bản trước để hoàn tác. Không xóa cả ngày.
- Giữ: chỉ ghi quyết định, không sửa trip/items hoặc tăng revision lịch.
- Lỗi: rollback toàn bộ, giữ UI lịch cũ và hiển thị lỗi. Mất kết nối sau lưu: tra `request_id` trước retry, không lưu lần hai.
- Lịch đã đổi ở thiết bị khác: tải mới, tính lại phương án, để người dùng chọn lại; không tự áp lại quyết định cũ.
- Sau thành công: cập nhật state và cache chuyến đi từ dữ liệu server trả về; không để lịch offline còn phương án cũ.

Không dùng lại trực tiếp các hàm cập nhật lạc quan hiện tại cho luồng mới. Cần bổ sung kiểm thử ghi đồng thời để cơ chế phiên bản thực sự bao phủ những thao tác cũ.

## Risks / Trade-offs

- Dự báo chỉ là mô hình theo điểm → ghi thời điểm/nguồn, dùng câu “dự báo/có thể”, không bảo đảm tuyến đường hay dịch vụ an toàn.
- Thiếu metadata/giờ mở cửa → số phương án tự động ít hơn; ưu tiên dữ liệu xác nhận, có lựa chọn thủ công được phân biệt rõ.
- Dữ liệu ngoài 3 thành phố hiện có chưa đầy đủ → chỉ bật gợi ý đặc trưng tại vùng đã có mapping và dữ liệu; có trạng thái không đủ dữ liệu cho các nơi còn lại.
- Nhiều địa điểm làm tăng số lần gọi API → cache/gộp tọa độ và giờ, kiểm tra hạn mức/điều kiện sử dụng nhà cung cấp trước rollout thật.
- Refresh khi foreground không phát hiện ngay mọi thay đổi lúc app đóng → công bố đúng phạm vi; background là backlog riêng.
- DAO/RPC mới trong khi màn hình cũ vẫn ghi trực tiếp → revision/trigger bao phủ mọi writer và kiểm thử song song là điều kiện nghiệm thu.
- Ngưỡng sản phẩm có thể nhắc quá nhiều hoặc bỏ sót → tập fixture đa dạng, theo dõi tần suất giữ nguyên và điều chỉnh cấu hình có phiên bản; không trình bày ngưỡng như tiêu chuẩn an toàn.

## Migration Plan

1. Hoàn thiện metadata/vùng và bộ fixture thời tiết; thống nhất ngưỡng mặc định ở trên trước triển khai.
2. Thêm schema, RLS và RPC với feature flag tắt; không thay dữ liệu lịch hiện có.
3. Bổ sung service dự báo và rule engine; chạy kiểm thử trên dữ liệu giả lập, không phụ thuộc thời tiết hôm chạy test.
4. Tích hợp UI, kiểm thử owner/non-owner, retry, ghi đồng thời, offline, font lớn và Việt/Anh.
5. Thử local trước, sau đó rollout giới hạn. Đánh giá các vùng có dữ liệu đủ trước khi mở rộng.
6. Rollback bằng tắt flag; giữ các thay đổi lịch người dùng đã chọn và lịch sử quyết định, không tự hoàn nguyên lịch. Không xóa cột/tables ngay khi còn client cũ/mới dùng chung.

## Open Questions

Các lựa chọn dưới đây có phương án mặc định để triển khai; chúng chưa được coi là yêu cầu gốc đã được người dùng chốt:

- Có cần cảnh báo khi app đóng ngay ở bản đầu? Mặc định hiện tại: chỉ foreground; nếu cần push phải bổ sung phạm vi thiết kế riêng.
- Ai xác nhận metadata trong nhà, giờ mở cửa và tình trạng dịch vụ? Mặc định: dữ liệu quản trị có nguồn/ngày kiểm tra, không suy đoán bằng AI.
- Có giữ phạm vi 72 giờ cho thẻ chủ động, forecast 7 ngày, bán kính 10 km và các ngưỡng thử nghiệm không? Mặc định: dùng cấu hình tập trung, đánh giá bằng fixture trước rollout.
- Có cần sửa/hủy đặt chỗ bên ngoài? Mặc định: chỉ sửa lịch trong Viloca, người dùng tự làm việc với nhà cung cấp.
