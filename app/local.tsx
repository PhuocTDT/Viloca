import { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { useT } from '@/src/lib/i18n';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type LocalTabMode = 'theme' | 'vibe';
type ThemeCategory = 'all' | 'festivals_beliefs' | 'craft_villages' | 'culinary' | 'daily_life';
type VibeCategory = 'all' | 'gentle_ancient' | 'energetic_modern' | 'wild_authentic' | 'slow_rustic' | 'adventurous';

interface TimelineStep {
  time: string;
  title: string;
  desc: string;
}

interface LocalExperienceItem {
  id: string;
  title: string;
  theme: ThemeCategory;
  regionCode: string;
  regionName: string;
  vibe: string;
  image: string;
  localTip: string;
  duration: string;
  price: string;
  crowdLevel: string;
  activities: string[];
  longDescription: string;
  bestTime: string;
  timelineSteps: TimelineStep[];
  rules: string[];
}

interface RegionVibeCard {
  id: string;
  regionName: string;
  vibeKey: VibeCategory;
  vibeLabel: string;
  image: string;
  suggestedActivities: string[];
  description: string;
  spotsCount: number;
  highlightExperienceId: string;
}

// ─── Dữ liệu trải nghiệm Local đầy đủ & chi tiết ────────────────────────────

const LOCAL_EXPERIENCES: LocalExperienceItem[] = [
  {
    id: 'exp-spotlight-mientay',
    title: 'Miền Tây sông nước: Ở nhà bè & Đánh bắt cá cùng ngư dân',
    theme: 'daily_life',
    regionCode: 'mekong_delta',
    regionName: 'Miền Tây (Châu Đốc)',
    vibe: 'Chậm rãi, mộc mạc',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
    localTip: 'Nên thức dậy lúc 5:30 sáng khi người dân bắt đầu gỡ lưới cá linh. Cùng gia chủ nấu nồi canh chua bông điên điển ăn ngay trên sàn bè.',
    duration: 'Nửa ngày (4-5 giờ)',
    price: '150.000₫ – 250.000₫',
    crowdLevel: '🌿 Hoàn toàn vắng khách',
    bestTime: '05:30 – 11:30 sáng',
    longDescription:
      'Trải nghiệm hòa nhập hoàn toàn vào đời sống sông nước miền Tây. Bạn không phải là khách du lịch ngồi ngắm cảnh, mà sẽ trực tiếp sinh hoạt cùng gia đình chủ bè cá: thức giấc theo tiếng sóng vỗ mạn thuyền, gỡ lưới kéo cá tươi, hái rau dại ven bờ kênh và quây quần bên mâm cơm gia đình hào sảng đậm chất Nam Bộ.',
    timelineSteps: [
      { time: '05:30', title: 'Đón bình minh trên nhà bè', desc: 'Thức dậy cùng tiếng nước róc rách, uống tách trà nóng hoặc cà phê vợt cùng gia chủ bè cá.' },
      { time: '06:30', title: 'Theo xuồng gỡ lưới & bắt cá', desc: 'Lên chiếc xuồng ba lá, cùng bác ngư dân thu lưới bắt cá linh, cá tai tượng còn nhảy tanh tách.' },
      { time: '09:00', title: 'Hái rau dại & chuẩn bị bữa trưa', desc: 'Chèo xuồng cập bờ hái bông điên điển, bông súng non và chuẩn bị gia vị nấu canh chua.' },
      { time: '11:00', title: 'Thưởng thức bữa cơm trên sàn bè', desc: 'Cơm nóng ăn kèm canh chua cá tươi vừa bắt và cá kho tộ tiêu đậm đà giữa làn gió sông lộng mát.' },
    ],
    rules: [
      'Mặc trang phục mộc mạc, gọn gàng, dép chống trượt khi lên xuồng bè',
      'Luôn mang áo phao khi xuồng di chuyển trên luồng sông lớn',
      'Giữ gìn vệ sinh chung, tuyệt đối không vứt rác hoặc túi nilon xuống dòng sông',
    ],
    activities: ['Đi ghe sáng sớm gỡ lưới', 'Tự tay bắt cá tươi sống', 'Nấu cơm canh chua cùng gia đình bè cá'],
  },
  {
    id: 'exp-battrang',
    title: 'Làng gốm Bát Tràng: Tự tay xoay bàn gốm cổ truyền',
    theme: 'craft_villages',
    regionCode: 'ha_noi',
    regionName: 'Hà Nội (Gia Lâm)',
    vibe: 'Truyền thống, Tỉ mỉ',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
    localTip: 'Đi sâu vào ngõ nhỏ xóm 3 để gặp các nghệ nhân già thay vì các quầy hàng ngoài chợ. Bạn sẽ được chỉ dẫn chuốt đất đúng thế tay cổ truyền.',
    duration: '2.5 giờ',
    price: '40.000₫ – 60.000₫',
    crowdLevel: '🌿 Xưởng thợ vắng',
    bestTime: '08:30 – 11:30 sáng',
    longDescription:
      'Bát Tràng hơn 500 năm tuổi không chỉ có các gian hàng thương mại. Trải nghiệm đích thực là bước vào các lò gốm gia đình sâu trong ngõ nhỏ, chạm tay vào thớ đất sét dẻo quánh, cảm nhận sự tập trung tĩnh lặng khi bàn xoay quay đều dưới bàn tay của người nghệ nhân.',
    timelineSteps: [
      { time: '08:30', title: 'Đi dạo ngõ cổ làng gốm', desc: 'Bách bộ qua các bức tường phơi than gốm độc đáo, tìm đến xưởng lò thủ công của nghệ nhân.' },
      { time: '09:00', title: 'Học chuốt gốm trên bàn xoay', desc: 'Nghệ nhân cầm tay hướng dẫn nhào đất, định tâm và vuốt dáng bình hoa hoặc chén trà theo ý thích.' },
      { time: '10:15', title: 'Vẽ hoa văn & tráng men', desc: 'Dùng bút lông phác thảo họa tiết hoa sen, men lam truyền thống và gửi lại lò nung để nhận thành phẩm.' },
    ],
    rules: [
      'Cắt móng tay gọn gàng để dễ nắn vuốt đất sét',
      'Hỏi thăm nghệ nhân trước khi chạm vào các phôi gốm mộc chưa nung',
    ],
    activities: ['Học nhào đất sét', 'Tự tạo hình bình gốm', 'Vẽ men và mang sản phẩm về'],
  },
  {
    id: 'exp-traque',
    title: 'Làng rau Trà Quế: Một ngày làm nông dân hữu cơ',
    theme: 'daily_life',
    regionCode: 'da_nang',
    regionName: 'Hội An (Quảng Nam)',
    vibe: 'Mộc mạc, Yên bình',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800',
    localTip: 'Mặc áo bà ba và gánh đôi thùng tưới nước bằng gáo dừa lúc chiều mát (sau 16:00). Cư dân ở đây luôn sẵn lòng chỉ bạn cách nhận biết 20 loại rau thơm.',
    duration: '2 giờ',
    price: '35.000₫',
    crowdLevel: '🌿 Rất yên tĩnh',
    bestTime: '15:30 – 17:30 chiều',
    longDescription:
      'Làng Trà Quế được vinh danh làng du lịch tốt nhất thế giới năm 2024 nhờ gìn giữ nguyên vẹn phương pháp canh tác rau sạch bằng rong vớt từ đầm Trà Quế. Mùi thơm ngát của các loại rau húng, tía tô, ngò gai lan tỏa trong không gian thanh sạch của làng quê miền Trung.',
    timelineSteps: [
      { time: '15:30', title: 'Gặp gỡ nông dân & thay áo bà ba', desc: 'Uống ly nước hạt é mát lành, lắng nghe nông dân kể về lịch sử trồng rau 300 năm của làng.' },
      { time: '16:00', title: 'Cuốc đất & bón rong đầm', desc: 'Cầm cuốc xới luống đất xốp, học cách rải rong đầm biển - bí quyết tạo nên vị thơm đặc trưng.' },
      { time: '16:45', title: 'Gánh nước tưới rau', desc: 'Thử sức với đôi thùng tưới nước bằng gáo dừa truyền thống với sự hướng dẫn của bà con.' },
    ],
    rules: [
      'Đi chân trần hoặc ủng nông dân để tránh dẫm nát luống rau',
      'Tôn trọng công sức lao động của người trồng rau',
    ],
    activities: ['Cuốc đất xới luống rau', 'Tưới nước gáo dừa', 'Thưởng thức nước chanh sả é Trà Quế'],
  },
  {
    id: 'exp-quangphucau',
    title: 'Làng tăm hương Quảng Phú Cầu: Sân phơi hương trăm tuổi',
    theme: 'craft_villages',
    regionCode: 'ha_noi',
    regionName: 'Hà Nội (Ứng Hòa)',
    vibe: 'Rực rỡ, Hoài niệm',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    localTip: 'Đến vào những ngày nắng đẹp khoảng 9:00 - 11:00 trưa khi những bó tăm hương xòe hoa nở đỏ thắm khắp các sân gạch đình làng.',
    duration: '2 giờ',
    price: 'Miễn phí / Tùy tâm',
    crowdLevel: '🌿 Làng quê yên ả',
    bestTime: '09:00 – 11:30 trưa',
    longDescription:
      'Hơn một thế kỷ gìn giữ nghề se hương thảo mộc cung cấp cho khắp các dịp lễ tết cả nước. Mỗi bó hương xòe tròn như những đóa hoa khổng lồ phơi dưới ánh nắng rực rỡ, mang theo hương quế, hồi, trầm thơm ngát dịu dàng.',
    timelineSteps: [
      { time: '09:00', title: 'Tham quan sân phơi hương làng cổ', desc: 'Chiêm ngưỡng hàng trăm vò tăm hương đỏ rực, vàng óng nở hoa trên sân đình rêu phong.' },
      { time: '09:45', title: 'Trò chuyện cùng thợ làm hương', desc: 'Xem nghệ nhân chẻ tăm tre, nhuộm màu tự nhiên và se bột hương bằng tay thoăn thoắt.' },
      { time: '10:30', title: 'Thử tự tay bó hương', desc: 'Tự tay buộc một bó hương thơm mang về làm quà thờ cúng gia tiên.' },
    ],
    rules: [
      'Bước cẩn thận qua các khoảng trống giữa các bó hương đang phơi',
      'Không hút thuốc hoặc mang vật dễ cháy trong khu vực xưởng hương',
    ],
    activities: ['Tìm hiểu bí quyết nhuộm hương thảo mộc', 'Trò chuyện cùng thợ se tăm hương lâu năm'],
  },
  {
    id: 'exp-talang',
    title: 'Bản Tà Lang - Giàn Bí: Sống cùng đồng bào Cơ Tu giữa núi rừng',
    theme: 'daily_life',
    regionCode: 'da_nang',
    regionName: 'Đà Nẵng (Hòa Bắc)',
    vibe: 'Hoang sơ, Bản sắc',
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800',
    localTip: 'Ở homestay cộng đồng Alang Nhu, ăn cơm lam nấu trong ống nứa và cá niên nướng đá suối cùng gia đình bà con bản địa.',
    duration: '1 ngày 1 đêm',
    price: '200.000₫ – 400.000₫',
    crowdLevel: '🌿 Hoàn toàn biệt lập',
    bestTime: 'Quanh năm (đẹp nhất mùa xuân - hè)',
    longDescription:
      'Nằm nép mình bên dòng sông Cu Đê và rặng núi Hải Vân hùng vĩ, Tà Lang - Giàn Bí là nơi đồng bào Cơ Tu gìn giữ nếp nhà Gươl truyền thống, điệu múa Tung tung Da dá và những bát cơm lam thơm lừng mùi khói bếp.',
    timelineSteps: [
      { time: '14:00', title: 'Nhận phòng nhà sàn mộc mạc', desc: 'Nghỉ ngơi tại homestay sàn gỗ của gia đình Alang Nhu giữa tiếng suối reo róc rách.' },
      { time: '15:30', title: 'Tắm suối & bắt cá niên', desc: 'Theo thanh niên trong bản đi bộ lội suối nước trong vắt, giăng lưới bắt cá suối đá.' },
      { time: '18:30', title: 'Bữa tối bên bếp lửa & rượu cần', desc: 'Thưởng thức cá niên nướng mọi, cơm lam dẻo quẹt muối ớt tiêu rừng và nghe già làng kể sử thi.' },
    ],
    rules: [
      'Xin phép già làng trước khi vào nhà Gươl thiêng liêng',
      'Giữ thái độ tôn trọng phong tục tâm linh của đồng bào',
    ],
    activities: ['Tắm suối đầu nguồn mát lạnh', 'Nghe già làng thổi khèn đinh tút', 'Ăn cơm lam cá suối nướng'],
  },
  {
    id: 'exp-chocon',
    title: 'Chợ Cồn: Lần theo dấu chân người địa phương ăn sập ngõ hẻm',
    theme: 'culinary',
    regionCode: 'da_nang',
    regionName: 'Đà Nẵng (Hải Châu)',
    vibe: 'Năng động, Dân dã',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    localTip: 'Đi sâu vào khu "Đình ẩm thực trong nhà", ghé hàng bún mắm nêm bà Bé và hàng ốc hút góc trái. Gọi một dĩa gỏi bò khô giòn cay đúng điệu.',
    duration: '1.5 giờ',
    price: '20.000₫ – 60.000₫',
    crowdLevel: '🌿 90% là người bản địa',
    bestTime: '15:00 – 18:30 chiều',
    longDescription:
      'Chợ Cồn là trái tim ẩm thực bình dân của người Đà Nẵng. Không biển hiệu hào nhoáng, các gánh hàng chè, bánh bèo, mì Quảng nêm nếm đậm đà cay nồng đúng khẩu vị miền Trung mà người dân địa phương gắn bó suốt bao thế hệ.',
    timelineSteps: [
      { time: '15:30', title: 'Khai vị bằng ốc hút & ram cuốn', desc: 'Ngồi ghế nhựa thưởng thức đĩa ốc hút cay nồng xả ớt nóng hổi thơm phức.' },
      { time: '16:15', title: 'Thưởng thức mì Quảng ếch đồng', desc: 'Tô mì sợi dày vàng óng nước nhưn đậm đà ăn kèm bánh tráng nướng giòn rụm.' },
      { time: '17:00', title: 'Tráng miệng chén chè sương sa hạt lựu', desc: 'Ly chè ngọt thanh với nước cốt dừa béo bùi xua tan cái nóng chiều miền Trung.' },
    ],
    rules: [
      'Chuẩn bị tiền lẻ để tiện thanh toán cho các cô bán hàng',
      'Hỏi mức độ cay trước nếu bạn không ăn được ớt chỉ thiên',
    ],
    activities: ['Thưởng thức mì Quảng ếch đồng', 'Ăn ốc hút cay nồng lá chanh', 'Uống sữa đậu nành lá dứa mát lành'],
  },
  {
    id: 'exp-duonglam',
    title: 'Làng cổ Đường Lâm: Đi lễ đình Mông Phụ & Uống trà nhà cổ 400 năm',
    theme: 'festivals_beliefs',
    regionCode: 'ha_noi',
    regionName: 'Hà Nội (Sơn Tây)',
    vibe: 'Cổ kính, Trầm mặc',
    image: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800',
    localTip: 'Ngồi uống nước chè xanh với kẹo mè xửng ở sân nhà cổ ông Hùng xây từ năm 1649, nghe cụ kể sự tích cổng làng đá ong và giếng cổ.',
    duration: '3 giờ',
    price: '20.000₫',
    crowdLevel: '🌿 Thanh bình, vắng vẻ',
    bestTime: '08:00 – 11:30 sáng',
    longDescription:
      'Đường Lâm là làng cổ đá ong duy nhất còn giữ nguyên vẹn cấu trúc đình - giếng nước - cây đa tại miền Bắc. Những con ngõ lát gạch nghiêng, tường đá ong sần sùi rêu phong đưa bạn trở về thế kỷ 17 giữa không gian yên bình đến lạ lùng.',
    timelineSteps: [
      { time: '08:30', title: 'Bước qua cổng làng Mông Phụ', desc: 'Ngắm cây đa cổ thụ trăm tuổi và chiếc cổng làng cổ kính lát gạch rêu phong.' },
      { time: '09:15', title: 'Thăm đình làng Mông Phụ', desc: 'Chiêm ngưỡng kiến trúc đình làng tiêu biểu thế kỷ 16 và các hoành phi cổ kính.' },
      { time: '10:00', title: 'Uống trà tại nhà cổ gần 400 năm', desc: 'Trò chuyện cùng cụ Hùng, nếm thử kẹo dồi, kẹo lạc và bát tương nếp nồng đượm.' },
    ],
    rules: [
      'Đi nhẹ, nói khẽ khi đi qua các con ngõ yên tĩnh của dân cư',
      'Xin phép trước khi bước vào gian thờ của các ngôi nhà cổ',
    ],
    activities: ['Thăm đình Mông Phụ linh thiêng', 'Dạo quanh các con ngõ tường đá ong rêu phong', 'Thử làm tương nếp Đường Lâm'],
  },
  {
    id: 'exp-giongcafe',
    title: 'Gióng Café Phố Hội: Tự tay rang xay cà phê mộc mạc bên hè',
    theme: 'culinary',
    regionCode: 'da_nang',
    regionName: 'Hội An (Phố Cổ)',
    vibe: 'Chậm rãi, Mộc mạc',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    localTip: 'Hãy xin chủ quán vào khu rang hạt sau nhà để tự tay đảo mẻ Robusta mộc thơm lừng và nếm thử ly cà phê phin đậm đà nguyên chất.',
    duration: '1 giờ',
    price: '30.000₫ – 50.000₫',
    crowdLevel: '🌿 Không gian yên ắng',
    bestTime: '07:00 – 09:30 sáng',
    longDescription:
      'Nằm ẩn mình trên con phố cổ, Gióng giữ nguyên nếp pha cà phê phin truyền thống với hạt cà phê mộc rang tại chỗ bằng chảo gang. Một buổi sáng chậm rãi ngắm nắng sớm xuyên qua giàn hoa giấy bên ly cà phê đậm chất Hội An.',
    timelineSteps: [
      { time: '07:30', title: 'Chọn hạt cà phê mộc', desc: 'Tìm hiểu về các giống cà phê thuần Việt: Robusta Gia Lai và Arabica Cầu Đất.' },
      { time: '08:00', title: 'Trải nghiệm rang tay trên chảo gang', desc: 'Cùng chủ quán nghe tiếng nổ lách tách của hạt cà phê chuyển màu nâu thơm ngát.' },
      { time: '08:30', title: 'Thưởng thức từng giọt cà phê phin', desc: 'Ngồi ghế gỗ hiên hè ngắm nhịp sống sớm của người dân phố cổ.' },
    ],
    rules: [
      'Không dùng điện thoại mở loa ngoài để giữ không gian yên tĩnh',
    ],
    activities: ['Trải nghiệm rang hạt bằng chảo gang', 'Học cách ủ bột cà phê nhỏ giọt', 'Ngồi ngắm mái ngói âm dương'],
  },
  {
    id: 'exp-kimngan',
    title: 'Đình Kim Ngân & Ca Trù Phố Cổ: Tìm hiểu nghi lễ đình làng xưa',
    theme: 'festivals_beliefs',
    regionCode: 'ha_noi',
    regionName: 'Hà Nội (Hoàn Kiếm)',
    vibe: 'Cổ kính, Linh thiêng',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    localTip: 'Đình thờ ông tổ nghề kim hoàn Bạc Bạc. Ghé vào các tối cuối tuần để nghe câu lạc bộ Ca Trù Hà Nội hát mộc giữa hương trầm thoang thoảng.',
    duration: '1.5 giờ',
    price: 'Tùy tâm',
    crowdLevel: '🌿 Ấm cúng, không xô bồ',
    bestTime: '19:30 – 21:00 tối',
    longDescription:
      'Nằm giữa phố Hàng Bạc tấp nập, đình Kim Ngân là chốn tĩnh lặng hiếm có lưu giữ linh hồn của phường nghề kim hoàn Thăng Long. Đây là nơi diễn ra các đêm biểu diễn ca trù mộc mạc - di sản văn hóa phi vật thể của nhân loại.',
    timelineSteps: [
      { time: '19:30', title: 'Vào đình thắp nén nhang trầm', desc: 'Chiêm ngưỡng kiến trúc chạm khắc rồng phượng tinh xảo thời Hậu Lê.' },
      { time: '20:00', title: 'Nghe ca trù mộc truyền thống', desc: 'Lắng nghe tiếng đàn đáy trầm đục, nhịp phách giòn tan và giọng hát ngọt ngào của đào nương.' },
    ],
    rules: [
      'Trang phục lịch sự kín đáo khi bước vào chốn tôn nghiêm',
    ],
    activities: ['Chiêm ngưỡng kiến trúc đình cổ thế kỷ 15', 'Tìm hiểu lịch sử các phường nghề 36 phố phường'],
  },
];

// ─── Dữ liệu Vùng theo Vibe cảm xúc ──────────────────────────────────────────

const REGION_VIBES: RegionVibeCard[] = [
  {
    id: 'rv-hue',
    regionName: 'Huế',
    vibeKey: 'gentle_ancient',
    vibeLabel: 'Nhẹ nhàng, cổ kính',
    image: 'https://images.unsplash.com/photo-1594311947147-f5de0ec37c88?w=800',
    highlightExperienceId: 'exp-duonglam',
    suggestedActivities: [
      'Nghe ca Huế trên thuyền mộc sông Hương lúc hoàng hôn',
      'Thăm nhà vườn An Hiên, uống trà sen cùng gia chủ',
      'Thưởng thức chè hẻm 20 món trong ngõ nhỏ Hùng Vương',
      'Đạp xe qua cầu ngói Thanh Toàn ngắm đồng lúa chín',
    ],
    description: 'Cố đô mang nhịp sống khoan thai, trầm mặc. Nơi mỗi mái đình, nhà rường đều ẩn chứa câu chuyện cung đình và nếp sinh hoạt nho nhã ngàn đời.',
    spotsCount: 18,
  },
  {
    id: 'rv-danang',
    regionName: 'Đà Nẵng & Hội An',
    vibeKey: 'energetic_modern',
    vibeLabel: 'Năng động, hiện đại',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    highlightExperienceId: 'exp-chocon',
    suggestedActivities: [
      'Lướt sóng sớm và chạy bộ ngắm bình minh biển Non Nước',
      'Ăn vặt chợ đêm Helio, thưởng thức âm nhạc acoustic ngoài trời',
      'Café & Cocktail rooftop ngắm sông Hàn về đêm (Bar Đồ Yêu)',
      'Chạy xe máy vượt đèo Hải Vân đón gió biển Đông',
    ],
    description: 'Thành phố trẻ trung, giao hòa tuyệt đối giữa biển xanh ngút ngàn và đời sống hiện đại, năng động tràn đầy năng lượng tích cực.',
    spotsCount: 42,
  },
  {
    id: 'rv-taynguyen',
    regionName: 'Tây Nguyên',
    vibeKey: 'wild_authentic',
    vibeLabel: 'Hoang sơ, bản sắc',
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800',
    highlightExperienceId: 'exp-talang',
    suggestedActivities: [
      'Lắng nghe không gian văn hóa cồng chiêng bên đống lửa buôn làng',
      'Ở nhà dài truyền thống sàn gỗ của người Ê Đê / Ba Na',
      'Thăm đồi cà phê bạt ngàn đất đỏ bazan mùa hoa trắng nở',
      'Đi thuyền độc mộc trên hồ Lắk nguyên sơ',
    ],
    description: 'Vùng đất đại ngàn hùng vĩ với tiếng cồng chiêng vang vọng, hương cà phê nồng nàn và tấm lòng hiếu khách chân chất của đồng bào bản địa.',
    spotsCount: 15,
  },
  {
    id: 'rv-mientay',
    regionName: 'Miền Tây sông nước',
    vibeKey: 'slow_rustic',
    vibeLabel: 'Chậm rãi, mộc mạc',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
    highlightExperienceId: 'exp-spotlight-mientay',
    suggestedActivities: [
      'Đi chợ nổi Cái Răng lúc 5:00 sáng ăn tô bún nước lèo nóng hổi',
      'Ở nhà bè Châu Đốc, kéo lưới bắt cá và tự nấu bữa cơm trưa',
      'Len lỏi ghe xuồng hái trái cây chín mọng miệt vườn Phong Điền',
      'Ngồi hiên nhà nghe đờn ca tài tử cải lương mộc mạc',
    ],
    description: 'Xứ sở phù sa trù phú với tính cách hào sảng, phóng khoáng. Nơi cuộc sống gắn liền với nhịp con nước lớn ròng và sự bình yên vô tận.',
    spotsCount: 24,
  },
  {
    id: 'rv-hagiang',
    regionName: 'Hà Giang & Tây Bắc',
    vibeKey: 'adventurous',
    vibeLabel: 'Phiêu lưu, khám phá',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
    highlightExperienceId: 'exp-quangphucau',
    suggestedActivities: [
      'Cầm lái xe máy chạy đèo Mã Pí Lèng ngắm hẻm vực Tu Sản sâu thẳm',
      'Hòa vào chợ phiên vùng cao Mèo Vạc uống rượu ngô, ăn thắng cố',
      'Ngủ homestay nhà trình tường bản Lô Lô Chải dưới chân cột cờ',
      'Săn biển mây bồng bềnh và ruộng bậc thang ngút mắt Hoàng Su Phì',
    ],
    description: 'Thiên đường của những cung đường đèo kỳ vĩ, hoa tam giác mạch và sắc màu thổ cẩm rực rỡ của các dân tộc anh em vùng cao Tây Bắc.',
    spotsCount: 29,
  },
];

export default function LocalExperienceScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();

  const [activeTab, setActiveTab] = useState<LocalTabMode>('theme');
  const [selectedTheme, setSelectedTheme] = useState<ThemeCategory>('all');
  const [selectedVibe, setSelectedVibe] = useState<VibeCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [detailModalItem, setDetailModalItem] = useState<LocalExperienceItem | null>(null);
  const [addedModalItem, setAddedModalItem] = useState<LocalExperienceItem | null>(null);
  const [savedFavorites, setSavedFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string) => {
    setSavedFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Detail Modal Parallax & Shrink Animations
  const modalScrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (detailModalItem) {
      modalScrollY.setValue(0);
    }
  }, [detailModalItem]);

  const HERO_MAX = 280;
  const HERO_MIN = 60 + (insets.top > 0 ? insets.top : 14);
  const SCROLL_DIST = HERO_MAX - HERO_MIN;

  const heroHeight = modalScrollY.interpolate({
    inputRange: [0, SCROLL_DIST],
    outputRange: [HERO_MAX, HERO_MIN],
    extrapolate: 'clamp',
  });

  const heroScale = modalScrollY.interpolate({
    inputRange: [-100, 0, SCROLL_DIST],
    outputRange: [1.3, 1, 0.95],
    extrapolate: 'clamp',
  });

  const heroTranslateY = modalScrollY.interpolate({
    inputRange: [0, SCROLL_DIST],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  const heroInfoOpacity = modalScrollY.interpolate({
    inputRange: [0, SCROLL_DIST * 0.45],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const navBgOpacity = modalScrollY.interpolate({
    inputRange: [SCROLL_DIST * 0.35, SCROLL_DIST],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const navTitleOpacity = modalScrollY.interpolate({
    inputRange: [SCROLL_DIST * 0.55, SCROLL_DIST],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Filter experiences by theme and search text
  const filteredExperiences = useMemo(() => {
    return LOCAL_EXPERIENCES.filter((item) => {
      const matchTheme = selectedTheme === 'all' || item.theme === selectedTheme;
      const matchQuery =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.localTip.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTheme && matchQuery;
    });
  }, [selectedTheme, searchQuery]);

  // Filter region vibes
  const filteredRegions = useMemo(() => {
    if (selectedVibe === 'all') return REGION_VIBES;
    return REGION_VIBES.filter((r) => r.vibeKey === selectedVibe);
  }, [selectedVibe]);

  const themesList: { key: ThemeCategory; label: string; icon: string }[] = [
    { key: 'all', label: t('themeAll'), icon: 'sparkles' },
    { key: 'daily_life', label: t('themeDailyLife'), icon: 'boat-outline' },
    { key: 'craft_villages', label: t('themeCraft'), icon: 'hammer-outline' },
    { key: 'culinary', label: t('themeCulinary'), icon: 'restaurant-outline' },
    { key: 'festivals_beliefs', label: t('themeFestivals'), icon: 'flame-outline' },
  ];

  const vibesList: { key: VibeCategory; label: string }[] = [
    { key: 'all', label: t('vibeAll') },
    { key: 'gentle_ancient', label: 'Cổ kính (Huế)' },
    { key: 'energetic_modern', label: 'Năng động (Đà Nẵng)' },
    { key: 'wild_authentic', label: 'Hoang sơ (Tây Nguyên)' },
    { key: 'slow_rustic', label: 'Mộc mạc (Miền Tây)' },
    { key: 'adventurous', label: 'Phiêu lưu (Hà Giang)' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Compact Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={colors.nomad.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>{t('localScreenTitle')}</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {t('localScreenSub')}
            </Text>
          </View>
        </View>

        {/* ── Search Input (Compact) ── */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={15} color="#8A7060" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('localSearchPlaceholder')}
            placeholderTextColor="#8A7060"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#8A7060" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Mode Switcher (1 dòng gọn gàng, không bị rớt dòng) ── */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.switcherBtn, activeTab === 'theme' && styles.switcherBtnActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('theme')}
          >
            <Ionicons
              name="grid-outline"
              size={13}
              color={activeTab === 'theme' ? colors.nomad.onPrimary : colors.nomad.onSurfaceVariant}
            />
            <Text
              style={[styles.switcherText, activeTab === 'theme' && styles.switcherTextActive]}
              numberOfLines={1}
            >
              {t('localTabTheme')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switcherBtn, activeTab === 'vibe' && styles.switcherBtnActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('vibe')}
          >
            <Ionicons
              name="compass-outline"
              size={13}
              color={activeTab === 'vibe' ? colors.nomad.onPrimary : colors.nomad.onSurfaceVariant}
            />
            <Text
              style={[styles.switcherText, activeTab === 'vibe' && styles.switcherTextActive]}
              numberOfLines={1}
            >
              {t('localTabVibe')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'theme' ? (
          // ═════════════════════════════════════════════════════════════════
          // CHẾ ĐỘ 1: THEO CHỦ ĐỀ
          // ═════════════════════════════════════════════════════════════════
          <View>
            {/* Horizontal Theme Filter Chips (Compact) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.themeChipsContainer}
            >
              {themesList.map((th) => {
                const isActive = selectedTheme === th.key;
                return (
                  <TouchableOpacity
                    key={th.key}
                    style={[styles.themeChip, isActive && styles.themeChipActive]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTheme(th.key)}
                  >
                    <Ionicons
                      name={th.icon as any}
                      size={13}
                      color={isActive ? colors.nomad.onPrimary : colors.nomad.onSurfaceVariant}
                    />
                    <Text
                      style={[styles.themeChipText, isActive && styles.themeChipTextActive]}
                    >
                      {th.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Spotlight Hero Card (Miền Tây sông nước) */}
            {selectedTheme === 'all' || selectedTheme === 'daily_life' ? (
              <TouchableOpacity
                style={styles.spotlightCard}
                activeOpacity={0.92}
                onPress={() => setDetailModalItem(LOCAL_EXPERIENCES[0])}
              >
                <ExpoImage
                  source={{ uri: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800' }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.85)']}
                  locations={[0.2, 0.95]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.spotlightContent}>
                  <View style={styles.spotlightTagRow}>
                    <View style={styles.spotlightBadge}>
                      <Text style={styles.spotlightBadgeText}>✨ {t('localSpotlightTag')}</Text>
                    </View>
                    <View style={styles.spotlightPeaceBadge}>
                      <Text style={styles.spotlightPeaceText}>🌿 Vắng người</Text>
                    </View>
                  </View>

                  <Text style={styles.spotlightTitle}>{t('localSpotlightTitle')}</Text>
                  <Text style={styles.spotlightSub}>{t('localSpotlightSub')}</Text>
                  <Text style={styles.spotlightDesc} numberOfLines={2}>
                    {t('localSpotlightDesc')}
                  </Text>

                  <View style={styles.spotlightActionRow}>
                    <TouchableOpacity
                      style={styles.spotlightBtn}
                      activeOpacity={0.85}
                      onPress={() => setAddedModalItem(LOCAL_EXPERIENCES[0])}
                    >
                      <Ionicons name="add-circle-outline" size={15} color="#FFFFFF" />
                      <Text style={styles.spotlightBtnText} numberOfLines={1}>{t('btnAddToTrip')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.spotlightDetailBtn}
                      activeOpacity={0.85}
                      onPress={() => setDetailModalItem(LOCAL_EXPERIENCES[0])}
                    >
                      <Text style={styles.spotlightDetailBtnText} numberOfLines={1}>{t('btnExploreDetail')}</Text>
                      <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ) : null}

            {/* Danh sách địa điểm local theo chủ đề */}
            <View style={styles.listHeaderRow}>
              <Text style={styles.listSectionTitle}>
                {selectedTheme === 'all'
                  ? 'Tất cả trải nghiệm địa phương'
                  : themesList.find((x) => x.key === selectedTheme)?.label}
              </Text>
              <Text style={styles.listCountText}>({filteredExperiences.length})</Text>
            </View>

            {filteredExperiences.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="search" size={32} color="#C4C8B7" />
                <Text style={styles.emptyText}>{t('localEmptyText')}</Text>
              </View>
            ) : (
              filteredExperiences.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.experienceCard}
                  activeOpacity={0.92}
                  onPress={() => setDetailModalItem(item)}
                >
                  <View style={styles.expImageWrap}>
                    <ExpoImage
                      source={{ uri: item.image }}
                      style={styles.expImage}
                      contentFit="cover"
                      transition={150}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.expBadgeRow}>
                      <View style={styles.expCrowdBadge}>
                        <Text style={styles.expCrowdText}>{item.crowdLevel}</Text>
                      </View>
                      <View style={styles.expVibeBadge}>
                        <Text style={styles.expVibeText}>{item.vibe}</Text>
                      </View>
                    </View>
                    <View style={styles.expImageBottom}>
                      <Text style={styles.expRegionText}>📍 {item.regionName}</Text>
                    </View>
                  </View>

                  <View style={styles.expBody}>
                    <Text style={styles.expTitle}>{item.title}</Text>

                    {/* Mẹo Local Box */}
                    <View style={styles.localTipBox}>
                      <View style={styles.localTipHeader}>
                        <Ionicons name="chatbubble-ellipses" size={13} color={colors.nomad.primary} />
                        <Text style={styles.localTipTitle}>{t('badgeLocalTip')}:</Text>
                      </View>
                      <Text style={styles.localTipContent}>"{item.localTip}"</Text>
                    </View>

                    {/* Meta info */}
                    <View style={styles.expMetaRow}>
                      <View style={styles.expMetaItem}>
                        <Ionicons name="time-outline" size={13} color="#8A7060" />
                        <Text style={styles.expMetaText}>{item.duration}</Text>
                      </View>
                      <View style={styles.expMetaItem}>
                        <Ionicons name="pricetag-outline" size={13} color="#8A7060" />
                        <Text style={styles.expMetaText}>{item.price}</Text>
                      </View>
                    </View>

                    {/* Action buttons */}
                    <View style={styles.expActionRow}>
                      <TouchableOpacity
                        style={styles.addToTripBtn}
                        activeOpacity={0.8}
                        onPress={() => setAddedModalItem(item)}
                      >
                        <Ionicons name="calendar-outline" size={14} color={colors.nomad.primary} />
                        <Text style={styles.addToTripBtnText} numberOfLines={1}>{t('btnAddToTrip')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.detailBtn}
                        activeOpacity={0.8}
                        onPress={() => setDetailModalItem(item)}
                      >
                        <Text style={styles.detailBtnText} numberOfLines={1}>{t('btnExploreDetail')}</Text>
                        <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          // ═════════════════════════════════════════════════════════════════
          // CHẾ ĐỘ 2: THEO VIBE VÙNG MIỀN
          // ═════════════════════════════════════════════════════════════════
          <View>
            {/* Horizontal Vibe Filter Chips (Compact) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vibeChipsContainer}
            >
              {vibesList.map((vb) => {
                const isActive = selectedVibe === vb.key;
                return (
                  <TouchableOpacity
                    key={vb.key}
                    style={[styles.vibeChip, isActive && styles.vibeChipActive]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedVibe(vb.key)}
                  >
                    <Text
                      style={[styles.vibeChipText, isActive && styles.vibeChipTextActive]}
                    >
                      {vb.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.vibeHeaderWrap}>
              <Text style={styles.vibeSectionTitle}>Mỗi vùng một nét "vibe" riêng biệt</Text>
              <Text style={styles.vibeSectionSub}>
                Chọn vibe tâm trạng bạn tìm kiếm, gợi ý nơi trải nghiệm sâu sắc nhất
              </Text>
            </View>

            {/* Region Cards */}
            {filteredRegions.map((region) => {
              const matchedExp = LOCAL_EXPERIENCES.find((e) => e.id === region.highlightExperienceId) || LOCAL_EXPERIENCES[0];
              return (
                <View key={region.id} style={styles.regionCard}>
                  <View style={styles.regionHeroWrap}>
                    <ExpoImage
                      source={{ uri: region.image }}
                      style={styles.regionHeroImg}
                      contentFit="cover"
                      transition={150}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.85)']}
                      locations={[0.2, 0.95]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.regionHeroContent}>
                      <View style={styles.regionVibeTag}>
                        <Ionicons name="color-wand-outline" size={11} color="#FFFFFF" />
                        <Text style={styles.regionVibeTagText}>{region.vibeLabel}</Text>
                      </View>
                      <Text style={styles.regionNameTitle}>{region.regionName}</Text>
                      <Text style={styles.regionDesc} numberOfLines={2}>
                        {region.description}
                      </Text>
                    </View>
                  </View>

                  {/* Hoạt động gợi ý */}
                  <View style={styles.regionBody}>
                    <Text style={styles.suggestTitle}>Hoạt động bản địa gợi ý:</Text>
                    <View style={styles.activityList}>
                      {region.suggestedActivities.map((act, index) => (
                        <View key={index} style={styles.activityItem}>
                          <View style={styles.actDot}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.nomad.primary} />
                          </View>
                          <Text style={styles.actText}>{act}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={styles.exploreRegionBtn}
                      activeOpacity={0.85}
                      onPress={() => setDetailModalItem(matchedExp)}
                    >
                      <Text style={styles.exploreRegionBtnText} numberOfLines={1} ellipsizeMode="tail">
                        Khám phá {region.regionName}
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL CHI TIẾT TRẢI NGHIỆM ĐỊA PHƯƠNG (FULL DETAIL VIEW)
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={detailModalItem != null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailModalItem(null)}
      >
        {detailModalItem != null && (
          <View style={styles.detailContainer}>
            {/* ── Collapsing Hero Image (Thu nhỏ mượt mà khi cuộn) ── */}
            <Animated.View style={[styles.detailHeroWrap, { height: heroHeight }]}>
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    transform: [{ scale: heroScale }, { translateY: heroTranslateY }],
                  },
                ]}
              >
                <ExpoImage
                  source={{ uri: detailModalItem.image }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              </Animated.View>
              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.85)']}
                locations={[0, 0.35, 1]}
                style={StyleSheet.absoluteFill}
              />

              {/* Bottom hero badge info (mờ dần khi cuộn để không đè lên header) */}
              <Animated.View style={[styles.detailHeroInfo, { opacity: heroInfoOpacity }]}>
                <View style={styles.detailBadgeRow}>
                  <View style={styles.detailCrowdBadge}>
                    <Text style={styles.detailCrowdText} numberOfLines={1}>
                      {detailModalItem.crowdLevel}
                    </Text>
                  </View>
                  <View style={styles.detailVibeBadge}>
                    <Text style={styles.detailVibeText} numberOfLines={1}>
                      {detailModalItem.vibe}
                    </Text>
                  </View>
                </View>
                <Text style={styles.detailHeroTitle} numberOfLines={2} ellipsizeMode="tail">
                  {detailModalItem.title}
                </Text>
                <Text style={styles.detailHeroRegion} numberOfLines={1}>
                  📍 {detailModalItem.regionName}
                </Text>
              </Animated.View>
            </Animated.View>

            {/* ── Sticky Top Navigation Bar (Nằm cố định trên cùng, KHÔNG BAO GIỜ bị đè nút) ── */}
            <View
              style={[
                styles.detailStickyNav,
                {
                  height: HERO_MIN,
                  paddingTop: insets.top > 0 ? insets.top : 12,
                },
              ]}
              pointerEvents="box-none"
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  styles.detailStickyNavBg,
                  { opacity: navBgOpacity },
                ]}
              />
              <View style={styles.detailStickyNavContent}>
                <TouchableOpacity
                  style={styles.detailRoundBtn}
                  activeOpacity={0.8}
                  onPress={() => setDetailModalItem(null)}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Tiêu đề thu nhỏ trên thanh bar xuất hiện khi cuộn xuống */}
                <Animated.Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.detailNavStickyTitle, { opacity: navTitleOpacity }]}
                >
                  {detailModalItem.title}
                </Animated.Text>

                <TouchableOpacity
                  style={styles.detailRoundBtn}
                  activeOpacity={0.8}
                  onPress={() => toggleFavorite(detailModalItem.id)}
                >
                  <Ionicons
                    name={savedFavorites[detailModalItem.id] ? 'heart' : 'heart-outline'}
                    size={20}
                    color={savedFavorites[detailModalItem.id] ? '#FF4D6D' : '#FFFFFF'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Scrollable Detail Body */}
            <Animated.ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.detailScrollBody,
                { paddingTop: HERO_MAX + 14, paddingBottom: (insets.bottom > 0 ? insets.bottom : 16) + 80 },
              ]}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: modalScrollY } } }],
                { useNativeDriver: false }
              )}
            >
              {/* Quick stats row */}
              <View style={styles.detailStatsRow}>
                <View style={styles.detailStatBox}>
                  <Ionicons name="time-outline" size={18} color={colors.nomad.primary} />
                  <Text style={styles.detailStatLabel} numberOfLines={1}>Thời lượng</Text>
                  <Text style={styles.detailStatValue} numberOfLines={1}>{detailModalItem.duration}</Text>
                </View>

                <View style={styles.detailStatDivider} />

                <View style={styles.detailStatBox}>
                  <Ionicons name="pricetag-outline" size={18} color={colors.nomad.primary} />
                  <Text style={styles.detailStatLabel} numberOfLines={1}>Chi phí</Text>
                  <Text style={styles.detailStatValue} numberOfLines={1}>{detailModalItem.price}</Text>
                </View>

                <View style={styles.detailStatDivider} />

                <View style={styles.detailStatBox}>
                  <Ionicons name="sunny-outline" size={18} color={colors.nomad.primary} />
                  <Text style={styles.detailStatLabel} numberOfLines={1}>Giờ đẹp nhất</Text>
                  <Text style={styles.detailStatValue} numberOfLines={1}>{detailModalItem.bestTime}</Text>
                </View>
              </View>

              {/* Mẹo người bản xứ callout */}
              <View style={styles.detailLocalTipBox}>
                <View style={styles.detailLocalTipHead}>
                  <Ionicons name="chatbubble-ellipses" size={16} color={colors.nomad.primary} />
                  <Text style={styles.detailLocalTipHeadText}>MẸO TỪ NGƯỜI ĐỊA PHƯƠNG</Text>
                </View>
                <Text style={styles.detailLocalTipText}>"{detailModalItem.localTip}"</Text>
              </View>

              {/* Giới thiệu trải nghiệm */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Về trải nghiệm này</Text>
                <Text style={styles.detailLongDesc}>{detailModalItem.longDescription}</Text>
              </View>

              {/* Lịch trình gợi ý theo từng bước */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Lịch trình trải nghiệm gợi ý</Text>
                <View style={styles.timelineList}>
                  {detailModalItem.timelineSteps.map((step, idx) => (
                    <View key={idx} style={styles.timelineRow}>
                      <View style={styles.timelineIndicator}>
                        <View style={styles.timelineDot} />
                        {idx < detailModalItem.timelineSteps.length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <View style={styles.timelineHeader}>
                          <Text style={styles.timelineTime}>{step.time}</Text>
                          <Text style={styles.timelineStepTitle}>{step.title}</Text>
                        </View>
                        <Text style={styles.timelineDesc}>{step.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Hoạt động chính */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Hoạt động nổi bật</Text>
                <View style={styles.detailActsWrap}>
                  {detailModalItem.activities.map((act, i) => (
                    <View key={i} style={styles.detailActItem}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.nomad.primary} />
                      <Text style={styles.detailActText}>{act}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Những lưu ý của người dân */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Lưu ý từ người dân bản xứ</Text>
                <View style={styles.rulesList}>
                  {detailModalItem.rules.map((rule, idx) => (
                    <View key={idx} style={styles.ruleItem}>
                      <Ionicons name="information-circle-outline" size={16} color="#8A7060" />
                      <Text style={styles.ruleText}>{rule}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ height: 90 }} />
            </Animated.ScrollView>

            {/* Bottom sticky action bar */}
            <View style={[styles.detailBottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 14 }]}>
              <View style={styles.detailPriceWrap}>
                <Text style={styles.detailPriceLabel}>Chi phí dự kiến</Text>
                <Text style={styles.detailPriceValue}>{detailModalItem.price}</Text>
              </View>

              <TouchableOpacity
                style={styles.detailMainBtn}
                activeOpacity={0.88}
                onPress={() => {
                  const item = detailModalItem;
                  setDetailModalItem(null);
                  setAddedModalItem(item);
                }}
              >
                <Ionicons name="calendar" size={16} color="#FFFFFF" />
                <Text style={styles.detailMainBtnText}>Thêm vào chuyến đi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* ── Modal Phản hồi Thêm vào chuyến đi ── */}
      <Modal
        visible={addedModalItem != null}
        transparent
        animationType="fade"
        onRequestClose={() => setAddedModalItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="checkmark-circle" size={42} color={colors.nomad.primary} />
            </View>
            <Text style={styles.modalTitle}>Sẵn sàng trải nghiệm!</Text>
            <Text style={styles.modalMessage}>
              Đã lưu "{addedModalItem?.title}" vào danh sách trải nghiệm bản địa của bạn.
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setAddedModalItem(null)}
              >
                <Text style={styles.modalCloseBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalGoTripBtn}
                onPress={() => {
                  setAddedModalItem(null);
                  router.push('/(app)/workspace');
                }}
              >
                <Text style={styles.modalGoTripBtnText}>Xem lịch trình</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.nomad.background,
  },
  header: {
    backgroundColor: colors.nomad.surface,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.nomad.outlineVariant,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.nomad.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitles: {
    flex: 1,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.nomad.secondaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.nomad.primary,
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.nomad.onSurface,
  },
  headerSub: {
    fontSize: 11,
    color: colors.nomad.onSurfaceVariant,
    marginTop: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.nomad.surfaceContainerLow,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 34,
    borderWidth: 1,
    borderColor: colors.nomad.outlineVariant,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: colors.nomad.onSurface,
    marginLeft: 6,
    paddingVertical: 0,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.nomad.surfaceContainer,
    borderRadius: 8,
    padding: 2,
  },
  switcherBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  switcherBtnActive: {
    backgroundColor: colors.nomad.primary,
  },
  switcherText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.nomad.onSurfaceVariant,
  },
  switcherTextActive: {
    color: colors.nomad.onPrimary,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // ── Theme Chips ──
  themeChipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.nomad.surface,
    borderWidth: 1,
    borderColor: colors.nomad.outlineVariant,
  },
  themeChipActive: {
    backgroundColor: colors.nomad.primary,
    borderColor: colors.nomad.primary,
  },
  themeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.nomad.onSurfaceVariant,
  },
  themeChipTextActive: {
    color: colors.nomad.onPrimary,
  },

  // ── Spotlight Card ──
  spotlightCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    height: 215,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'flex-end',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  spotlightContent: {
    padding: 13,
  },
  spotlightTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  spotlightBadge: {
    backgroundColor: colors.primary400,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  spotlightBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  spotlightPeaceBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  spotlightPeaceText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spotlightTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  spotlightSub: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#F5E4D6',
    marginBottom: 4,
  },
  spotlightDesc: {
    fontSize: 10.5,
    color: '#E0E0E0',
    lineHeight: 14,
    marginBottom: 8,
  },
  spotlightActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spotlightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.nomad.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  spotlightBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spotlightDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  spotlightDetailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Experience Card ──
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 5,
  },
  listSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.nomad.onSurface,
  },
  listCountText: {
    fontSize: 12,
    color: colors.nomad.outline,
    fontWeight: '600',
  },
  experienceCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: colors.nomad.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.nomad.outlineVariant,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  expImageWrap: {
    height: 140,
    position: 'relative',
  },
  expImage: {
    width: '100%',
    height: '100%',
  },
  expBadgeRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expCrowdBadge: {
    backgroundColor: 'rgba(69, 97, 27, 0.9)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  expCrowdText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expVibeBadge: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  expVibeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expImageBottom: {
    position: 'absolute',
    bottom: 6,
    left: 10,
  },
  expRegionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expBody: {
    padding: 12,
  },
  expTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.nomad.onSurface,
    lineHeight: 20,
    marginBottom: 8,
  },
  localTipBox: {
    backgroundColor: colors.nomad.surfaceContainerLow,
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.nomad.primary,
    marginBottom: 10,
  },
  localTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  localTipTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.nomad.primary,
    textTransform: 'uppercase',
  },
  localTipContent: {
    fontSize: 11,
    color: colors.nomad.onSurfaceVariant,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  expMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  expMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expMetaText: {
    fontSize: 11,
    color: '#8A7060',
    fontWeight: '500',
  },
  expActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addToTripBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.nomad.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.nomad.outlineVariant,
  },
  addToTripBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.nomad.primary,
  },
  detailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.nomad.primary,
  },
  detailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Vibe Mode ──
  vibeChipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  vibeChip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.nomad.surface,
    borderWidth: 1,
    borderColor: colors.nomad.outlineVariant,
  },
  vibeChipActive: {
    backgroundColor: colors.nomad.primary,
    borderColor: colors.nomad.primary,
  },
  vibeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.nomad.onSurfaceVariant,
  },
  vibeChipTextActive: {
    color: colors.nomad.onPrimary,
  },
  vibeHeaderWrap: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
  },
  vibeSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.nomad.onSurface,
    marginBottom: 3,
  },
  vibeSectionSub: {
    fontSize: 11,
    color: colors.nomad.onSurfaceVariant,
    lineHeight: 16,
  },
  regionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.nomad.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.nomad.outlineVariant,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  regionHeroWrap: {
    height: 145,
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 12,
  },
  regionHeroImg: {
    ...StyleSheet.absoluteFill as any,
  },
  regionHeroContent: {
    position: 'relative',
    zIndex: 2,
  },
  regionVibeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary600,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  regionVibeTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  regionNameTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  regionDesc: {
    fontSize: 10.5,
    color: '#F0F0F0',
    lineHeight: 15,
  },
  regionBody: {
    padding: 12,
  },
  suggestTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.nomad.onSurface,
    marginBottom: 6,
  },
  activityList: {
    gap: 6,
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  actDot: {
    marginTop: 2,
  },
  actText: {
    flex: 1,
    fontSize: 12,
    color: colors.nomad.onSurfaceVariant,
    lineHeight: 18,
  },
  exploreRegionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.nomad.primary,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  exploreRegionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },

  emptyWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 12,
    color: colors.nomad.outline,
    textAlign: 'center',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // DETAIL MODAL STYLES
  // ═════════════════════════════════════════════════════════════════════════
  detailContainer: {
    flex: 1,
    backgroundColor: colors.nomad.background,
  },
  detailHeroWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 10,
    justifyContent: 'flex-end',
  },
  detailStickyNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  detailStickyNavBg: {
    backgroundColor: 'rgba(32, 37, 27, 0.95)',
  },
  detailStickyNavContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  detailNavStickyTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 12,
    textAlign: 'center',
  },
  detailRoundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeroInfo: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 2,
  },
  detailBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  detailCrowdBadge: {
    backgroundColor: colors.nomad.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detailCrowdText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailVibeBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detailVibeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 2,
  },
  detailHeroRegion: {
    fontSize: 12,
    color: '#E0E0E0',
    fontWeight: '600',
  },
  detailScrollBody: {
    padding: 16,
  },
  detailStatsRow: {
    flexDirection: 'row',
    backgroundColor: colors.nomad.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.nomad.outlineVariant,
    marginBottom: 16,
    alignItems: 'center',
  },
  detailStatBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  detailStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.nomad.outlineVariant,
  },
  detailStatLabel: {
    fontSize: 10,
    color: colors.nomad.outline,
    fontWeight: '600',
  },
  detailStatValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.nomad.onSurface,
    textAlign: 'center',
  },
  detailLocalTipBox: {
    backgroundColor: colors.nomad.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.nomad.primary,
    marginBottom: 16,
  },
  detailLocalTipHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailLocalTipHeadText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.nomad.primary,
    letterSpacing: 0.5,
  },
  detailLocalTipText: {
    fontSize: 12,
    color: colors.nomad.onSurfaceVariant,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  detailSection: {
    marginBottom: 18,
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.nomad.onSurface,
    marginBottom: 8,
  },
  detailLongDesc: {
    fontSize: 12.5,
    color: colors.nomad.onSurfaceVariant,
    lineHeight: 19,
  },
  timelineList: {
    marginTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIndicator: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.nomad.primary,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.nomad.outlineVariant,
    minHeight: 40,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.nomad.primary,
  },
  timelineStepTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.nomad.onSurface,
  },
  timelineDesc: {
    fontSize: 11.5,
    color: colors.nomad.onSurfaceVariant,
    lineHeight: 16,
  },
  detailActsWrap: {
    gap: 8,
  },
  detailActItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailActText: {
    fontSize: 12,
    color: colors.nomad.onSurfaceVariant,
    lineHeight: 17,
  },
  rulesList: {
    gap: 8,
    backgroundColor: colors.nomad.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.nomad.outlineVariant,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleText: {
    flex: 1,
    fontSize: 11.5,
    color: colors.nomad.onSurfaceVariant,
    lineHeight: 16,
  },
  detailBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.nomad.surface,
    borderTopWidth: 1,
    borderTopColor: colors.nomad.outlineVariant,
    paddingTop: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailPriceWrap: {
    flex: 1,
  },
  detailPriceLabel: {
    fontSize: 10,
    color: colors.nomad.outline,
    fontWeight: '600',
  },
  detailPriceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.nomad.primary,
  },
  detailMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.nomad.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  detailMainBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Modal Feedback ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.nomad.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 8,
  },
  modalIconCircle: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.nomad.onSurface,
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 12,
    color: colors.nomad.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCloseBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.nomad.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.nomad.onSurfaceVariant,
  },
  modalGoTripBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.nomad.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGoTripBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
