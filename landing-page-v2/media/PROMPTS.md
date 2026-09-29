# Prompt tạo ảnh/video cho Viloca v2 (dán vào Antigravity)

Phong cách chung: cinematic, ánh sáng giờ vàng, màu ấm đất nung (#C8602E) và xanh lá (#2E6F4E),
người Việt thật gần gũi, không chữ/logo trong khung hình, không đám đông du khách.

## Video (đặt vào `media/`)

| File | Tỉ lệ | Thời lượng | Prompt |
|---|---|---|---|
| `hero.mp4` (+ `hero.jpg` poster) | 16:9 | 8–10s, loop mượt | Cảnh bay chậm trên đồi chè và làng quê miền Trung Việt Nam lúc bình minh, sương mỏng, máy quay drone lướt nhẹ về phía trước, những chiếc nón lá và đèn lồng lơ lửng trôi chậm như không trọng lực. |
| `story-culture.mp4` | 16:9 | 6s | Đôi tay nghệ nhân làng gốm/làng mộc đang làm việc, cận cảnh, bụi gỗ bay lơ lửng trong tia nắng, máy quay đẩy chậm. |
| `story-nature.mp4` | 16:9 | 6s | Thuyền thúng trôi giữa rừng dừa nước, mặt nước phản chiếu, lá dừa rơi chậm. |
| `story-people.mp4` | 16:9 | 6s | Gia đình người Việt dọn bữa cơm bên hiên nhà, khói bếp bay lên, trẻ em cười, ánh sáng ấm. |

## Ảnh (nếu muốn thay ảnh trong `../landing-page/assets/`)

- Chân dung cận cảnh bà cụ dệt thổ cẩm, nụ cười tự nhiên, nền làng quê mờ.
- Cánh đồng lúa bậc thang lúc hoàng hôn, một người gánh lúa nhỏ ở góc khung.
- Phố cổ đêm lễ hội đèn lồng, trẻ em thả đèn hoa đăng trên sông.

## Gắn vào trang

- Hero: chỉ cần lưu `hero.mp4` + `hero.jpg` (trang tự nhận).
- Story: đổi `background-image` của 3 thẻ `.layer` trong `index.html` sang ảnh mới,
  hoặc thay bằng thẻ `<video>` cùng class nếu dùng clip.
- Lưu ý: chỉ dùng cảnh minh họa, không gắn với địa điểm/đối tác cụ thể khi chưa xác nhận.
