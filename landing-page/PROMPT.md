# Prompt landing page Viloca

Hãy xây dựng và duy trì landing page hoàn chỉnh cho **Viloca**, ứng dụng khám phá điểm đến, văn hóa và trải nghiệm địa phương tại Việt Nam.

## Mục tiêu

- Giới thiệu Viloca rõ ràng với người đang lên kế hoạch du lịch Việt Nam.
- Giúp khách du lịch khám phá địa điểm, lễ hội và trải nghiệm văn hóa; dùng trợ lý lịch trình để tham khảo kế hoạch theo điểm đến, thời lượng, phong cách và ngân sách.
- Thể hiện một thương hiệu du lịch hiện đại, gần gũi, giàu bản sắc Việt và đáng tin cậy.
- CTA tập trung vào khám phá Viloca, thử công cụ lập lịch trình và tải ứng dụng. Chỉ dẫn tới cửa hàng ứng dụng khi URL phát hành chính thức đã được cung cấp.

## Sản phẩm và giới hạn nội dung

Viloca hiện có ứng dụng Expo/React Native với các luồng khám phá địa điểm, tìm kiếm/lọc, trang chi tiết địa điểm, bài đăng, chuyến đi và nội dung lễ hội; trang chủ có nội dung địa điểm nổi bật, bộ lọc và danh sách lễ hội. Landing page có bản trình diễn tương tác lập lịch trình. Mô tả tính năng đúng theo mã nguồn và dữ liệu hiện có.

- Không khẳng định có mạng lưới hướng dẫn viên/nghệ nhân đã xác thực, đặt workshop, bản đồ offline, định vị trực tiếp, thông báo đẩy, đồng bộ đa thiết bị, đánh giá đã xác minh hay hỗ trợ đặt dịch vụ nếu chưa được xác nhận.
- Không đưa số lượng người dùng, đối tác, địa điểm, đánh giá sao, mức tăng trưởng hoặc lời chứng thực như sự thật khi chưa có nguồn cung cấp.
- Nội dung demo phải được ghi rõ là ví dụ minh họa; không dùng tên người thật hoặc tổ chức giả làm testimonial.
- Giá vé, thời gian mở cửa, lịch lễ hội và ngân sách là thông tin có thể thay đổi; tránh bảo đảm tính chính xác/cập nhật nếu chưa có nguồn dữ liệu trực tiếp.
- Không dùng lorem ipsum hoặc tạo link tải/cửa hàng giả. Các placeholder cần ghi chú rõ trong mã.

## Thiết kế

- Modern travel SaaS kết hợp tạp chí du lịch bản địa: giàu hình ảnh, có khoảng thở, ấm áp, tự nhiên, không giống mẫu website tour đại trà.
- Dùng ảnh địa điểm và tài sản thương hiệu đã có trong `landing-page/assets/`; ưu tiên ảnh Việt Nam cụ thể thay cho ảnh stock chung chung.
- Giữ bảng màu thương hiệu đất nung và xanh lá hiện tại (`#C8602E`, `#2E6F4E`) cùng nền sáng ấm; typography Be Vietnam Pro và Plus Jakarta Sans.
- Thiết kế responsive cho điện thoại, tablet và desktop; đảm bảo tương phản, tiêu điểm bàn phím, nhãn truy cập và `prefers-reduced-motion`.
- Có thể dùng mockup điện thoại HTML/CSS thể hiện các màn hình khám phá/lịch trình/bản đồ; nội dung mockup là dữ liệu minh họa.

## Bố cục trang

1. Header điều hướng: Tính năng, AI Planner, Điểm đến, Lễ hội, CTA khám phá/tải ứng dụng.
2. Hero: thông điệp “Chạm vào Việt Nam theo cách của riêng bạn”, mô tả khám phá bản địa và lịch trình tham khảo; CTA đến planner và điểm đến; mockup ứng dụng.
3. Nỗi đau và giá trị: quá tải thông tin, lịch trình rời rạc, bỏ lỡ câu chuyện địa phương; Viloca gom cảm hứng khám phá vào một hành trình dễ bắt đầu.
4. Tính năng: khám phá địa điểm, gợi ý lịch trình, theo dõi lễ hội, lưu/chia sẻ chuyến đi — chỉ thể hiện phần đã được xác nhận.
5. Trải nghiệm planner tương tác: các lựa chọn thực sự hoạt động; ghi rõ kết quả là bản gợi ý minh họa nếu không gọi dịch vụ AI trực tiếp.
6. Điểm đến và văn hóa: dùng dữ liệu/ảnh có sẵn, không bịa tình trạng mở cửa hoặc khẳng định đối tác.
7. Cách sử dụng: chọn nơi muốn đến, chọn sở thích/thời lượng, tham khảo và điều chỉnh kế hoạch.
8. Câu chuyện cộng đồng: chỉ dùng đánh giá có thật và được phép trích dẫn; nếu chưa có, thay bằng lợi ích/giá trị sản phẩm, không tạo testimonial giả.
9. FAQ: câu trả lời giới hạn ở những gì sản phẩm hiện xác nhận.
10. CTA cuối trang và footer: liên kết hoạt động; chính sách và kênh liên hệ chỉ hiện khi URL chính thức có sẵn.

## Kỹ thuật

- Landing page độc lập trong `landing-page/`, dùng HTML5/CSS/JavaScript hiện có; không chuyển thành trang React Native hay thêm framework không cần thiết.
- Giữ các tương tác JavaScript đang dùng: menu mobile, mockup, planner demo, bộ lọc, FAQ, modal và thông báo trạng thái.
- Hoạt ảnh nhẹ, ưu tiên CSS/IntersectionObserver đã có; không thêm GSAP chỉ để tạo hiệu ứng trang trí. Tôn trọng `prefers-reduced-motion`.
- Giữ đường dẫn tương đối để mở `landing-page/index.html` trực tiếp; bổ sung metadata SEO phù hợp và không ghi số liệu marketing không được xác minh.
- Sau khi sửa, rà liên kết/ID, tài sản ảnh, nội dung placeholder và giao diện responsive.
