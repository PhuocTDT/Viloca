-- Seed "Trải nghiệm địa phương" (Local Experience) vào Supabase — thay cho mock
-- data hard-code trong app/local.tsx. Sinh tự động từ gen_local_experiences_sql.js,
-- không chỉnh tay file này.

CREATE TABLE public.local_experiences (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  theme             TEXT NOT NULL CHECK (theme IN ('festivals_beliefs','craft_villages','culinary','daily_life')),
  region_code       TEXT NOT NULL,
  region_name       TEXT NOT NULL,
  vibe              TEXT NOT NULL,
  image             TEXT NOT NULL,
  local_tip         TEXT NOT NULL,
  duration          TEXT NOT NULL,
  price             TEXT NOT NULL,
  crowd_level       TEXT NOT NULL,
  best_time         TEXT NOT NULL,
  long_description  TEXT NOT NULL,
  timeline_steps    JSONB NOT NULL DEFAULT '[]',
  rules             TEXT[] NOT NULL DEFAULT '{}',
  activities        TEXT[] NOT NULL DEFAULT '{}',
  sort_order        INT NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.local_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY local_experiences_select_all ON public.local_experiences
  FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY local_experiences_service_write ON public.local_experiences
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.local_region_vibes (
  id                      TEXT PRIMARY KEY,
  region_name             TEXT NOT NULL,
  vibe_key                TEXT NOT NULL CHECK (vibe_key IN ('gentle_ancient','energetic_modern','wild_authentic','slow_rustic','adventurous')),
  vibe_label              TEXT NOT NULL,
  image                   TEXT NOT NULL,
  suggested_activities    TEXT[] NOT NULL DEFAULT '{}',
  description             TEXT NOT NULL,
  spots_count             INT NOT NULL DEFAULT 0,
  highlight_experience_id TEXT REFERENCES public.local_experiences(id),
  sort_order              INT NOT NULL DEFAULT 0,
  is_active               BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.local_region_vibes ENABLE ROW LEVEL SECURITY;
CREATE POLICY local_region_vibes_select_all ON public.local_region_vibes
  FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY local_region_vibes_service_write ON public.local_region_vibes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.local_experiences (id, title, theme, region_code, region_name, vibe, image, local_tip, duration, price, crowd_level, best_time, long_description, timeline_steps, rules, activities, sort_order) VALUES (
  'exp-spotlight-mientay', 'Miền Tây sông nước: Ở nhà bè & Đánh bắt cá cùng ngư dân', 'daily_life', 'mekong_delta', 'Miền Tây (Châu Đốc)', 'Chậm rãi, mộc mạc',
  'https://images.unsplash.com/photo-1528127269322-539801943592?w=800', 'Nên thức dậy lúc 5:30 sáng khi người dân bắt đầu gỡ lưới cá linh. Cùng gia chủ nấu nồi canh chua bông điên điển ăn ngay trên sàn bè.', 'Nửa ngày (4-5 giờ)', '150.000₫ – 250.000₫', '🌿 Hoàn toàn vắng khách', '05:30 – 11:30 sáng', 'Trải nghiệm hòa nhập hoàn toàn vào đời sống sông nước miền Tây. Bạn không phải là khách du lịch ngồi ngắm cảnh, mà sẽ trực tiếp sinh hoạt cùng gia đình chủ bè cá: thức giấc theo tiếng sóng vỗ mạn thuyền, gỡ lưới kéo cá tươi, hái rau dại ven bờ kênh và quây quần bên mâm cơm gia đình hào sảng đậm chất Nam Bộ.',
  '[{"time":"05:30","title":"Đón bình minh trên nhà bè","desc":"Thức dậy cùng tiếng nước róc rách, uống tách trà nóng hoặc cà phê vợt cùng gia chủ bè cá."},{"time":"06:30","title":"Theo xuồng gỡ lưới & bắt cá","desc":"Lên chiếc xuồng ba lá, cùng bác ngư dân thu lưới bắt cá linh, cá tai tượng còn nhảy tanh tách."},{"time":"09:00","title":"Hái rau dại & chuẩn bị bữa trưa","desc":"Chèo xuồng cập bờ hái bông điên điển, bông súng non và chuẩn bị gia vị nấu canh chua."},{"time":"11:00","title":"Thưởng thức bữa cơm trên sàn bè","desc":"Cơm nóng ăn kèm canh chua cá tươi vừa bắt và cá kho tộ tiêu đậm đà giữa làn gió sông lộng mát."}]'::jsonb, ARRAY['Mặc trang phục mộc mạc, gọn gàng, dép chống trượt khi lên xuồng bè', 'Luôn mang áo phao khi xuồng di chuyển trên luồng sông lớn', 'Giữ gìn vệ sinh chung, tuyệt đối không vứt rác hoặc túi nilon xuống dòng sông']::text[], ARRAY['Đi ghe sáng sớm gỡ lưới', 'Tự tay bắt cá tươi sống', 'Nấu cơm canh chua cùng gia đình bè cá']::text[], 0
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_experiences (id, title, theme, region_code, region_name, vibe, image, local_tip, duration, price, crowd_level, best_time, long_description, timeline_steps, rules, activities, sort_order) VALUES (
  'exp-battrang', 'Làng gốm Bát Tràng: Tự tay xoay bàn gốm cổ truyền', 'craft_villages', 'ha_noi', 'Hà Nội (Gia Lâm)', 'Truyền thống, Tỉ mỉ',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800', 'Đi sâu vào ngõ nhỏ xóm 3 để gặp các nghệ nhân già thay vì các quầy hàng ngoài chợ. Bạn sẽ được chỉ dẫn chuốt đất đúng thế tay cổ truyền.', '2.5 giờ', '40.000₫ – 60.000₫', '🌿 Xưởng thợ vắng', '08:30 – 11:30 sáng', 'Bát Tràng hơn 500 năm tuổi không chỉ có các gian hàng thương mại. Trải nghiệm đích thực là bước vào các lò gốm gia đình sâu trong ngõ nhỏ, chạm tay vào thớ đất sét dẻo quánh, cảm nhận sự tập trung tĩnh lặng khi bàn xoay quay đều dưới bàn tay của người nghệ nhân.',
  '[{"time":"08:30","title":"Đi dạo ngõ cổ làng gốm","desc":"Bách bộ qua các bức tường phơi than gốm độc đáo, tìm đến xưởng lò thủ công của nghệ nhân."},{"time":"09:00","title":"Học chuốt gốm trên bàn xoay","desc":"Nghệ nhân cầm tay hướng dẫn nhào đất, định tâm và vuốt dáng bình hoa hoặc chén trà theo ý thích."},{"time":"10:15","title":"Vẽ hoa văn & tráng men","desc":"Dùng bút lông phác thảo họa tiết hoa sen, men lam truyền thống và gửi lại lò nung để nhận thành phẩm."}]'::jsonb, ARRAY['Cắt móng tay gọn gàng để dễ nắn vuốt đất sét', 'Hỏi thăm nghệ nhân trước khi chạm vào các phôi gốm mộc chưa nung']::text[], ARRAY['Học nhào đất sét', 'Tự tạo hình bình gốm', 'Vẽ men và mang sản phẩm về']::text[], 1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_experiences (id, title, theme, region_code, region_name, vibe, image, local_tip, duration, price, crowd_level, best_time, long_description, timeline_steps, rules, activities, sort_order) VALUES (
  'exp-traque', 'Làng rau Trà Quế: Một ngày làm nông dân hữu cơ', 'daily_life', 'da_nang', 'Hội An (Quảng Nam)', 'Mộc mạc, Yên bình',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800', 'Mặc áo bà ba và gánh đôi thùng tưới nước bằng gáo dừa lúc chiều mát (sau 16:00). Cư dân ở đây luôn sẵn lòng chỉ bạn cách nhận biết 20 loại rau thơm.', '2 giờ', '35.000₫', '🌿 Rất yên tĩnh', '15:30 – 17:30 chiều', 'Làng Trà Quế được vinh danh làng du lịch tốt nhất thế giới năm 2024 nhờ gìn giữ nguyên vẹn phương pháp canh tác rau sạch bằng rong vớt từ đầm Trà Quế. Mùi thơm ngát của các loại rau húng, tía tô, ngò gai lan tỏa trong không gian thanh sạch của làng quê miền Trung.',
  '[{"time":"15:30","title":"Gặp gỡ nông dân & thay áo bà ba","desc":"Uống ly nước hạt é mát lành, lắng nghe nông dân kể về lịch sử trồng rau 300 năm của làng."},{"time":"16:00","title":"Cuốc đất & bón rong đầm","desc":"Cầm cuốc xới luống đất xốp, học cách rải rong đầm biển - bí quyết tạo nên vị thơm đặc trưng."},{"time":"16:45","title":"Gánh nước tưới rau","desc":"Thử sức với đôi thùng tưới nước bằng gáo dừa truyền thống với sự hướng dẫn của bà con."}]'::jsonb, ARRAY['Đi chân trần hoặc ủng nông dân để tránh dẫm nát luống rau', 'Tôn trọng công sức lao động của người trồng rau']::text[], ARRAY['Cuốc đất xới luống rau', 'Tưới nước gáo dừa', 'Thưởng thức nước chanh sả é Trà Quế']::text[], 2
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_experiences (id, title, theme, region_code, region_name, vibe, image, local_tip, duration, price, crowd_level, best_time, long_description, timeline_steps, rules, activities, sort_order) VALUES (
  'exp-quangphucau', 'Làng tăm hương Quảng Phú Cầu: Sân phơi hương trăm tuổi', 'craft_villages', 'ha_noi', 'Hà Nội (Ứng Hòa)', 'Rực rỡ, Hoài niệm',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', 'Đến vào những ngày nắng đẹp khoảng 9:00 - 11:00 trưa khi những bó tăm hương xòe hoa nở đỏ thắm khắp các sân gạch đình làng.', '2 giờ', 'Miễn phí / Tùy tâm', '🌿 Làng quê yên ả', '09:00 – 11:30 trưa', 'Hơn một thế kỷ gìn giữ nghề se hương thảo mộc cung cấp cho khắp các dịp lễ tết cả nước. Mỗi bó hương xòe tròn như những đóa hoa khổng lồ phơi dưới ánh nắng rực rỡ, mang theo hương quế, hồi, trầm thơm ngát dịu dàng.',
  '[{"time":"09:00","title":"Tham quan sân phơi hương làng cổ","desc":"Chiêm ngưỡng hàng trăm vò tăm hương đỏ rực, vàng óng nở hoa trên sân đình rêu phong."},{"time":"09:45","title":"Trò chuyện cùng thợ làm hương","desc":"Xem nghệ nhân chẻ tăm tre, nhuộm màu tự nhiên và se bột hương bằng tay thoăn thoắt."},{"time":"10:30","title":"Thử tự tay bó hương","desc":"Tự tay buộc một bó hương thơm mang về làm quà thờ cúng gia tiên."}]'::jsonb, ARRAY['Bước cẩn thận qua các khoảng trống giữa các bó hương đang phơi', 'Không hút thuốc hoặc mang vật dễ cháy trong khu vực xưởng hương']::text[], ARRAY['Tìm hiểu bí quyết nhuộm hương thảo mộc', 'Trò chuyện cùng thợ se tăm hương lâu năm']::text[], 3
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_experiences (id, title, theme, region_code, region_name, vibe, image, local_tip, duration, price, crowd_level, best_time, long_description, timeline_steps, rules, activities, sort_order) VALUES (
  'exp-talang', 'Bản Tà Lang - Giàn Bí: Sống cùng đồng bào Cơ Tu giữa núi rừng', 'daily_life', 'da_nang', 'Đà Nẵng (Hòa Bắc)', 'Hoang sơ, Bản sắc',
  'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800', 'Ở homestay cộng đồng Alang Nhu, ăn cơm lam nấu trong ống nứa và cá niên nướng đá suối cùng gia đình bà con bản địa.', '1 ngày 1 đêm', '200.000₫ – 400.000₫', '🌿 Hoàn toàn biệt lập', 'Quanh năm (đẹp nhất mùa xuân - hè)', 'Nằm nép mình bên dòng sông Cu Đê và rặng núi Hải Vân hùng vĩ, Tà Lang - Giàn Bí là nơi đồng bào Cơ Tu gìn giữ nếp nhà Gươl truyền thống, điệu múa Tung tung Da dá và những bát cơm lam thơm lừng mùi khói bếp.',
  '[{"time":"14:00","title":"Nhận phòng nhà sàn mộc mạc","desc":"Nghỉ ngơi tại homestay sàn gỗ của gia đình Alang Nhu giữa tiếng suối reo róc rách."},{"time":"15:30","title":"Tắm suối & bắt cá niên","desc":"Theo thanh niên trong bản đi bộ lội suối nước trong vắt, giăng lưới bắt cá suối đá."},{"time":"18:30","title":"Bữa tối bên bếp lửa & rượu cần","desc":"Thưởng thức cá niên nướng mọi, cơm lam dẻo quẹt muối ớt tiêu rừng và nghe già làng kể sử thi."}]'::jsonb, ARRAY['Xin phép già làng trước khi vào nhà Gươl thiêng liêng', 'Giữ thái độ tôn trọng phong tục tâm linh của đồng bào']::text[], ARRAY['Tắm suối đầu nguồn mát lạnh', 'Nghe già làng thổi khèn đinh tút', 'Ăn cơm lam cá suối nướng']::text[], 4
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_experiences (id, title, theme, region_code, region_name, vibe, image, local_tip, duration, price, crowd_level, best_time, long_description, timeline_steps, rules, activities, sort_order) VALUES (
  'exp-chocon', 'Chợ Cồn: Lần theo dấu chân người địa phương ăn sập ngõ hẻm', 'culinary', 'da_nang', 'Đà Nẵng (Hải Châu)', 'Năng động, Dân dã',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', 'Đi sâu vào khu "Đình ẩm thực trong nhà", ghé hàng bún mắm nêm bà Bé và hàng ốc hút góc trái. Gọi một dĩa gỏi bò khô giòn cay đúng điệu.', '1.5 giờ', '20.000₫ – 60.000₫', '🌿 90% là người bản địa', '15:00 – 18:30 chiều', 'Chợ Cồn là trái tim ẩm thực bình dân của người Đà Nẵng. Không biển hiệu hào nhoáng, các gánh hàng chè, bánh bèo, mì Quảng nêm nếm đậm đà cay nồng đúng khẩu vị miền Trung mà người dân địa phương gắn bó suốt bao thế hệ.',
  '[{"time":"15:30","title":"Khai vị bằng ốc hút & ram cuốn","desc":"Ngồi ghế nhựa thưởng thức đĩa ốc hút cay nồng xả ớt nóng hổi thơm phức."},{"time":"16:15","title":"Thưởng thức mì Quảng ếch đồng","desc":"Tô mì sợi dày vàng óng nước nhưn đậm đà ăn kèm bánh tráng nướng giòn rụm."},{"time":"17:00","title":"Tráng miệng chén chè sương sa hạt lựu","desc":"Ly chè ngọt thanh với nước cốt dừa béo bùi xua tan cái nóng chiều miền Trung."}]'::jsonb, ARRAY['Chuẩn bị tiền lẻ để tiện thanh toán cho các cô bán hàng', 'Hỏi mức độ cay trước nếu bạn không ăn được ớt chỉ thiên']::text[], ARRAY['Thưởng thức mì Quảng ếch đồng', 'Ăn ốc hút cay nồng lá chanh', 'Uống sữa đậu nành lá dứa mát lành']::text[], 5
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_experiences (id, title, theme, region_code, region_name, vibe, image, local_tip, duration, price, crowd_level, best_time, long_description, timeline_steps, rules, activities, sort_order) VALUES (
  'exp-duonglam', 'Làng cổ Đường Lâm: Đi lễ đình Mông Phụ & Uống trà nhà cổ 400 năm', 'festivals_beliefs', 'ha_noi', 'Hà Nội (Sơn Tây)', 'Cổ kính, Trầm mặc',
  'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800', 'Ngồi uống nước chè xanh với kẹo mè xửng ở sân nhà cổ ông Hùng xây từ năm 1649, nghe cụ kể sự tích cổng làng đá ong và giếng cổ.', '3 giờ', '20.000₫', '🌿 Thanh bình, vắng vẻ', '08:00 – 11:30 sáng', 'Đường Lâm là làng cổ đá ong duy nhất còn giữ nguyên vẹn cấu trúc đình - giếng nước - cây đa tại miền Bắc. Những con ngõ lát gạch nghiêng, tường đá ong sần sùi rêu phong đưa bạn trở về thế kỷ 17 giữa không gian yên bình đến lạ lùng.',
  '[{"time":"08:30","title":"Bước qua cổng làng Mông Phụ","desc":"Ngắm cây đa cổ thụ trăm tuổi và chiếc cổng làng cổ kính lát gạch rêu phong."},{"time":"09:15","title":"Thăm đình làng Mông Phụ","desc":"Chiêm ngưỡng kiến trúc đình làng tiêu biểu thế kỷ 16 và các hoành phi cổ kính."},{"time":"10:00","title":"Uống trà tại nhà cổ gần 400 năm","desc":"Trò chuyện cùng cụ Hùng, nếm thử kẹo dồi, kẹo lạc và bát tương nếp nồng đượm."}]'::jsonb, ARRAY['Đi nhẹ, nói khẽ khi đi qua các con ngõ yên tĩnh của dân cư', 'Xin phép trước khi bước vào gian thờ của các ngôi nhà cổ']::text[], ARRAY['Thăm đình Mông Phụ linh thiêng', 'Dạo quanh các con ngõ tường đá ong rêu phong', 'Thử làm tương nếp Đường Lâm']::text[], 6
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_experiences (id, title, theme, region_code, region_name, vibe, image, local_tip, duration, price, crowd_level, best_time, long_description, timeline_steps, rules, activities, sort_order) VALUES (
  'exp-giongcafe', 'Gióng Café Phố Hội: Tự tay rang xay cà phê mộc mạc bên hè', 'culinary', 'da_nang', 'Hội An (Phố Cổ)', 'Chậm rãi, Mộc mạc',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', 'Hãy xin chủ quán vào khu rang hạt sau nhà để tự tay đảo mẻ Robusta mộc thơm lừng và nếm thử ly cà phê phin đậm đà nguyên chất.', '1 giờ', '30.000₫ – 50.000₫', '🌿 Không gian yên ắng', '07:00 – 09:30 sáng', 'Nằm ẩn mình trên con phố cổ, Gióng giữ nguyên nếp pha cà phê phin truyền thống với hạt cà phê mộc rang tại chỗ bằng chảo gang. Một buổi sáng chậm rãi ngắm nắng sớm xuyên qua giàn hoa giấy bên ly cà phê đậm chất Hội An.',
  '[{"time":"07:30","title":"Chọn hạt cà phê mộc","desc":"Tìm hiểu về các giống cà phê thuần Việt: Robusta Gia Lai và Arabica Cầu Đất."},{"time":"08:00","title":"Trải nghiệm rang tay trên chảo gang","desc":"Cùng chủ quán nghe tiếng nổ lách tách của hạt cà phê chuyển màu nâu thơm ngát."},{"time":"08:30","title":"Thưởng thức từng giọt cà phê phin","desc":"Ngồi ghế gỗ hiên hè ngắm nhịp sống sớm của người dân phố cổ."}]'::jsonb, ARRAY['Không dùng điện thoại mở loa ngoài để giữ không gian yên tĩnh']::text[], ARRAY['Trải nghiệm rang hạt bằng chảo gang', 'Học cách ủ bột cà phê nhỏ giọt', 'Ngồi ngắm mái ngói âm dương']::text[], 7
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_experiences (id, title, theme, region_code, region_name, vibe, image, local_tip, duration, price, crowd_level, best_time, long_description, timeline_steps, rules, activities, sort_order) VALUES (
  'exp-kimngan', 'Đình Kim Ngân & Ca Trù Phố Cổ: Tìm hiểu nghi lễ đình làng xưa', 'festivals_beliefs', 'ha_noi', 'Hà Nội (Hoàn Kiếm)', 'Cổ kính, Linh thiêng',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', 'Đình thờ ông tổ nghề kim hoàn Bạc Bạc. Ghé vào các tối cuối tuần để nghe câu lạc bộ Ca Trù Hà Nội hát mộc giữa hương trầm thoang thoảng.', '1.5 giờ', 'Tùy tâm', '🌿 Ấm cúng, không xô bồ', '19:30 – 21:00 tối', 'Nằm giữa phố Hàng Bạc tấp nập, đình Kim Ngân là chốn tĩnh lặng hiếm có lưu giữ linh hồn của phường nghề kim hoàn Thăng Long. Đây là nơi diễn ra các đêm biểu diễn ca trù mộc mạc - di sản văn hóa phi vật thể của nhân loại.',
  '[{"time":"19:30","title":"Vào đình thắp nén nhang trầm","desc":"Chiêm ngưỡng kiến trúc chạm khắc rồng phượng tinh xảo thời Hậu Lê."},{"time":"20:00","title":"Nghe ca trù mộc truyền thống","desc":"Lắng nghe tiếng đàn đáy trầm đục, nhịp phách giòn tan và giọng hát ngọt ngào của đào nương."}]'::jsonb, ARRAY['Trang phục lịch sự kín đáo khi bước vào chốn tôn nghiêm']::text[], ARRAY['Chiêm ngưỡng kiến trúc đình cổ thế kỷ 15', 'Tìm hiểu lịch sử các phường nghề 36 phố phường']::text[], 8
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_region_vibes (id, region_name, vibe_key, vibe_label, image, suggested_activities, description, spots_count, highlight_experience_id, sort_order) VALUES (
  'rv-hue', 'Huế', 'gentle_ancient', 'Nhẹ nhàng, cổ kính', 'https://images.unsplash.com/photo-1594311947147-f5de0ec37c88?w=800',
  ARRAY['Nghe ca Huế trên thuyền mộc sông Hương lúc hoàng hôn', 'Thăm nhà vườn An Hiên, uống trà sen cùng gia chủ', 'Thưởng thức chè hẻm 20 món trong ngõ nhỏ Hùng Vương', 'Đạp xe qua cầu ngói Thanh Toàn ngắm đồng lúa chín']::text[], 'Cố đô mang nhịp sống khoan thai, trầm mặc. Nơi mỗi mái đình, nhà rường đều ẩn chứa câu chuyện cung đình và nếp sinh hoạt nho nhã ngàn đời.', 18, 'exp-duonglam', 0
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_region_vibes (id, region_name, vibe_key, vibe_label, image, suggested_activities, description, spots_count, highlight_experience_id, sort_order) VALUES (
  'rv-danang', 'Đà Nẵng & Hội An', 'energetic_modern', 'Năng động, hiện đại', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
  ARRAY['Lướt sóng sớm và chạy bộ ngắm bình minh biển Non Nước', 'Ăn vặt chợ đêm Helio, thưởng thức âm nhạc acoustic ngoài trời', 'Café & Cocktail rooftop ngắm sông Hàn về đêm (Bar Đồ Yêu)', 'Chạy xe máy vượt đèo Hải Vân đón gió biển Đông']::text[], 'Thành phố trẻ trung, giao hòa tuyệt đối giữa biển xanh ngút ngàn và đời sống hiện đại, năng động tràn đầy năng lượng tích cực.', 42, 'exp-chocon', 1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_region_vibes (id, region_name, vibe_key, vibe_label, image, suggested_activities, description, spots_count, highlight_experience_id, sort_order) VALUES (
  'rv-taynguyen', 'Tây Nguyên', 'wild_authentic', 'Hoang sơ, bản sắc', 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800',
  ARRAY['Lắng nghe không gian văn hóa cồng chiêng bên đống lửa buôn làng', 'Ở nhà dài truyền thống sàn gỗ của người Ê Đê / Ba Na', 'Thăm đồi cà phê bạt ngàn đất đỏ bazan mùa hoa trắng nở', 'Đi thuyền độc mộc trên hồ Lắk nguyên sơ']::text[], 'Vùng đất đại ngàn hùng vĩ với tiếng cồng chiêng vang vọng, hương cà phê nồng nàn và tấm lòng hiếu khách chân chất của đồng bào bản địa.', 15, 'exp-talang', 2
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_region_vibes (id, region_name, vibe_key, vibe_label, image, suggested_activities, description, spots_count, highlight_experience_id, sort_order) VALUES (
  'rv-mientay', 'Miền Tây sông nước', 'slow_rustic', 'Chậm rãi, mộc mạc', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
  ARRAY['Đi chợ nổi Cái Răng lúc 5:00 sáng ăn tô bún nước lèo nóng hổi', 'Ở nhà bè Châu Đốc, kéo lưới bắt cá và tự nấu bữa cơm trưa', 'Len lỏi ghe xuồng hái trái cây chín mọng miệt vườn Phong Điền', 'Ngồi hiên nhà nghe đờn ca tài tử cải lương mộc mạc']::text[], 'Xứ sở phù sa trù phú với tính cách hào sảng, phóng khoáng. Nơi cuộc sống gắn liền với nhịp con nước lớn ròng và sự bình yên vô tận.', 24, 'exp-spotlight-mientay', 3
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.local_region_vibes (id, region_name, vibe_key, vibe_label, image, suggested_activities, description, spots_count, highlight_experience_id, sort_order) VALUES (
  'rv-hagiang', 'Hà Giang & Tây Bắc', 'adventurous', 'Phiêu lưu, khám phá', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
  ARRAY['Cầm lái xe máy chạy đèo Mã Pí Lèng ngắm hẻm vực Tu Sản sâu thẳm', 'Hòa vào chợ phiên vùng cao Mèo Vạc uống rượu ngô, ăn thắng cố', 'Ngủ homestay nhà trình tường bản Lô Lô Chải dưới chân cột cờ', 'Săn biển mây bồng bềnh và ruộng bậc thang ngút mắt Hoàng Su Phì']::text[], 'Thiên đường của những cung đường đèo kỳ vĩ, hoa tam giác mạch và sắc màu thổ cẩm rực rỡ của các dân tộc anh em vùng cao Tây Bắc.', 29, 'exp-quangphucau', 4
) ON CONFLICT (id) DO NOTHING;

