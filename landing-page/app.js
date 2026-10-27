/**
 * VILOCA MARKETING LANDING PAGE — INTERACTIVE ENGINE
 * Features: sample itinerary demo, mascot interaction, map switcher,
 * Festival Countdown, Destination Filters, Toast UI, QR Modal, Smooth animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileDrawer();
  initMascotInteractions();
  initPhoneMockupMap();
  initPhoneMockupSwitcher();
  initAiTripSimulator();
  initDestinationFilters();
  initFestivalCountdowns();
  initFaqAccordion();
  initQrModal();
  initNewsletterForm();
  initScrollReveal();
  initStatCounters();
});



/* ==================== 1. HEADER SCROLL & NAV ==================== */
function initHeader() {
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll Spy for Nav links
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==================== 2. MOBILE DRAWER ==================== */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ==================== 3. MASCOT SEN INTERACTIONS ==================== */
function initMascotInteractions() {
  const mascotCard = document.getElementById('mascot-card');
  const mascotAvatar = document.getElementById('mascot-avatar');
  const mascotQuote = document.getElementById('mascot-quote');

  if (!mascotCard || !mascotAvatar || !mascotQuote) return;

  const mascotMoods = [
    {
      img: 'assets/mascot/sen-exploring.png',
      quote: '"Hà Nội mùa này cốm xanh thơm lừng, ghé Làng Vòng thử bánh cùng Sen nha!"'
    },
    {
      img: 'assets/mascot/sen-excited.png',
      quote: '"Bạn đã thử làm gốm Bát Tràng chưa? Vui cực kỳ luôn á! ✨"'
    },
    {
      img: 'assets/mascot/sen-love.png',
      quote: '"Đêm rằm Hội An lung linh đèn lồng, ước gì được cùng bạn thả hoa đăng! 🏮"'
    },
    {
      img: 'assets/mascot/sen-winking.png',
      quote: '"Sài Gòn có hẻm bánh tráng nướng ngon đỉnh chóp, để Sen dẫn đường cho nè!"'
    },
    {
      img: 'assets/mascot/sen-happy.png',
      quote: '"AI của Viloca đã sẵn sàng! Bạn chỉ việc xách balo lên và đi thôi! 🎒"'
    }
  ];

  let currentMoodIdx = 0;
  let isSwitching = false;

  mascotCard.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isSwitching) return;
    isSwitching = true;
    currentMoodIdx = (currentMoodIdx + 1) % mascotMoods.length;
    const mood = mascotMoods[currentMoodIdx];

    // Fade out
    mascotAvatar.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    mascotAvatar.style.opacity = '0';
    mascotAvatar.style.transform = 'scale(0.8) rotate(8deg)';
    mascotQuote.style.transition = 'opacity 0.15s ease';
    mascotQuote.style.opacity = '0';

    setTimeout(() => {
      // Swap content while invisible
      mascotAvatar.src = mood.img;
      mascotQuote.textContent = mood.quote;

      // Fade back in
      mascotAvatar.style.opacity = '1';
      mascotAvatar.style.transform = 'scale(1) rotate(0deg)';
      mascotQuote.style.opacity = '1';
      isSwitching = false;
    }, 160);
  });
}

/* ==================== 4. LEAFLET PHONE MOCKUP MAP & TABS SWITCHER ==================== */
let phoneLeafletMap = null;

function initPhoneMockupMap() {
  const mapContainer = document.getElementById('phone-leaflet-map');
  if (!mapContainer || typeof L === 'undefined') return;

  // Center on Hanoi Old Quarter: Cà Phê Giảng, Ô Quan Chưởng, Cầu Long Biên
  const hanoiCenter = [21.0380, 105.8545];

  try {
    if (phoneLeafletMap) {
      phoneLeafletMap.remove();
      phoneLeafletMap = null;
    }

    phoneLeafletMap = L.map('phone-leaflet-map', {
      center: hanoiCenter,
      zoom: 15,
      zoomControl: false, // clean mobile UI
      attributionControl: false, // clean phone screen
      scrollWheelZoom: false,
      touchZoom: true,
      dragging: true
    });

    // OpenStreetMap Humanitarian (HOT) tile layer - 100% Free, no API key, clean pastel colors
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abc'
    });

    tileLayer.on('tileerror', function() {
      // Fallback to standard OSM if needed
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(phoneLeafletMap);
    });

    tileLayer.addTo(phoneLeafletMap);

    // Custom HTML Marker Creator
    function createPinIcon(emoji, title, colorClass = '') {
      return L.divIcon({
        className: 'viloca-div-icon',
        html: `
          <div class="viloca-map-pin">
            <div class="pin-bubble ${colorClass}">
              <span>${emoji}</span>
            </div>
            <div class="pin-pointer"></div>
            <div class="pin-title-tag">${title}</div>
          </div>
        `,
        iconSize: [60, 48],
        iconAnchor: [30, 42],
        popupAnchor: [0, -42]
      });
    }

    // User Live Location Marker (Radar Pulse)
    const userRadarIcon = L.divIcon({
      className: 'user-radar-div-icon',
      html: `
        <div class="user-live-radar" title="Vị trí của bạn">
          <div class="user-radar-wave"></div>
          <div class="user-core-dot"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    // Cultural spots along the tour
    const spots = [
      {
        coords: [21.0345, 105.8548],
        icon: createPinIcon('☕', 'Cà Phê Giảng', ''),
        title: 'Cà Phê Giảng (1946)',
        desc: '39 Nguyễn Hữu Huân &bull; Cà phê trứng trứ danh',
        badge: 'Điểm khởi hành'
      },
      {
        coords: [21.0378, 105.8546],
        icon: createPinIcon('⛩️', 'Ô Quan Chưởng', 'forest-pin'),
        title: 'Ô Quan Chưởng',
        desc: 'Cổng thành cổ thời vua Tự Đức',
        badge: 'Di tích 1817'
      },
      {
        coords: [21.0425, 105.8572],
        icon: createPinIcon('🌉', 'Cầu Long Biên', 'warm-pin'),
        title: 'Cầu Long Biên',
        desc: 'Chứng nhân lịch sử vắt qua sông Hồng',
        badge: 'Điểm tiếp theo'
      }
    ];

    // Add spots markers & popups
    spots.forEach(spot => {
      const marker = L.marker(spot.coords, { icon: spot.icon }).addTo(phoneLeafletMap);
      marker.bindPopup(`
        <div class="popup-inner">
          <strong>${spot.title}</strong>
          <span>${spot.desc}</span>
        </div>
      `, {
        className: 'viloca-map-popup',
        closeButton: false,
        autoPan: true,
        autoPanPadding: [15, 15]
      });
    });

    // Add live user marker
    const userCoords = [21.0358, 105.8542];
    L.marker(userCoords, { icon: userRadarIcon }).addTo(phoneLeafletMap)
      .bindPopup('<div class="popup-inner"><strong>Vị trí của bạn</strong><span>Đang di chuyển trên tuyến di sản</span></div>', {
        className: 'viloca-map-popup',
        closeButton: false
      });

    // Route coordinates following realistic streets
    const routeCoords = [
      [21.0345, 105.8548],
      [21.0358, 105.8542],
      [21.0366, 105.8539],
      [21.0378, 105.8546],
      [21.0392, 105.8552],
      [21.0410, 105.8562],
      [21.0425, 105.8572]
    ];

    // Polyline glow underline
    L.polyline(routeCoords, {
      color: 'rgba(200, 96, 46, 0.3)',
      weight: 8,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(phoneLeafletMap);

    // Main route line
    L.polyline(routeCoords, {
      color: '#C8602E',
      weight: 4,
      dashArray: '8, 6',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(phoneLeafletMap);

    // Recenter Button
    const recenterBtn = document.getElementById('btn-recenter-map');
    if (recenterBtn) {
      recenterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        phoneLeafletMap.flyTo(hanoiCenter, 15, { duration: 0.8 });
      });
    }

    // Weather Badge Click
    const weatherBadge = document.querySelector('.badge-weather');
    if (weatherBadge) {
      weatherBadge.addEventListener('click', () => {
        showToast('🌤️ Hà Nội hôm nay 28°C, mùa thu mát mẻ rất đẹp để dạo phố!');
      });
    }

    // Lên lịch 10s Badge Click
    const planBadge = document.querySelector('.badge-top-right');
    if (planBadge) {
      planBadge.style.cursor = 'pointer';
      planBadge.addEventListener('click', () => {
        const aiSection = document.getElementById('ai-planner');
        if (aiSection) aiSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 100% Bản Địa Badge Click
    const localBadge = document.querySelector('.badge-bottom-left');
    if (localBadge) {
      localBadge.style.cursor = 'pointer';
      localBadge.addEventListener('click', () => {
        const destSection = document.getElementById('destinations');
        if (destSection) destSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Map search chip click
    const destChip = document.getElementById('map-dest-chip');
    if (destChip) {
      destChip.addEventListener('click', () => {
        const aiSection = document.getElementById('ai-planner');
        if (aiSection) aiSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

  } catch (err) {
    console.warn('Leaflet phone map init info:', err);
  }
}

/* ==================== 4b. PHONE MOCKUP TAB SWITCHER ==================== */
function initPhoneMockupSwitcher() {
  const tabs = document.querySelectorAll('.mock-tab');
  const screens = document.querySelectorAll('.phone-screen');
  if (!tabs.length || !screens.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetScreenId = tab.getAttribute('data-screen');

      // Update tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update screens
      screens.forEach(screen => screen.classList.remove('active'));
      const targetScreen = document.getElementById(targetScreenId);
      if (targetScreen) targetScreen.classList.add('active');

      // Initialize map when switching to map tab (lazy init)
      if (targetScreenId === 'screen-map' && phoneLeafletMap) {
        setTimeout(() => phoneLeafletMap.invalidateSize(), 100);
      }
    });
  });
}

/* ==================== 5. AI TRIP PLANNER SIMULATOR ==================== */
const itineraryDatabase = {
  hanoi: {
    slow: {
      title: 'Hà Nội — Sống Chậm & Hoài Niệm Phố Phường',
      costDay: 450000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 09:00', name: 'Phở Bát Đàn & Cà phê Đinh Tầng 2', desc: 'Thưởng thức bát phở bò tái lăn gia truyền, nhâm nhi ly cà phê trứng ngắm hồ Hoàn Kiếm sáng sớm.', price: '85.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '09:30 - 11:30', name: 'Dạo Bước Ô Quan Chưởng & Chợ Đồng Xuân', desc: 'Khám phá cổng thành cổ duy nhất còn sót lại của Thăng Long xưa và khu chợ sầm uất.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Chiều', time: '12:00 - 13:30', name: 'Bún Chả Hương Liên (Obama)', desc: 'Thưởng thức nem cua bể giòn rụm và bún chả than hoa trứ danh đậm đà.', price: '70.000 đ' },
            { slotLabel: 'Hoàng Hôn', time: '15:30 - 18:00', name: 'Hoàng Hôn Cầu Long Biên & Cà Phê Đường Tàu', desc: 'Đi bộ trên cây cầu thép trăm tuổi ngắm bãi giữa sông Hồng thơ mộng và thưởng thức ngô nướng.', price: '45.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:00 - 09:00', name: 'Dạo Hồ Tây, Chùa Trấn Quốc & Bánh Tôm', desc: 'Ngắm sương sớm trên mặt nước Hồ Tây mênh mông, ghé ngôi chùa cổ nhất Hà Nội xây dựng thế kỷ thứ 6.', price: '60.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Bún Thang Cầu Gỗ & Trà Quất Nhà Thờ Lớn', desc: 'Tô bún thang thanh tao chuẩn vị ẩm thực Hà Thành xưa, ngồi nhâm nhi trà quất vỉa hè ngắm Nhà Thờ.', price: '65.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:00', name: 'Biệt Thự Cổ Pháp Phố Phan Đình Phùng', desc: 'Đi dạo dưới hàng cây sấu rợp bóng, chiêm ngưỡng kiến trúc Đông Dương hoài cổ và chụp ảnh kỷ niệm.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Cà Phê Cuối Ngõ Nhạc Trịnh & Bánh Mì Dân Tổ', desc: 'Thả mình trong không gian nhạc Trịnh mộc mạc và thưởng thức ổ bánh mì xào bơ béo ngậy trứ danh.', price: '55.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 09:30', name: 'Làng Hoa Quảng Bá & Cà Phê Vườn Chuối', desc: 'Dạo bước giữa sắc hoa tươi thắm ven đê và ghé quán cà phê mộc mạc ẩn mình giữa vườn chuối sông Hồng.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Chả Cá Thăng Long & Bún Đậu Ngõ Trạm', desc: 'Thịt cá lăng vàng ruộm xào thì là bốc khói cùng đĩa bún đậu chả cốm chấm mắm tôm nức tiếng.', price: '90.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:00', name: 'Đọc Sách Thư Viện Quốc Gia & Trà Chiều', desc: 'Tận hưởng không gian tĩnh lặng rợp bóng cây cổ thụ và thưởng thức tách trà hoa cúc mật ong.', price: '80.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:30', name: 'Phố Đi Bộ Hồ Gươm & Nghe Hát Xẩm Cổ', desc: 'Thưởng thức chiếu chèo, canh hát xẩm dân gian trước cửa chợ Đồng Xuân và dạo phố đêm.', price: 'Miễn phí' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:00', name: 'Làng Ngọc Hà, Hồ B52 & Bánh Cuốn Thanh Trì', desc: 'Khám phá dấu ấn lịch sử giữa lòng làng hoa xưa và nếm vị bánh cuốn tráng mỏng chấm nước mắm cà cuống.', price: '45.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bún Bò Nam Bộ Phố Hàng Điếu', desc: 'Tô bún bò trộn đậm vị nước mắm chua ngọt, lạc rang giòn bùi và hành phi giòn tan gia truyền.', price: '65.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:00', name: 'Công Viên Bách Thảo & Bảo Tàng Mỹ Thuật', desc: 'Chiêm ngưỡng những kiệt tác tranh sơn mài, lụa và tượng Phật bà nghìn mắt nghìn tay thế kỷ 17.', price: '50.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Rượu Nếp Cái Hoa Vàng & Ẩm Thực Phố Cổ', desc: 'Bữa cơm tối gia đình truyền thống bên mâm cơm ấm cúng và chén rượu nếp men lá thơm lừng.', price: '120.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 09:30', name: 'Đạp Xe Quanh Hồ Trúc Bạch & Phở Cuốn', desc: 'Tận hưởng làn gió mát lành bên hồ, thưởng thức phở cuốn thịt bò chấm nước mắm tỏi ớt Ngũ Xã.', price: '60.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Lẩu Riêu Cua Bắp Bò Phó Đức Chính', desc: 'Nồi lẩu riêu cua đồng chua thanh đậm đà cùng bắp bò tươi giòn và rau sống ghém.', price: '140.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 16:30', name: 'Mua Ô Mai Hàng Đường & Trà Sen Làm Quà', desc: 'Chọn những hộp ô mai mơ xào gừng, sấu ngâm đường và trà ướp gạo sen Tây Hồ quý giá.', price: '150.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Ngắm Đêm Hà Nội Từ Đài Quan Sát Lotte', desc: 'Chiêm ngưỡng toàn cảnh hàng triệu ánh đèn lung linh của thủ đô ngàn năm từ tầng 65.', price: '180.000 đ' }
          ]
        }
      ],
      rationale: 'Lộ trình ưu tiên di chuyển ngắn giữa các con phố cổ ngàn năm, kết hợp trọn vẹn văn hóa ẩm thực bình dị và không gian di sản tĩnh lặng.'
    },
    foodie: {
      title: 'Hà Nội — Càn Quét Ẩm Thực 36 Phố Phường',
      costDay: 580000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Bánh Cuốn Nóng Gia An & Trà Sen Tây Hồ', desc: 'Bánh cuốn mỏng tang nhân thịt mộc nhĩ chấm nước mắm cà cuống thơm nức mũi.', price: '65.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:00 - 12:30', name: 'Chả Cá Lã Vọng Cổ Truyền 14 Chả Cá', desc: 'Từng miếng cá lăng xào thì là, hành hoa ăn kèm bún, lạc rang và mắm tôm nguyên chất.', price: '180.000 đ' },
            { slotLabel: 'Xế Chiều', time: '14:30 - 16:00', name: 'Cà Phê Giảng — Cội Nguồn Cà Phê Trứng 1946', desc: 'Thưởng thức công thức béo ngậy từ năm 1946 tại số 39 Nguyễn Hữu Huân.', price: '40.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 20:30', name: 'Phố Ẩm Thực Tống Duy Tân & Nem Chua Rán', desc: 'Trải nghiệm thiên đường ăn đêm với gà tần thuốc bắc, xôi xéo nóng và nem chua nướng.', price: '120.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Phở Thìn Lò Đúc (Bò Tái Lăn Nhiều Hành)', desc: 'Bát phở tái lăn nước béo đậm đà, thịt bò xào lửa lớn ngọt mềm bốc khói ngập tràn hành hoa.', price: '80.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Bún Đậu Mắm Tôm Hàng Khay & Chả Cốm', desc: 'Mẹt bún đậu đầy ắp đậu mơ rán giòn, dồi sụn, chả cốm nóng hổi và chén mắm tôm sủi bọt.', price: '60.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Bánh Giò Cô Béo Thuỵ Khuê & Sữa Đậu Nành', desc: 'Chiếc bánh giò núng nính ngập nhân mộc nhĩ thịt băm kèm giò tai, chả cốm giòn sần sật.', price: '35.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Lẩu Ếch Măng Cay Lò Đúc & Bia Hơi Tạ Hiện', desc: 'Thịt ếch xào măng cay giòn sần sật nhúng lẩu chua cay và giao lưu bên ngã tư bia phố cổ.', price: '160.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Xôi Xéo Chị Mây Hàng Hòm & Cà Phê Lâm', desc: 'Gói xôi xéo vàng óng ngập đỗ xanh bào, hành phi thơm nức và ly cà phê rang củi cổ kính.', price: '50.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Nộm Bò Khô Long Vi Dung Bờ Hồ & Bánh Rán', desc: 'Đĩa nộm đu đủ giòn sần sật với lá lách bò, thịt bò khô cay và bánh rán mặn Lý Quốc Sư.', price: '55.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Chè Bốn Mùa Hàng Cân & Tào Phớ Nghĩa Tân', desc: 'Bát chè sen long nhãn ngọt thanh và tào phớ hoa nhài mềm mịn mát lạnh xua tan nắng nóng.', price: '35.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Ốc Nóng Hà Trang Đinh Liệt & Cút Lộn Xào Me', desc: 'Bát ốc luộc lá bưởi thơm nức chấm nước mắm gừng cay nồng và nem chua rán ngõ Tạm Thương.', price: '130.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Phở Gà Châm Yên Ninh Đậm Vị Nước Dùng', desc: 'Bát phở gà đồi da vàng giòn sần sật, nước dùng trong vắt ngọt lịm từ xương gà ninh kỳ công.', price: '90.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Bún Ốc Nguội Ô Quan Chưởng & Bún Mọc', desc: 'Món ăn thanh tao đất kinh kỳ với ốc nhồi béo ngậy chấm nước dấm bỗng chua dịu.', price: '70.000 đ' },
            { slotLabel: 'Xế Chiều', time: '14:30 - 16:00', name: 'Kem Tràng Tiền & Bánh Mì Pate Lãn Ông', desc: 'Cây kem ốc quế cốm dừa trứ danh và ổ bánh mì pate nướng giòn rụm đậm vị truyền thống.', price: '45.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Chân Gà Nướng Mai Hắc Đế & Lẩu Cháo Chim', desc: 'Chân gà nướng mật ong vàng ruộm thơm lừng và nồi lẩu cháo chim câu bồi bổ sức khỏe.', price: '150.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:30 - 09:00', name: 'Bánh Đa Cua Trộn Lý Thường Kiệt', desc: 'Sợi bánh đa đỏ Hải Phòng dai giòn trộn chả cá, thịt bò, rau cần và gạch cua béo ngậy.', price: '55.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Bún Chả Đắc Kim Hàng Mành Nem Vuông', desc: 'Từng miếng chả băm nướng than hoa vàng rộm và nem cua bể vuông vức giòn tan.', price: '120.000 đ' },
            { slotLabel: 'Xế Chiều', time: '14:30 - 16:30', name: 'Cốm Làng Vòng Xào Dừa & Bánh Cốm Than', desc: 'Thưởng thức hạt cốm mộc xanh mướt gói lá sen thơm ngát và tách trà mạn nóng.', price: '60.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Thiên Đường Ẩm Thực Chợ Đêm Phố Cổ', desc: 'Thưởng thức nướng than hoa vỉa hè, hoa quả dầm Tô Tịch và bia hơi Hà Nội.', price: '140.000 đ' }
          ]
        }
      ],
      rationale: 'Tuyển tập những quán ăn gia truyền có tuổi đời trên 50 năm, dẫn bạn qua những ngõ ngách ẩm thực chuẩn vị Tràng An.'
    },
    culture: {
      title: 'Hà Nội — Dấu Ấn Ngàn Năm Thăng Long Di Sản',
      costDay: 500000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:00', name: 'Văn Miếu Quốc Tử Giám', desc: 'Chiêm ngưỡng 82 bia tiến sĩ và kiến trúc trường đại học đầu tiên của Việt Nam.', price: '70.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '10:30 - 12:00', name: 'Hoàng Thành Thăng Long & Đoan Môn', desc: 'Khu di sản thế giới UNESCO lưu giữ tầng tầng lớp lớp trầm tích lịch sử ngàn năm.', price: '30.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 16:30', name: 'Di Tích Lịch Sử Nhà Tù Hỏa Lò', desc: 'Tour thuyết minh xúc động về ý chí kiên cường bất khuất của các chiến sĩ cách mạng.', price: '50.000 đ' },
            { slotLabel: 'Buổi Tối', time: '17:30 - 19:00', name: 'Múa Rối Nước Thăng Long Bên Hồ Gươm', desc: 'Môn nghệ thuật sân khấu dân gian độc nhất vô nhị trên mặt nước rực rỡ.', price: '100.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 10:30', name: 'Lăng Bác, Nhà Sàn & Chùa Một Cột', desc: 'Viếng Chủ tịch Hồ Chí Minh, tham quan khu vườn cây ăn trái và ngôi chùa hoa sen độc đáo.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Cơm Chay Tịnh Quán Trúc Bạch', desc: 'Thưởng thức mâm cơm chay thanh tịnh với nấm hương hầm hạt sen và canh rong biển.', price: '80.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Đền Quán Thánh & Chùa Trấn Quốc Hồ Tây', desc: 'Chiêm ngưỡng tượng Huyền Thiên Trấn Vũ bằng đồng đen đúc năm 1677 nặng gần 4 tấn.', price: '20.000 đ' },
            { slotLabel: 'Buổi Tối', time: '19:00 - 21:00', name: 'Ca Trù Cổ Đình Kim Ngân Hàng Bạc', desc: 'Lắng nghe tiếng phách, tiếng đàn đáy và giọng hát trầm bổng của di sản ca trù UNESCO.', price: '120.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 10:30', name: 'Bảo Tàng Lịch Sử Quốc Gia & Nhà Hát Lớn', desc: 'Khám phá bảo vật quốc gia từ thời tiền sử, trống đồng Đông Sơn và kiến trúc Pháp tráng lệ.', price: '60.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Cơm Niêu Phố Cổ & Canh Cua Rau Đay', desc: 'Bữa cơm thuần Việt ấm áp bên niêu cơm cháy giòn rụm và cà pháo giòn tan.', price: '95.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Đền Ngọc Sơn & Cầu Thê Húc Đỏ Son', desc: 'Ghé thăm nơi thờ Đức Thánh Trần và ngắm tiêu bản Cụ Rùa Hồ Gươm huyền thoại.', price: '30.000 đ' },
            { slotLabel: 'Buổi Tối', time: '19:00 - 21:30', name: 'Tour Đêm Giải Mã Hoàng Thành Thăng Long', desc: 'Trải nghiệm dâng hương điện Kính Thiên và giải mã cổ vật bằng đèn lồng hoàng cung bí ẩn.', price: '200.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 11:00', name: 'Thành Cổ Cổ Loa & Đền Thờ An Dương Vương', desc: 'Vùng đất kinh đô đầu tiên của nhà nước Âu Lạc với kiến trúc 9 vòng xoáy trôn ốc huyền thoại.', price: '30.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bún Mạch Tràng & Gà Đồi Đông Anh', desc: 'Thưởng thức sợi bún đen Mạch Tràng tiến vua và món gà đồi hấp lá chanh thơm lừng.', price: '90.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Chùa Dâu & Chùa Bút Tháp Cổ Tự', desc: 'Khám phá cái nôi của Phật giáo Việt Nam và tháp Báo Nghiêm tuyệt mỹ bằng đá xanh.', price: '40.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Cột Cờ Hà Nội & Dạo Phố Hoàng Diệu', desc: 'Ngắm di tích kỳ đài lịch sử rực rỡ trong ánh đèn đêm và hàng cây xà cừ cổ thụ.', price: 'Miễn phí' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 11:30', name: 'Làng Cổ Đường Lâm & Nhà Cổ Đá Ong', desc: 'Dạo quanh cổng làng Mông Phụ, giếng nước, sân đình và những ngôi nhà cổ trên 300 năm tuổi.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '12:00 - 13:30', name: 'Cơm Quê Thịt Quay Đòn & Tương Bần', desc: 'Món thịt quay đòn ướp lá ổi giòn bì trứ danh chấm tương nếp Đường Lâm đậm đà.', price: '110.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Đền Thờ Hai Vua Phùng Hưng & Ngô Quyền', desc: 'Thắp nén nhang tưởng nhớ hai vị anh hùng dân tộc vĩ đại sinh ra trên đất Mía Sơn Tây.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Trà Hoa Cúc Ngắm Phố Phường Tràng An', desc: 'Khép lại hành trình di sản bên ly trà hoa cúc nóng và bánh đậu xanh thơm ngát.', price: '50.000 đ' }
          ]
        }
      ],
      rationale: 'Lịch trình được xâu chuỗi theo tiến trình lịch sử từ thời Lý, Trần, Lê đến thời kỳ cận đại đầy tự hào.'
    },
    craft: {
      title: 'Hà Nội — Làng Nghề & Tinh Hoa Thủ Công',
      costDay: 620000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 11:30', name: 'Làng Gốm Bát Tràng & Tự Tay Vuốt Gốm', desc: 'Thăm Bảo tàng Gốm 7 tầng xoắn ốc và trải nghiệm nặn chiếc cốc đầu tiên trên bàn xoay.', price: '120.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '12:00 - 13:30', name: 'Cơm Niêu Đất Sét & Canh Măng Mực Bát Tràng', desc: 'Bữa cơm truyền thống độc đáo của làng gốm với món canh măng mực tiến vua.', price: '110.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:00', name: 'Làng Chuồn Chuồn Tre Thạch Xá', desc: 'Trò chuyện cùng nghệ nhân lão thành và tự tay vẽ hoa văn lên chuồn chuồn giữ thăng bằng.', price: '70.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Trà Sen Tây Hồ & Không Gian Cổ', desc: 'Tìm hiểu nghệ thuật ướp trà sen trăm bông gạo kỳ công của các nghệ nhân Quảng Bá.', price: '60.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:30', name: 'Làng Lụa Vạn Phúc & Tìm Hiểu Dệt Gấm', desc: 'Khám phá con đường ô rực rỡ, nghe tiếng khung cửi lách cách dệt lụa tơ tằm mềm mại.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Trưa', time: '12:00 - 13:30', name: 'Bún Bò Gốc Hà Đông & Trà Mạn Vỉa Hè', desc: 'Tô bún bò đậm đà nước dùng xương hầm và đĩa rau thơm tươi non miệt vườn.', price: '50.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Làng Nón Chuông & Tự Tay Khâu Nón Lá', desc: 'Nghệ nhân hướng dẫn cách xếp từng lá cọ, xỏ kim khâu từng vành nón lá duyên dáng.', price: '60.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Đúc Đồng Ngũ Xã & Ăn Phở Cuốn Phố Cổ', desc: 'Khám phá nghề đúc tượng đồng truyền thống và thưởng thức đặc sản phở cuốn Ngũ Xã.', price: '90.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 11:00', name: 'Làng Quạt Chàng Sơn Thạch Thất', desc: 'Tận mắt chiêm ngưỡng những chiếc quạt giấy, quạt lụa chạm khắc hoa văn tinh xảo.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Ẩm Thực Đồng Quê Canh Cá Rô Đầm Sét', desc: 'Bát canh cá rô đồng nấu rau cải xanh gừng cay ấm nồng mang đậm phong vị Bắc Bộ.', price: '70.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Làng Sơn Mài Hạ Thái & Khảm Trai Chuôn Ngọ', desc: 'Trải nghiệm mài từng lớp sơn ta và cẩn vỏ ốc trai lấp lánh lên tranh nghệ thuật.', price: '85.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Phố Nghề Kim Hoàn Hàng Bạc Lấp Lánh', desc: 'Dạo quanh các tiệm chạm khắc bạc mỹ nghệ truyền thống từ thời vua Lê.', price: 'Miễn phí' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Làng Mây Tre Đan Phú Vinh Chương Mỹ', desc: 'Chiêm ngưỡng những tuyệt phẩm đan lát mây tre tinh xảo xuất khẩu khắp thế giới.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bánh Tẻ Phú Nhi Nóng Hổi & Chả Quế', desc: 'Cặp bánh tẻ gói lá dong thơm ngát với nhân mộc nhĩ thịt nạc chấm tương ớt cay nồng.', price: '45.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Làng Tò He Xuân La & Nặn Tò He Bột Gạo', desc: 'Tự tay pha màu tự nhiên từ lá cây, củ nghệ và nặn những chú rồng, bông hoa ngộ nghĩnh.', price: '50.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Thức Rượu Làng Vân & Nhạc Dân Tộc', desc: 'Hòa mình vào giai điệu đàn bầu, sáo trúc mượt mà bên chum rượu nếp thơm lừng.', price: '110.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 11:30', name: 'Làng Tranh Đông Hồ & In Tranh Khắc Gỗ', desc: 'Dùng chổi lá thông quét màu điệp óng ánh lên giấy dó và in bức tranh Đám Cưới Chuột.', price: '70.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '12:00 - 13:30', name: 'Nem Bùi Thuận Thành & Trà Mạn', desc: 'Thưởng thức món nem bùi thính gạo thơm lừng cuốn lá sung xanh chấm tương ớt.', price: '60.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Làng Hương Đỏ Quảng Phú Cầu Sống Ảo', desc: 'Chụp ảnh giữa hàng ngàn bó tăm hương xòe rộng như những đóa hoa sen đỏ rực rỡ.', price: '50.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Mua Quà Thủ Công Mỹ Nghệ Phố Cổ Hà Nội', desc: 'Lựa chọn các sản phẩm gốm, lụa, tranh khắc gỗ độc bản làm kỷ niệm cho bạn bè.', price: '150.000 đ' }
          ]
        }
      ],
      rationale: 'Kết nối trực tiếp bạn với những nghệ nhân thủ công tâm huyết, giúp gìn giữ và tôn vinh bàn tay vàng đất Việt.'
    }
  },
  hoian: {
    slow: {
      title: 'Hội An — Lắng Đọng Bên Sông Hoài & Làng Rau',
      costDay: 520000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:00 - 08:30', name: 'Bánh Mì Madam Khánh & Cà Phê Mót', desc: 'Thưởng thức ổ bánh mì Nữ hoàng và ly nước sen thảo mộc thơm lành sảng khoái.', price: '45.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '09:00 - 11:30', name: 'Đạp Xe Thăm Làng Rau Trà Quế', desc: 'Trải nghiệm tưới rau bằng gáo tre và thưởng thức bánh xèo giòn rụm tại vườn.', price: '90.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:00', name: 'Ngồi Thuyền Gỗ Rừng Dừa Bảy Mẫu', desc: 'Hòa mình vào vũ điệu lắc thúng chai điệu nghệ của các bác lái đò địa phương.', price: '150.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thả Đèn Hoa Đăng Sông Hoài Lung Linh', desc: 'Thả trôi ngọn nến ước nguyện cầu bình an giữa muôn sắc đèn lồng phố cổ.', price: '20.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '06:00 - 08:30', name: 'Đón Bình Minh Biển An Bàng & Nước Dừa', desc: 'Hít thở không khí biển trong lành, tắm biển sớm và thưởng thức trái dừa xiêm ngọt lịm.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Bánh Xèo Nem Lụi Giếng Bá Lễ Nóng Hổi', desc: 'Bánh xèo vàng ươm vỏ giòn tan cuốn bánh tráng rau sống chấm tương đậu bùi béo.', price: '75.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:00', name: 'Thăm Nhà Cổ Đức An & Cà Phê Faifo', desc: 'Ngồi trên tầng thượng ngắm những mái ngói âm dương rêu phong nhuốm màu hoàng hôn.', price: '60.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Dạo Cầu An Hội & Nghe Hát Bài Chòi', desc: 'Tham gia trò chơi dân gian rộn rã tiếng cười bên bờ sông Hoài huyền ảo.', price: '30.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 09:30', name: 'Đạp Xe Cánh Đồng Lúa Cẩm Châu Yên Bình', desc: 'Ngắm đàn cò trắng bay lượn và ghé quán cà phê gỗ mộc giữa cánh đồng bao la.', price: '45.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Cơm Gà Xứ Quảng Bà Buội', desc: 'Đĩa cơm gà xé vàng óng ả thơm lừng vị nghệ tươi và hành tây cay dịu.', price: '65.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 16:30', name: 'Đi Thuyền Gỗ Thăm Làng Mộc Kim Bồng', desc: 'Tìm hiểu nghệ thuật chạm khắc gỗ tinh xảo của các nghệ nhân đóng thuyền rồng cổ xưa.', price: '60.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Trà Thảo Mộc Reaching Out & Nhạc Acoustic', desc: 'Không gian tĩnh lặng do người khiếm thính phục vụ, mang lại cảm giác bình yên sâu thẳm.', price: '70.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:00 - 09:30', name: 'Tắm Biển Cửa Đại & Chèo SUP Sáng Sớm', desc: 'Lướt ván chèo đứng trên mặt biển êm đềm ngắm nhìn dãy Cù Lao Chàm từ xa.', price: '120.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Hải Sản Tươi Sống Bến Cửa Đại', desc: 'Thưởng thức mực hấp gừng, sò điệp nướng mỡ hành và nghêu hấp sả tươi ngon.', price: '160.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 16:30', name: 'Bảo Tàng Văn Hóa Sa Huỳnh & Gốm Sứ', desc: 'Khám phá nền văn hóa cổ xưa có niên đại hơn 2.000 năm tại miền Trung Việt Nam.', price: '40.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Thức Chè Bắp Cẩm Nam & Bánh Đập', desc: 'Món ăn vặt dân dã ngọt thanh bên bờ sông Thu Bồn lộng gió trăng thanh.', price: '35.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:00 - 09:00', name: 'Chợ Sớm Hội An Thưởng Thức Mì Quảng', desc: 'Tô mì Quảng tôm thịt đậm đà, trứng cút vàng và bánh tráng mè nướng giòn rụm.', price: '45.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Cơm Niêu Cá Bống Kho Tộ Sông Hoài', desc: 'Niêu cá bống sông kho tiêu cay cay, thơm phức ăn cùng canh rau tập tàng.', price: '85.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Mua Lụa Tơ Tằm & Đèn Lồng Phố Hội Làm Quà', desc: 'Chọn những chiếc lồng đèn xếp gọn và khăn lụa tơ tằm mềm mại gửi tặng người thân.', price: '150.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Ngắm Hoàng Hôn & Tạm Biệt Phố Cổ Lung Linh', desc: 'Lưu giữ những khoảnh khắc tuyệt đẹp của phố cổ rực rỡ dưới ánh đèn lồng lấp lánh.', price: '40.000 đ' }
          ]
        }
      ],
      rationale: 'Hội An trọn vẹn từ nét mộc của làng quê sông nước đến vẻ đẹp huyền ảo của phố cổ về đêm.'
    },
    foodie: {
      title: 'Hội An — Mỹ Vị Miền Di Sản Sông Thu Bồn',
      costDay: 490000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:30 - 08:45', name: 'Cao Lầu Thanh & Sữa Đậu Nành Phố Cổ', desc: 'Tô cao lầu sợi vàng ươm nấu từ tro củi Cù Lao Chàm và nước giếng Bá Lễ.', price: '45.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Cơm Gà Bà Buội Cổ Truyền', desc: 'Hạt cơm vàng óng nấu từ nước luộc gà ta, thịt xé dai giòn trộn hành tây rau răm.', price: '65.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Bánh Đập Hến Xào Cẩm Nam & Chè Bắp', desc: 'Món ăn dân dã giòn tan chấm mắm nêm đậm đà bên bờ sông Thu Bồn lộng gió.', price: '40.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 20:30', name: 'Thịt Xiên Nướng Cuốn Bánh Tráng Bên Sông', desc: 'Xiên thịt nướng than hoa thơm lừng ăn kèm ram bắp và nước chấm đậu phộng béo bùi.', price: '80.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Bánh Mì Phượng Thập Cẩm Bơ Pate', desc: 'Ổ bánh mì huyền thoại kẹp hơn 10 loại nhân và nước sốt bí truyền trứ danh thế giới.', price: '40.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Bánh Bèo Chén & Bánh Vạc Hoa Hồng Trắng', desc: 'Đĩa bánh vạc trắng ngần như cánh hoa hồng với nhân tôm thịt chấm nước mắm ớt cay.', price: '60.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Chè Hạt Sen Nhãn Lồng Chùa Cầu', desc: 'Hạt sen bùi bùi bọc trong cùi nhãn ngọt giòn thơm nức mùi nước đường phèn.', price: '30.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Hải Sản Cua Huỳnh Đế Biển Cửa Đại', desc: 'Thưởng thức món cua hoàng gia thơm ngọt hấp sả cùng nồi lẩu chua cay đậm đà.', price: '220.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:30 - 08:45', name: 'Mì Quảng Ông Hai Tôm Thịt Trứng Cút', desc: 'Tô mì Quảng gia truyền với nước lèo sền sệt đậm vị và đĩa rau sống Trà Quế xanh mướt.', price: '45.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Bún Mắm Nêm Cô Bảy Chợ Hội An', desc: 'Tô bún mắm nêm cá cơm thơm lừng với thịt heo quay giòn bì và mít non luộc.', price: '40.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Bánh Ít Lá Gai & Bánh Su Sê Phố Cổ', desc: 'Vị ngọt bùi dẻo thơm của lá gai gói lá chuối truyền thống xứ Quảng.', price: '25.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Ốc Hút & Lẩu Cá Đuối Nướng Cẩm An', desc: 'Đĩa ốc hút xào sả ớt cay xé lưỡi và cá đuối nướng lá chuối thơm nức mũi.', price: '130.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Cháo Lươn Nghệ Nóng Hổi Phố Cổ', desc: 'Bát cháo lươn đồng xào nghệ tươi vàng óng, thơm nồng hạt tiêu và rau răm.', price: '45.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Ram Bắp Giòn Rụm & Bánh Canh Cá Lóc', desc: 'Ram bắp non ngọt lịm cuốn rau sống và tô bánh canh bột gạo sợi dai mềm.', price: '55.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Nước Mót Sen Thảo Mộc & Tào Phớ Nóng', desc: 'Ly nước thảo dược thơm mùi chanh sả quế và bát tào phớ nước đường gừng.', price: '30.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Tiệc Nướng BBQ Hải Sản Bờ Sông Thu Bồn', desc: 'Tôm nướng muối ớt, mực một nắng nướng sa tế bên ngọn lửa ấm áp và tiếng đàn ghi ta.', price: '180.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:30 - 09:00', name: 'Bánh Cuốn Thịt Nướng Bà Lễ', desc: 'Thịt xiên nướng than hoa thơm phức cuốn bánh ướt mỏng và chấm nước tương đậu béo.', price: '50.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Cơm Gà Xé Trộn Gỏi Long Hội An', desc: 'Thịt gà ta thả vườn dai ngọt xé phay trộn rau răm tiêu rừng cay nồng hấp dẫn.', price: '70.000 đ' },
            { slotLabel: 'Xế Chiều', time: '14:30 - 16:30', name: 'Rượu Hồng Đào Xứ Quảng & Bánh Đậu Xanh', desc: 'Nhấp ngụm rượu hồng đào trứ danh và mua những hộp bánh đậu xanh nhân thịt làm quà.', price: '80.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Đại Tiệc Ẩm Thực Chợ Đêm Bạch Đằng', desc: 'Thưởng thức nem nướng lụi, bánh tráng nướng trứng và chè đậu ngự hạt sen.', price: '110.000 đ' }
          ]
        }
      ],
      rationale: 'Hành trình nếm trọn tinh hoa ẩm thực xứ Quảng với những nguyên liệu đặc hữu chỉ có tại Hội An.'
    },
    culture: {
      title: 'Hội An — Dấu Ấn Thương Cảng Cổ & Di Sản UNESCO',
      costDay: 530000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:00', name: 'Chùa Cầu & Nhà Cổ Tấn Ký Trăm Năm', desc: 'Chiêm ngưỡng biểu tượng phố cổ giao thoa kiến trúc Việt - Nhật - Hoa độc đáo.', price: '80.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '10:30 - 12:30', name: 'Hội Quán Phúc Kiến & Bảo Tàng Gốm Sứ', desc: 'Khám phá văn hóa thương cảng quốc tế sầm uất bậc nhất thế kỷ 16-17.', price: '40.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 16:30', name: 'Đi Thuyền Gỗ Thăm Làng Mộc Kim Bồng', desc: 'Chiêm ngưỡng bàn tay tài hoa của các nghệ nhân từng xây dựng cung đình Huế.', price: '60.000 đ' },
            { slotLabel: 'Buổi Tối', time: '19:30 - 21:00', name: 'Show Ký Ức Hội An Thực Cảnh Tráng Lệ', desc: 'Đại tiệc nghệ thuật ánh sáng và âm nhạc tái hiện 400 năm lịch sử phố Hội.', price: '350.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 11:30', name: 'Khu Thánh Địa Mỹ Sơn — Di Sản Champa', desc: 'Chiêm ngưỡng quần thể tháp gạch Chăm Pa cổ bí ẩn được xây dựng từ thế kỷ thứ 4.', price: '150.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '12:00 - 13:30', name: 'Bê Thui Cầu Mống Nức Tiếng Xứ Quảng', desc: 'Thịt bê thui rơm chín tái da giòn chấm mắm nêm đậm đà cuốn bánh tráng rau rừng.', price: '110.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 16:30', name: 'Hội Quán Triều Châu & Hội Quán Quảng Đông', desc: 'Khám phá kiến trúc chạm khắc gỗ xà cừ và đắp nổi sành sứ tinh xảo của thương gia xưa.', price: '40.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Hát Bài Chòi Dân Gian Bên Sông Hoài', desc: 'Lắng nghe những câu hò điệu lý mộc mạc của các nghệ nhân bài chòi xứ Quảng.', price: '30.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Bảo Tàng Văn Hóa Dân Gian Hội An', desc: 'Trưng bày trang phục, nông cụ và phong tục cưới hỏi truyền thống của cư dân phố cổ.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Cơm Niêu Phố Cổ & Canh Chua Cá Lóc', desc: 'Niêu cơm cháy giòn rụm ăn cùng cá kho tộ và đĩa rau bí xào tỏi xanh mướt.', price: '90.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Nhà Cổ Phùng Hưng Hơn 200 Năm Tuổi', desc: 'Ngôi nhà bằng gỗ lim đồ sộ kết hợp hài hòa phong cách kiến trúc Nhật - Hoa - Việt.', price: '30.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Lễ Hội Đèn Lồng Đêm Rằm Phố Cổ', desc: 'Hàng ngàn chiếc đèn lồng thắp sáng, cả khu phố tắt điện tạo nên khung cảnh cổ kính.', price: 'Miễn phí' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Giếng Cổ Bá Lễ & Nhà Thờ Tộc Trần', desc: 'Khám phá giếng nước cổ linh hồn của món cao lầu và ngôi nhà thờ tộc trang nghiêm.', price: '30.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Mì Quảng Ếch & Chè Bắp Cẩm Nam', desc: 'Món mì Quảng ếch nấu trong thố đất bốc khói cùng hạt bắp non ngọt dịu.', price: '70.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Thuyết Minh Lịch Sử Thương Cảng Faifo', desc: 'Lắng nghe chuyên gia văn hóa kể chuyện những con tàu buôn từ Hà Lan, Nhật Bản cập bến.', price: '50.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Trà Đạo Xứ Quảng & Nghe Ca Trù', desc: 'Không gian trà tĩnh lặng mang đến sự thư thái giữa lòng phố thị cổ kính.', price: '60.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 11:30', name: 'Khám Phá Cù Lao Chàm Bằng Cano Cao Tốc', desc: 'Lướt sóng ra đảo ngọc hoang sơ, thăm chùa Hải Tạng cổ và giếng cổ Chăm Pa.', price: '350.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '12:00 - 13:30', name: 'Hải Sản Ốc Vú Nàng & Rau Rừng Cù Lao Chàm', desc: 'Món ốc vú nàng nướng mỡ hành và đĩa rau rừng luộc chấm mắm nhĩ thơm lừng.', price: '150.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Lặn Ngắm San Hô Bãi Xếp Cù Lao Chàm', desc: 'Chiêm ngưỡng rạn san hô đầy màu sắc rực rỡ và những đàn cá bơi lội dưới làn nước trong vắt.', price: '100.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Trở Về Phố Hội Mua Quà Di Sản Lưu Niệm', desc: 'Mua tranh chữ thư pháp, đèn lồng và gốm cổ làm quà lưu niệm chuyến đi di sản.', price: '120.000 đ' }
          ]
        }
      ],
      rationale: 'Xuyên không về thương cảng cổ Faifo lẫy lừng châu Á, cảm nhận chiều sâu văn hóa hòa quyện.'
    },
    craft: {
      title: 'Hội An — Tinh Hoa Làng Nghề Thủ Công Xứ Quảng',
      costDay: 560000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Làng Gốm Thanh Hà & Nặn Con Tu Hú', desc: 'Thử sức trên bàn xoay thủ công và nhận tác phẩm gốm đất nung mộc mạc mang về.', price: '70.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Mì Quảng Ếch Bếp Trang & Trà Đậu Biếc', desc: 'Tô mì Quảng bốc khói đậm đà với rau sống Trà Quế và bánh tráng mè nướng.', price: '65.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Workshop Tự Làm Đèn Lồng Lụa Hà Đông', desc: 'Nghệ nhân hướng dẫn dán từng nan tre và bọc lụa tạo nên chiếc lồng đèn kỷ niệm.', price: '120.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:00 - 20:30', name: 'May Đo Áo Dài Lấy Nhanh Phố Cổ', desc: 'Trải nghiệm dịch vụ may đo lụa tơ tằm danh tiếng với độ tinh xảo và tốc độ thần kỳ.', price: '200.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Làng Đúc Đồng Phước Kiều Trăm Năm', desc: 'Xem các nghệ nhân đúc cồng chiêng, chuông đồng và các đồ tế tự cổ truyền.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bánh Tráng Cuốn Thịt Heo Đại Lộc', desc: 'Từng lát thịt heo hai đầu da giòn ngọt cuốn bánh tráng dẻo chấm mắm nêm nguyên chất.', price: '80.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Làng Dệt Chiếu Bàn Thạch Duy Xuyên', desc: 'Khám phá quy trình nhuộm cói rực rỡ và dệt nên những chiếc chiếu hoa bền đẹp.', price: '40.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thăm Xưởng Tre Nghệ Thuật Taboo Bamboo', desc: 'Chiêm ngưỡng những chiếc xe đạp tre và đồ gia dụng thủ công tre độc đáo xuất khẩu.', price: '60.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Workshop Đẽo Mặt Nạ Gốc Tre Kim Bồng', desc: 'Nghệ nhân truyền cảm hứng điêu khắc chân dung từ những chiếc gốc tre gồ ghề.', price: '90.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Cơm Gà Hội An Hương Vị Bản Địa', desc: 'Món cơm gà truyền thống đậm đà với chén canh lòng gà thơm bùi bổ dưỡng.', price: '65.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Trải Nghiệm Ướp Trà Sen Cung Đình Xứ Quảng', desc: 'Học cách ướp trà trong búp sen tươi và thưởng thức hương vị thanh khiết.', price: '80.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:00 - 20:30', name: 'Trưng Bày Trang Sức Bạc Thủ Công Phố Hội', desc: 'Dạo xem những chiếc vòng tay, hoa tai bạc chạm khắc hoa văn cúc đại đóa.', price: 'Miễn phí' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Làng Nón Lá Quỳ Hương Duy Xuyên', desc: 'Khám phá nghề chằm nón lá bài thơ duyên dáng truyền đời của phụ nữ xứ Quảng.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bún Cá Ngừ Đại Dương Thơm Cay', desc: 'Tô bún cá ngừ nấu dứa cà chua thơm ngọt nước dùng và miếng cá ngừ bùi béo.', price: '50.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Làm Gốm Men Hỏa Biến Tại Thanh Hà', desc: 'Tự tay tráng lớp men bí truyền và nung trong lò củi truyền thống của làng gốm.', price: '100.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Chụp Ảnh Kỷ Niệm Cùng Lồng Đèn Tơ Lụa', desc: 'Thả dáng bên những con hẻm rực rỡ hàng trăm chiếc lồng đèn lụa lung linh.', price: '30.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Thăm Xưởng Thêu Tay Nghệ Thuật Hội An', desc: 'Chiêm ngưỡng những bức tranh thêu phong cảnh phố cổ tinh xảo từng sợi chỉ tơ.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bánh Xèo Gạo Lứt Làng Rau Trà Quế', desc: 'Thưởng thức bánh xèo giòn thơm ăn cùng 9 loại rau thơm gia vị đặc hữu của làng rau.', price: '70.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Mua Quà Lưu Niệm Mây Tre & Đèn Lồng', desc: 'Đóng gói những món quà thủ công độc bản mang đậm dấu ấn làng nghề phố cổ.', price: '150.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Bữa Tiệc Tạm Biệt Bên Ánh Nến Sông Hoài', desc: 'Thưởng thức ly cocktail thảo mộc và ngắm nhìn dòng sông lấp lánh hoa đăng.', price: '100.000 đ' }
          ]
        }
      ],
      rationale: 'Tôn vinh những đôi bàn tay khéo léo gìn giữ tinh hoa di sản thủ công truyền thống Hội An.'
    }
  },
  saigon: {
    slow: {
      title: 'Sài Gòn — Dấu Ấn Di Sản Đô Thị & Góc Phố Xưa',
      costDay: 460000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 09:30', name: 'Cà Phê Bệt Nhà Thờ Đức Bà & Bưu Điện', desc: 'Ngắm đàn chim bồ câu bay rợp bóng nhà thờ cổ kính và kiến trúc Gothic Pháp tráng lệ.', price: '30.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '10:00 - 12:30', name: 'Bảo Tàng Mỹ Thuật TP.HCM', desc: 'Tòa dinh thự họ Hứa tráng lệ với cầu thang xoắn ốc và những ô cửa kính màu hoa lệ.', price: '30.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:00', name: 'Chợ Bến Thành & Thưởng Thức Bánh Xèo', desc: 'Dạo quanh các sạp hàng thủ công mỹ nghệ và thưởng thức bánh xèo giòn tan Nam Bộ.', price: '85.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Phố Đi Bộ Nguyễn Huệ & Hóng Gió Bạch Đằng', desc: 'Hòa mình vào nhịp sống trẻ trung và ngắm du thuyền sông Sài Gòn rực rỡ ánh đèn.', price: 'Miễn phí' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:00 - 09:00', name: 'Cà Phê Vợt Phan Đình Phùng Hơn 60 Năm', desc: 'Thưởng thức ly cà phê vợt thơm nồng rang củi gia truyền và nghe câu chuyện phố xá xưa.', price: '25.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '10:00 - 12:30', name: 'Thảo Cầm Viên Sài Gòn & Cây Cổ Thụ', desc: 'Dạo bước dưới những tán cây cổ thụ hàng trăm năm tuổi trong ốc đảo xanh giữa lòng thành phố.', price: '60.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:00', name: 'Ngồi Xe Buýt Sông Waterbus Ngắm Landmark', desc: 'Lướt sóng trên sông Sài Gòn từ bến Bạch Đằng đến bán đảo Thanh Đa lộng gió.', price: '30.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Cơm Tấm Ba Ghiền Sườn Cọng Nướng', desc: 'Dĩa cơm tấm sườn cọng khổng lồ ướp mật ong nướng than hoa thơm lừng góc phố.', price: '95.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 09:30', name: 'Dạo Hẻm Cổ Hào Sĩ Phường Quận 5', desc: 'Chiêm ngưỡng khu nhà chung cư phong cách người Hoa cổ kính độc nhất vô nhị.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Trưa', time: '10:30 - 12:30', name: 'Chè Nhà Đèn Hà Ký & Chùa Bà Thiên Hậu', desc: 'Thưởng thức chè quy linh cao, hột gà trà thảo mộc và chiêm bái ngôi chùa cổ 1760.', price: '45.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:00', name: 'Thăm Chùa Ngọc Hoàng (Phước Hải Tự)', desc: 'Ngôi chùa cổ linh thiêng nổi tiếng từng đón cựu Tổng thống Mỹ Barack Obama ghé thăm.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Tối', time: '19:00 - 21:30', name: 'Phòng Trà Đồng Dao & Đêm Nhạc Trịnh Ca', desc: 'Lắng nghe những tình khúc bất hủ trong không gian ấm cúng và đầy hoài niệm.', price: '180.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Tu Viện Thủ Thiêm Cổ Kính Bên Bờ Sông', desc: 'Thăm dòng tu nữ cổ nhất Việt Nam với hàng cây xanh mát và kiến trúc cổ thời Pháp.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Hủ Tiếu Sa Tế Cay Nồng Quận 5', desc: 'Tô hủ tiếu sền sệt béo bùi đậu phộng và vị cay tê nồng ấm của hơn 20 loại thảo mộc.', price: '65.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:00', name: 'Công Viên Bến Bạch Đằng & Cầu Ba Son', desc: 'Đi bộ trên cây cầu biểu tượng mới nối trung tâm quận 1 sang khu đô thị Thủ Thiêm.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Cà Phê Rooftop Ngắm Sài Gòn Lung Linh', desc: 'Nhâm nhi ly cocktail và ngắm nhìn nhịp xe cộ lấp lánh như những dòng ánh sáng.', price: '90.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:00', name: 'Phố Sách Nguyễn Văn Bình & Bánh Mì Hoà Mã', desc: 'Thưởng thức chảo trứng ốp la xúc xích nức tiếng từ 1958 và dạo qua hàng ngàn cuốn sách hay.', price: '75.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Lẩu Cá Kèo Rau Đắng Bà Huyện Thanh Quan', desc: 'Nồi lẩu chua thanh với cá kèo tươi rói và đĩa rau đắng, hoa chuối Nam Bộ.', price: '120.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Chợ Hoa Hồ Thị Kỷ & Mua Đặc Sản Làm Quà', desc: 'Ngắm muôn hoa khoe sắc và mua cơm cháy chà bông, bánh pía Sóc Trăng mang về.', price: '130.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Dạo Phố Tây Bùi Viện Nhộn Nhịp Về Đêm', desc: 'Khép lại chuyến đi Sài Gòn bằng không khí sôi động, âm nhạc đường phố rộn rã.', price: '80.000 đ' }
          ]
        }
      ],
      rationale: 'Lựa chọn các điểm đến giàu giá trị kiến trúc lịch sử, mang đến góc nhìn sâu sắc và chậm rãi về Hòn Ngọc Viễn Đông.'
    },
    foodie: {
      title: 'Sài Gòn — Thiên Đường Ẩm Thực Hào Sảng',
      costDay: 480000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Cà Phê Vợt Ba Lù & Hủ Tiếu Sa Tế Chợ Lớn', desc: 'Mùi cà phê thơm nức rang củi mộc mạc và tô hủ tiếu cay nồng chuẩn vị người Hoa.', price: '65.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '10:30 - 12:30', name: 'Hẻm Hào Sĩ Phường & Chè Nhà Đèn', desc: 'Chiêm ngưỡng kiến trúc nhà cổ người Hoa trăm tuổi và thưởng thức chè nhà đèn.', price: '35.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:30 - 17:30', name: 'Bánh Mì Huỳnh Hoa & Nước Mía Sầu Riêng', desc: 'Ổ bánh mì ngập tràn pate và chả lụa nức tiếng cùng ly nước mía mát lạnh sảng khoái.', price: '75.000 đ' },
            { slotLabel: 'Ăn Tối', time: '19:00 - 21:00', name: 'Phố Ốc Vĩnh Khánh & Dạo Bến Bạch Đằng', desc: 'Thưởng thức ốc len xào dừa, sò điệp mỡ hành và ngắm du thuyền sông Sài Gòn lộng lẫy.', price: '180.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Dimsum Tiến Phát Điểm Tâm Hồng Kông', desc: 'Xửng dimsum bốc khói với há cảo tôm tươi giòn, xíu mại và bánh bao kim sa béo ngậy.', price: '85.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Hủ Tiếu Nam Vang Nhân Quán Đậm Đà', desc: 'Tô hủ tiếu khô trộn nước sốt tỏi ớt đặc sánh kèm chén súp sườn sụn ngọt lịm.', price: '85.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Bánh Tráng Trộn & Trà Đào Nhà Hát Lớn', desc: 'Món ăn vặt quốc dân với bánh tráng dẻo, bò khô, xoài băm, trứng cút và rau răm.', price: '35.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Lẩu Bò Nhà Gỗ Sài Gòn Nóng Hổi', desc: 'Nồi lẩu bò thảo mộc đầy ắp bắp bò, gân bò mềm ngọt chấm chao béo cay nồng.', price: '160.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Bún Mắm Cô Ba Bạc Liêu Tôm Mực Heo Quay', desc: 'Tô bún mắm thơm lừng mùi mắm cá sặc ăn kèm đĩa rau đắng, bông súng, kèo nèo.', price: '75.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Bánh Mì Phá Lấu Chợ Bàn Cờ', desc: 'Chén phá lấu bò nước dừa béo ngậy chấm bánh mì giòn tan cay thơm mùi tắc ớt.', price: '45.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Chè Mâm 16 Món Đường Sư Vạn Hạnh', desc: 'Trải nghiệm mâm chè truyền thống Nam Bộ từ chè bà ba, chè chuối đến chè đậu trắng.', price: '60.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Đại Tiệc Cua Cà Mau & Bia Tươi Sài Gòn', desc: 'Thịt cua Cà Mau chắc nịch sốt me chua ngọt hoặc sốt tiêu đen cay nồng đậm vị.', price: '240.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Bún Bò Huế Út Hưng Chuẩn Vị Xưa', desc: 'Tô bún bò thơm nức mùi mắm ruốc Huế và sả tươi, giò heo mềm và chả cua thơm ngọt.', price: '65.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Cơm Gà Hải Nam Chợ Cũ Quận 1', desc: 'Hạt cơm nấu nước dùng gà béo ngậy ăn kèm thịt gà luộc chấm sốt gừng ớt bí truyền.', price: '75.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Bột Chiên Trứng Giòn Rụm Hải Ký', desc: 'Đĩa bột chiên vàng giòn bên ngoài, mềm bên trong ăn cùng đu đủ bào và nước tương chua.', price: '40.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Thiên Đường Hải Sản Đêm Cầu Bông', desc: 'Càng ghẹ rang muối ớt cay xé lưỡi, sò huyết cháy tỏi và lẩu thái chua cay đậm đà.', price: '170.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:30 - 09:00', name: 'Hủ Tiếu Mì Kéo Sợi Bằng Tay Thiệu Ký', desc: 'Quán mì gốc Hoa hơn 70 năm với sợi mì kéo thủ công dai ngon và sủi cảo tôm thịt.', price: '60.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Bánh Xèo Tôm Nhảy Rau Rừng Tây Ninh', desc: 'Bánh xèo giòn rụm cuốn hơn 10 loại lá rừng Tây Ninh chấm nước mắm tỏi ớt chua ngọt.', price: '85.000 đ' },
            { slotLabel: 'Xế Chiều', time: '14:30 - 16:30', name: 'Chè Thái Ý Phương Nguyễn Tri Phương', desc: 'Tô chè thái ngập tràn múi sầu riêng thơm nức, thạch dừa và nước cốt dừa béo bùi.', price: '40.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Lẩu Bò Cổ Truyền Hoàng Thu Chợ Lớn', desc: 'Nồi lẩu bò nghi ngút khói chấm tương đen và mua cơm cháy chà bông Sài Gòn làm quà.', price: '150.000 đ' }
          ]
        }
      ],
      rationale: 'Tái hiện chân thực bức tranh đa văn hóa rực rỡ và tính cách hiếu khách, phóng khoáng của đất Sài Gòn.'
    },
    culture: {
      title: 'Sài Gòn — Ký Ức Lịch Sử & Những Cột Mốc Thời Gian',
      costDay: 510000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Dinh Độc Lập (Hội Trường Thống Nhất)', desc: 'Chứng nhân lịch sử ngày non sông thu về một mối với hầm trú ẩn và kiến trúc độc đáo.', price: '65.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Cơm Tấm Ba Ghiền Sườn Cọng Khổng Lồ', desc: 'Dĩa cơm tấm sườn nướng mỡ hành trứng ốp la trứ danh đất Sài Gòn.', price: '90.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Bảo Tàng Chứng Tích Chiến Tranh', desc: 'Nơi lưu giữ những hình ảnh, hiện vật sống động về khát vọng hòa bình của dân tộc.', price: '40.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:00 - 20:30', name: 'Nhà Hát Thành Phố & Nhạc Kịch A O Show', desc: 'Thưởng thức xiếc tre nghệ thuật đương đại đậm đà văn hóa làng quê Nam Bộ.', price: '300.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Bảo Tàng Lịch Sử TP.HCM & Đền Hùng', desc: 'Khám phá nền văn minh Óc Eo, văn hóa Phù Nam và bộ sưu tập tượng Phật cổ Nam Bộ.', price: '30.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bún Chả Cá Quy Nhơn Sài Gòn', desc: 'Tô bún chả cá dai giòn nước dùng trong ngọt từ xương cá thu và cà chua dứa.', price: '55.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Chùa Bà Thiên Hậu & Hội Quán Nghĩa An', desc: 'Chiêm ngưỡng những bức phù điêu gốm Cây Mai tuyệt mỹ và thắp nhang vòng ước nguyện.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Múa Lân Sư Rồng Nghệ Thuật Chợ Lớn', desc: 'Thưởng thức màn trình diễn Mai Hoa Thung đỉnh cao của các đoàn lân danh tiếng.', price: '50.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 11:30', name: 'Địa Đạo Củ Chi — Thành Đồng Đất Thép', desc: 'Chui hầm địa đạo huyền thoại dài hơn 250km được đào thủ công trong chiến tranh.', price: '125.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '12:00 - 13:30', name: 'Khoai Mì Chấm Muối Mè & Bò Tơ Củ Chi', desc: 'Món ăn kháng chiến dân dã và đĩa bò tơ nướng bánh tráng rau rừng tươi ngon.', price: '120.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 16:30', name: 'Bến Nhà Rồng — Bảo Tàng Hồ Chí Minh', desc: 'Nơi người thanh niên Nguyễn Tất Thành ra đi tìm đường cứu nước năm 1911.', price: '20.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Nghe Đờn Ca Tài Tử Trên Sông Sài Gòn', desc: 'Lắng nghe những điệu dạ cổ hoài lang mượt mà trôi trên dòng sông đêm.', price: '150.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 10:30', name: 'Lăng Ông Bà Chiểu (Đền Thờ Tả Quân Lê Văn Duyệt)', desc: 'Ngôi miếu thờ linh thiêng bậc nhất Gia Định với kiến trúc cung đình rồng phượng cổ.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Cơm Niêu Sài Gòn Đập Nồi Nghệ Thuật', desc: 'Trải nghiệm màn tung hứng niêu cơm cháy giòn rụm chấm cá kho tộ đậm đà.', price: '130.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Chùa Giác Lâm — Ngôi Chùa Cổ Nhất TP.HCM', desc: 'Ngôi chùa cổ xây dựng năm 1744 lưu giữ 113 pho tượng gỗ cổ quý giá.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Dạo Phố Trưng Bày Đồ Cổ Lê Công Kiều', desc: 'Chiêm ngưỡng những món đồ đồng, gốm sứ thời Nguyễn và đồ cổ thời Pháp.', price: 'Miễn phí' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 10:30', name: 'Nhà Thờ Tân Định Màu Hồng Tráng Lệ', desc: 'Chiêm ngưỡng kiến trúc Gothic kết hợp Roman tuyệt đẹp với sắc hồng lãng mạn.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Bánh Mì Bò Kho Cô Mai Từ Năm 1984', desc: 'Tô bò kho thơm lừng hoa hồi thảo quả, thịt bò gân mềm chấm bánh mì giòn tan.', price: '55.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Chợ Lớn Bình Tây & Mua Đặc Sản Miền Nam', desc: 'Khám phá ngôi chợ trung tâm giao thương sầm uất mang đậm kiến trúc Á Đông.', price: '120.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Trà Thảo Mộc Ngắm Cầu Ánh Sao', desc: 'Khép lại chuyến đi di sản tại hồ Bán Nguyệt lộng gió ánh đèn lung linh.', price: '60.000 đ' }
          ]
        }
      ],
      rationale: 'Bức tranh toàn cảnh về những thăng trầm lịch sử và sức sống mãnh liệt của thành phố mang tên Bác.'
    },
    craft: {
      title: 'Sài Gòn — Nét Nghề Thủ Công Ẩn Giữa Phố Thị',
      costDay: 540000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 10:30', name: 'Làng Đúc Đồng An Hội Gò Vấp', desc: 'Lắng nghe tiếng đe búa trăm năm gìn giữ nghề đúc lư đồng thờ phụng truyền thống.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Hủ Tiếu Nam Vang Nhân Quán', desc: 'Tô hủ tiếu khô với tôm thịt tươi ngon và nước súp hầm xương đậm đà.', price: '85.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Workshop Làm Nến & Xà Phòng Thảo Mộc', desc: 'Tự tay phối trộn tinh dầu sả chanh, quế chi và thảo dược thiên nhiên thành phẩm.', price: '150.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Trà Đạo Nam Bộ & Nghe Đờn Ca Tài Tử', desc: 'Không gian trà thanh tịnh hòa trong tiếng đờn kìm, đờn tranh mượt mà sâu lắng.', price: '90.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Phố Lồng Đèn Truyền Thống Lương Nhữ Học', desc: 'Khám phá nghề làm lồng đèn kính và lồng đèn giấy xếp truyền thống của người Hoa.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bánh Bao Cả Cần Chợ Lớn Nóng Hổi', desc: 'Chiếc bánh bao bột mềm thơm lừng ngập nhân thịt xá xíu trứng muối.', price: '45.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Workshop Làm Gốm Thủ Công Sài Gòn', desc: 'Tự tay nhào đất sét, tạo hình chiếc đĩa gốm mộc mạc và vẽ họa tiết mang về.', price: '140.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thăm Xưởng Sơn Mài Mỹ Đức Cổ Truyền', desc: 'Tìm hiểu quy trình cẩn ốc xà cừ và đánh bóng sơn mài truyền thống Nam Bộ.', price: '60.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Làng Dệt Chiếu Bình An Quận 8', desc: 'Xem các nghệ nhân dệt chiếu lác bằng khung dệt tay gỗ truyền thống ven kênh.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Hủ Tiếu Dê Cổ Truyền Thuận Ký', desc: 'Tô hủ tiếu thịt dê mềm thơm hầm thuốc bắc bồi bổ sức khỏe và tăng năng lượng.', price: '95.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Workshop Chế Tác Đồ Da Thủ Công', desc: 'Tự tay đục lỗ, khâu chỉ tay và dập tên lên chiếc ví da bò thật làm kỷ niệm.', price: '180.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Thức Cà Phê Pha Thủ Công Specialty', desc: 'Khám phá phương pháp Pour Over hạt cà phê Arabica Cầu Đất nguyên chất.', price: '65.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Xưởng Chạm Khắc Gỗ & Điêu Khắc Tượng Cổ', desc: 'Chiêm ngưỡng những bức tượng gỗ phong thủy chạm khắc rồng phượng sống động.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Cơm Tấm Sườn Non Nướng Than Đêm', desc: 'Dĩa cơm tấm sườn mềm mỡ hành thơm phức và chén canh khổ qua nhồi thịt.', price: '65.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Workshop Khảm Tranh Gỗ Mỹ Nghệ', desc: 'Học cách ghép từng mảnh gỗ màu tự nhiên thành bức tranh phong cảnh Sài Gòn.', price: '120.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Dạo Phố Thuốc Bắc Hải Thượng Lãn Ông', desc: 'Hít thở mùi hương thơm thanh của thảo mộc và mua trà sâm bí đao bồi bổ cơ thể.', price: '40.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Làng Trồng Mai Vàng Thủ Đức', desc: 'Thăm những vườn mai vàng trăm tuổi và học kỹ thuật uốn cành bonsai nghệ thuật.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Lẩu Gà Ớt Hiểm Thơm Cay Nồng Nàn', desc: 'Nồi lẩu gà tiềm ớt hiểm xanh cay thơm thanh ngọt cùng nấm tuyết và mồng tơi.', price: '130.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Mua Tranh Sơn Mài & Đồ Thủ Công Làm Quà', desc: 'Chọn những bức tranh sơn mài hoa sen và đồ thủ công mây tre mang về tặng bạn bè.', price: '160.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Khép Lại Hành Trình Thủ Công Mỹ Nghệ Sài Gòn', desc: 'Thưởng thức bánh flan dừa và nhấp ngụm trà sen chia tay thành phố phương Nam.', price: '45.000 đ' }
          ]
        }
      ],
      rationale: 'Khám phá những xưởng nghề mộc mạc âm thầm gìn giữ tinh hoa giữa lòng đô thị phồn hoa.'
    }
  },
  dalat: {
    slow: {
      title: 'Đà Lạt — Săn Mây Đồi Chè & Cà Phê Rừng Thông',
      costDay: 550000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Bình Minh', time: '05:30 - 07:30', name: 'Đón Bình Minh Săn Mây Cầu Đất', desc: 'Biển mây bồng bềnh phủ quanh những đồi chè xanh ngát trong làn sương sớm cao nguyên.', price: '50.000 đ' },
            { slotLabel: 'Điểm Tâm', time: '08:30 - 10:30', name: 'Bánh Mì Xíu Mại Hoàng Diệu & Sữa Đậu Nành', desc: 'Chén xíu mại nóng hổi bốc khói xua tan cái se lạnh của phố núi Đà Lạt.', price: '45.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 17:00', name: 'Nhâm Nhi Cà Phê Mộc Trong Rừng Thông', desc: 'Lắng nghe tiếng thông reo và thưởng thức hạt cà phê Arabica Cầu Đất hảo hạng.', price: '65.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Chợ Đêm Đà Lạt & Bánh Tráng Nướng', desc: 'Dạo bước chợ Âm Phủ, thưởng thức pizza Việt Nam giòn béo và ly sữa nóng Tăng Bạt Hổ.', price: '70.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '06:30 - 09:00', name: 'Dạo Bộ Hồ Tuyền Lâm Sáng Sớm Tĩnh Lặng', desc: 'Mặt hồ phẳng lặng như gương soi bóng rặng thông mờ sương và tiếng chuông thiền viện ngân nga.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Bánh Căn Dốc Nhà Bò Trứng Cút Lòng Đào', desc: 'Bánh căn nướng giòn rụm trong khuôn đất chấm mắm mỡ hành và xíu mại cay tê đầu lưỡi.', price: '50.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 17:00', name: 'Cắm Trại Rừng Thông & Đọc Sách Thư Giãn', desc: 'Trải tấm thảm nhỏ dưới tán thông, thưởng thức trà atiso và hít thở tinh dầu thông trong lành.', price: '60.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Lẩu Gà Lá É Tao Ngộ Quán Cũ Nóng Hổi', desc: 'Nồi lẩu gà chua cay the the của lá é và măng non xua tan sương lạnh đêm phố núi.', price: '130.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Thăm Đồi Chè Cổ Cầu Đất 100 Năm Tuổi', desc: 'Chiêm ngưỡng những cây chè cổ thụ xanh mướt và nhà máy chế biến chè cổ nhất Đông Dương.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Cơm Lam Gà Nướng Bản Địa', desc: 'Gà đồi nướng mọi than hoa da giòn thịt ngọt chấm muối ớt xanh và ống cơm lam thơm dẻo.', price: '140.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:00', name: 'Vườn Cẩm Tú Cầu & Nghe Nhạc Mây Lang Thang', desc: 'Lắng nghe những giai điệu acoustic mộc mạc khi hoàng hôn buông xuống thung lũng sương mù.', price: '180.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Ốc Bươu Nhồi Thịt Hai Bà Trưng', desc: 'Thố ốc bươu nhồi thịt bốc khói ngào ngạt mùi sả gừng chấm nước mắm gừng ớt cay nồng.', price: '90.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '06:00 - 09:00', name: 'Săn Sương Sớm Đỉnh Pinhatt Hùng Vĩ', desc: 'Trekking nhẹ lên đỉnh núi ngắm trọn vẹn toàn cảnh hồ Tuyền Lâm và thung lũng Đà Lạt.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bánh Ướt Lòng Gà Trang Bùi Thị Xuân', desc: 'Đĩa bánh ướt mềm mượt với thịt gà xé, lòng heo giòn sần sật và nước mắm chua ngọt.', price: '55.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Vườn Hồng Treo Gió Công Nghệ Nhật Bản', desc: 'Chiêm ngưỡng hàng ngàn trái hồng vàng ươm treo lơ lửng và thưởng thức vị ngọt dẻo tự nhiên.', price: '60.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Lẩu Bò Ba Toa Quán Gỗ Đậm Đà', desc: 'Từng miếng nạm bò, gân bò mềm thơm trong nồi lẩu thảo quả bốc khói ấm áp.', price: '150.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Vườn Thảo Dược & Tự Tay Hái Dâu Tây', desc: 'Hái những trái dâu tây giống New Zealand chín mọng đỏ rực ngay tại luống dâu thủy canh.', price: '80.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Lẩu Rau Không Giới Hạn Đồi Robin', desc: 'Thưởng thức hơn 20 loại rau tươi giòn ngọt đặc sản nông nghiệp công nghệ cao Đà Lạt.', price: '110.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Mua Mứt Dâu & Trà Atiso Làm Quà', desc: 'Chọn những gói trà atiso túi lọc, rượu vang Đà Lạt và mứt dâu tằm về tặng người thân.', price: '160.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Cà Phê Thung Lũng Đèn & Ngắm Đêm Đà Lạt', desc: 'Chiêm ngưỡng biển ánh sáng lung linh từ hàng ngàn nhà kính trồng hoa bừng sáng trong đêm.', price: '65.000 đ' }
          ]
        }
      ],
      rationale: 'Giúp bạn phục hồi năng lượng giữa thiên nhiên trong lành và tận hưởng nhịp sống chậm rãi đặc trưng.'
    },
    foodie: {
      title: 'Đà Lạt — Ẩm Thực Phố Núi Thơm Nồng Ngày Đông',
      costDay: 520000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Bánh Căn Lệ Dốc Nhà Bò Giòn Rụm', desc: 'Bánh căn trứng cút lòng đào chấm mắm nêm xíu mại cay tê đầu lưỡi.', price: '45.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Lẩu Gà Lá É Tao Ngộ Quán Cũ', desc: 'Nồi lẩu bốc khói nghi ngút với vị chua cay thanh mát của lá é vùng cao.', price: '120.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Kem Bơ Thanh Thảo & Bánh Ướt Lòng Gà', desc: 'Vị bơ sáp béo ngậy dầm dừa nạo và đĩa bánh ướt lòng gà chua ngọt thanh tao.', price: '55.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Lẩu Bò Ba Toa Quán Gỗ Trứ Danh', desc: 'Từng miếng thịt bò nạm, gân mềm ngọt trong nước lẩu thảo quả đậm đà.', price: '150.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Bánh Mì Xíu Mại Chấm Cô Sương', desc: 'Bát xíu mại ngập sốt ớt cay với bì heo dai giòn ăn cùng bánh mì nóng hổi giòn tan.', price: '40.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Nem Nướng Bà Hùng Nước Sốt Đậu Phộng', desc: 'Từng xiên nem nướng than hoa cuốn bánh tráng ram bắp chấm nước sốt gan heo béo bùi.', price: '65.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Chè Hé Đường Ba Tháng Hai', desc: 'Bát chè trôi nước gừng nóng, chè thưng béo ngậy trong không gian quán cửa chỉ mở hé.', price: '25.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Đồ Nướng Ngói BBQ Khói Nghi Ngút', desc: 'Thịt bò cuộn nấm kim châm, sườn heo ướp ngũ vị nướng trên miếng ngói đất nung xì xèo.', price: '160.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Bánh Canh Xuân An Chả Cá Thu', desc: 'Tô bánh canh bột gạo chả cá dai ngọt nước dùng ninh xương đậm đà bốc khói thơm phức.', price: '50.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Cơm Gà Nướng Cơm Lam Suối Mơ', desc: 'Thịt gà ta thả đồi ướp lá mắc mật nướng than hoa thơm lừng chấm muối ớt hiểm.', price: '140.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Bánh Tráng Nướng Dì Đinh Đủ Vị', desc: 'Bánh tráng nướng mỡ hành, trứng cút, phô mai dẻo béo và khô bò cay rộp rộp.', price: '35.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Lẩu Mực Khổng Lồ Đại Lãnh', desc: 'Con mực trứng to bằng bắp tay nhúng trong nước lẩu măng chua cay thơm ngát.', price: '180.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Hủ Tiếu Mì Tàu Cao Đậm Đà Khói Tỏa', desc: 'Tô mì sợi vàng dai với hoành thánh tôm thịt béo ngậy và tóp mỡ hành phi thơm nức mũi.', price: '55.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Canh Atiso Hầm Giò Heo & Cơm Niêu', desc: 'Bông atiso tươi ngọt thanh hầm cùng giò heo mềm rục bồi bổ sức khỏe tuyệt vời.', price: '110.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Kem Trái Cây Nước Cốt Dừa Phố Núi', desc: 'Đĩa trái cây tươi dầm kem dừa béo ngậy với bơ sáp, dâu tây và mít thơm ngọt.', price: '45.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Sữa Đậu Nành Nóng & Bánh Ngọt Tăng Bạt Hổ', desc: 'Ly sữa đậu nành bò nóng hổi ăn kèm bánh sừng bò, bánh tiêu giòn tan đêm lạnh.', price: '35.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:30 - 09:00', name: 'Bún Bò Thố Đá Nóng Sôi Sùng Sục', desc: 'Tô bún bò thố đá giữ nhiệt sôi ùng ục với thịt bò tái ngọt mềm và gân bò dai giòn.', price: '75.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Bánh Bèo Số 4 Bà Hường Nước Mắm Kẹo', desc: 'Đĩa bánh bèo nhân tôm thịt sệt sệt rắc tóp mỡ giòn rụm chan nước mắm chua ngọt.', price: '45.000 đ' },
            { slotLabel: 'Xế Chiều', time: '14:30 - 16:30', name: 'Thưởng Trà Ô Long & Mứt Mận Cầu Đất', desc: 'Tách trà ô long thơm ngát hậu ngọt nhâm nhi cùng mứt mận dẻo chua ngọt.', price: '50.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Đại Tiệc Buffet Rau Leguda Đồi Robin', desc: 'Ăn rau tươi thỏa thích ngắm toàn cảnh thành phố sương mù lung linh ánh đèn đêm.', price: '130.000 đ' }
          ]
        }
      ],
      rationale: 'Tuyển tập những món ăn nóng hổi làm say đắm mọi tín đồ ẩm thực trong không khí se lạnh cao nguyên.'
    },
    culture: {
      title: 'Đà Lạt — Dấu Ấn Hoàng Triều & Kiến Trúc Di Sản',
      costDay: 530000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Dinh III Vua Bảo Đại Giữa Rừng Thông', desc: 'Biệt điện nghỉ dưỡng hoàng gia cuối cùng của vị hoàng đế triều Nguyễn với nội thất Pháp sang trọng.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Ga Đà Lạt & Tàu Hỏa Răng Cưa Cổ', desc: 'Nhà ga cổ đẹp nhất Đông Dương với kiến trúc 3 mái chóp mô phỏng đỉnh Langbiang.', price: '30.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Thiền Viện Trúc Lâm & Đi Cáp Treo Đồi Robin', desc: 'Ngắm toàn cảnh hồ Tuyền Lâm phẳng lặng như gương soi và rừng thông bạt ngàn.', price: '100.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:00 - 20:30', name: 'Giao Lưu Văn Hóa Cồng Chiêng Tây Nguyên', desc: 'Uống rượu cần, ăn thịt nướng và hòa nhịp cùng điệu múa của đồng bào K\'Ho dưới chân núi.', price: '160.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Biệt Điện Trần Lệ Xuân (Mộc Bản Triều Nguyễn)', desc: 'Khám phá khối di sản tư liệu thế giới Mộc bản triều Nguyễn và hồ nước hình bản đồ Việt Nam.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Cơm Niêu Như Ngọc Đà Lạt', desc: 'Bữa cơm truyền thống ấm cúng với cá lóc kho tộ và canh chua bông so đũa.', price: '95.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Trường Cao Đẳng Sư Phạm Kiến Trúc Pháp', desc: 'Tháp chuông cong tuyệt mỹ bằng gạch đỏ rực rỡ xây dựng từ năm 1927 bởi kiến trúc sư Pháp.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Nhà Thờ Domaine de Marie Màu Hồng Cổ Kính', desc: 'Chiêm ngưỡng kiến trúc nhà rông Tây Nguyên cách điệu phủ màu sơn hồng tươi tắn.', price: 'Miễn phí' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Dinh I Vua Bảo Đại Phong Cách Tân Cổ Điển', desc: 'Tòa dinh thự lộng lẫy giữa rừng tràm cổ thụ với đường hầm bí mật xuyên qua đồi thông.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Canh Atiso Hầm Giò Heo & Cơm Gia Đình', desc: 'Thưởng thức món canh hoa atiso bổ dưỡng ngọt thanh đặc sản nổi tiếng Đà Lạt.', price: '100.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Nhà Thờ Con Gà (Chánh Tòa Đà Lạt)', desc: 'Công trình kiến trúc Roman tiêu biểu có chú gà trống bằng đồng đứng trên đỉnh tháp chuông.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Trà Cung Đình Ngắm Đêm Đà Lạt', desc: 'Nhấp ngụm trà cung đình thơm mùi thảo dược và lắng nghe giai điệu dạ khúc du dương.', price: '55.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 11:30', name: 'Làng Dân Tộc Cổ Lát & Đỉnh Langbiang', desc: 'Chinh phục đỉnh núi huyền thoại tình yêu chàng K\'Lang và nàng H\'Biang bằng xe jeep.', price: '120.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '12:00 - 13:30', name: 'Cơm Lam Thịt Xiên Nướng Rừng Cao Nguyên', desc: 'Ống nứa nướng thơm mùi nếp nương ăn kèm thịt xiên rừng ướp hạt dổi cay thơm.', price: '110.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 16:30', name: 'Thăm Bảo Tàng Lâm Đồng & Nhà Rông Tây Nguyên', desc: 'Tìm hiểu di chỉ khảo cổ Cát Tiên và bộ sưu tập đàn đá ngàn năm tuổi của đồng bào.', price: '30.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Rượu Cần Bên Đống Lửa Rừng Già', desc: 'Uống từng ngụm rượu cần ngọt thơm qua cần trúc và nghe các già làng kể sử thi Đăm San.', price: '100.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 10:30', name: 'Tu Viện Franciscaines Cổ Kính Bí Ẩn', desc: 'Khám phá công trình tu viện kiến trúc Pháp cổ kính phủ đầy rêu phong huyền bí.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Lẩu Bò Sa Tế Phố Núi Thơm Ngon', desc: 'Nồi lẩu bò thơm nồng mùi quế hồi và rau cải non ngọt lịm đặc sản địa phương.', price: '130.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Mua Đặc Sản Trà Atiso & Mứt Dâu Tây', desc: 'Đóng gói các món quà đặc trưng của xứ sở ngàn hoa để mang về tặng người thân.', price: '150.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Tạm Biệt Thành Phố Ngàn Hoa Sương Mù', desc: 'Ngắm nhìn lần cuối thung lũng ánh đèn lung linh và hẹn ngày trở lại phố núi.', price: '40.000 đ' }
          ]
        }
      ],
      rationale: 'Khám phá sự giao thoa độc đáo giữa lịch sử triều Nguyễn, di sản kiến trúc Đông Dương và văn hóa cội nguồn bản địa.'
    },
    craft: {
      title: 'Đà Lạt — Nghệ Thuật Thêu Tay & Làng Hoa Truyền Thống',
      costDay: 580000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'XQ Sử Quán — Đỉnh Cao Tranh Thêu Tay', desc: 'Chiêm ngưỡng những tác phẩm thêu tơ tằm tinh xảo và tìm hiểu triết lý của nghệ nhân thêu.', price: '100.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Cơm Niêu Hương Trà & Canh Atiso Hầm', desc: 'Thưởng thức canh hoa atiso bổ dưỡng ngọt thanh đặc sản nổi tiếng Đà Lạt.', price: '110.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Làng Hoa Vạn Thành & Vườn Dâu Tự Hái', desc: 'Tìm hiểu kỹ thuật trồng hoa hồng, cúc mẫu đơn và tự tay hái những trái dâu tây đỏ mọng.', price: '80.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thăm Hầm Rượu Vang Nho & Thử Rượu Vang', desc: 'Khám phá quy trình ủ men vang nho truyền thống trong hầm đá phong cách châu Âu.', price: '90.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Làng Nghề Làm Hồng Treo Gió Cầu Đất', desc: 'Học cách gọt vỏ, khử trùng và treo từng trái hồng theo công nghệ Hoshigaki Nhật Bản.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bún Bò Giò Heo Nước Dùng Thảo Quả', desc: 'Tô bún bò nóng hổi thơm nức mùi sả thơm ngọt với khoanh giò heo mềm ngậy.', price: '55.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Xưởng Cà Phê Specialty & Thử Nếm Cupping', desc: 'Trải nghiệm quy trình rang xay hạt Arabica Cầu Đất và phân biệt các tầng hương vị hoa quả.', price: '120.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Workshop Tự Làm Nến Thơm Tinh Dầu Thông', desc: 'Tự tay đúc cốc nến thơm từ sáp đậu nành thiên nhiên hòa quyện tinh dầu thông núi.', price: '110.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Làng Dệt Thổ Cẩm K\'Ho Lạc Dương', desc: 'Tận mắt xem các nghệ nhân dệt từng sợi chỉ bông nhuộm vỏ cây thành tấm chăn thổ cẩm.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Cơm Lam Thịt Heo Bản Nướng Mắc Mật', desc: 'Thịt heo mọi nướng lá mắc mật giòn rụm ăn cùng cơm lam dẻo thơm hạt ngọc trời.', price: '120.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Làng Trồng Đông Trùng Hạ Thảo & Nấm Linh Chi', desc: 'Khám phá quy trình nuôi cấy nấm dược liệu công nghệ cao tại cao nguyên Lâm Đồng.', price: '60.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Workshop Cắm Hoa Khô & Trang Trí Khung Tranh', desc: 'Sáng tạo bức tranh hoa bất tử rực rỡ sắc màu giữ được vẻ đẹp vĩnh cửu theo thời gian.', price: '90.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Làng Gốm Chuông Gió Xứ Sương Mù', desc: 'Tự tay nặn chiếc chuông gió bằng đất sét nung và vẽ họa tiết hoa dã quỳ lên bề mặt.', price: '70.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bánh Mì Bơ Tỏi Nướng Giòn & Súp Cua', desc: 'Bánh mì nướng bơ tỏi thơm ngào ngạt ăn kèm chén súp cua nóng hổi béo ngậy.', price: '50.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Xưởng Chưng Cất Tinh Dầu Oải Hương', desc: 'Khám phá cánh đồng hoa lavender tím ngắt và quy trình chiết xuất tinh dầu nguyên chất.', price: '80.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Trà Hoa Cúc Mật Ong & Mua Quà', desc: 'Chọn mua những bó hoa sấy khô nghệ thuật và lọ tinh dầu thảo mộc mang về.', price: '130.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Làng Hoa Thái Phiên — Thủ Phủ Hoa Cúc', desc: 'Dạo quanh hàng trăm nhà kính rực rỡ hoa cúc đại đóa, hoa đồng tiền và hoa lyly.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Lẩu Bò Nồi Đất Phố Núi', desc: 'Nồi lẩu bò ninh củi thơm phức mùi gừng quế ấm áp cho bữa trưa cuối cùng tại Đà Lạt.', price: '140.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Mua Rượu Vang & Mứt Trái Cây Đà Lạt', desc: 'Đóng gói những chai rượu vang nho hảo hạng và mứt dâu tây làm quà lưu niệm.', price: '180.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Tạm Biệt Làng Nghề Thủ Công Cao Nguyên', desc: 'Nhâm nhi tách cà phê sữa nóng cuối cùng trước khi khởi hành về thành phố.', price: '45.000 đ' }
          ]
        }
      ],
      rationale: 'Trải nghiệm trực tiếp những nghề thủ công và nông nghiệp hoa - quả danh tiếng làm nên thương hiệu xứ sương mù.'
    }
  },
  sapa: {
    slow: {
      title: 'Sa Pa — Thung Lũng Sương Mờ & Nghỉ Dưỡng An Yên',
      costDay: 590000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 09:30', name: 'Cà Phê Ngắm Mây Thung Lũng Mường Hoa', desc: 'Thả hồn ngắm mây trôi bồng bềnh phủ kín ruộng bậc thang và đỉnh núi Fansipan hùng vĩ.', price: '60.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '10:00 - 12:30', name: 'Dạo Bước Nhà Thờ Đá Cổ & Hồ Sa Pa', desc: 'Công trình đá kiến trúc Gothic La Mã xây dựng từ năm 1895 giữa trung tâm thị trấn.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:30', name: 'Tắm Lá Thuốc Người Dao Đỏ Tả Phìn', desc: 'Ngâm bồn gỗ pơ mu với hơn 30 loại thảo dược quý giúp giải tỏa hoàn toàn mệt mỏi.', price: '150.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Sưởi Ấm Bên Bếp Lửa & Ăn Đồ Nướng Bản', desc: 'Ngồi quây quần bên bếp than hồng nướng cơm lam, ngô nếp và trứng gà so thơm lừng.', price: '100.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '06:00 - 09:00', name: 'Đón Bình Minh Trên Đèo Ô Quy Hồ', desc: 'Chiêm ngưỡng biển mây cuồn cuộn trên tứ đại đỉnh đèo hùng vĩ bậc nhất miền Bắc.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:00 - 12:30', name: 'Bánh Cuốn Trứng Vùng Cao Nóng Hổi', desc: 'Đĩa bánh cuốn tráng mỏng nhân trứng lòng đào chấm bát nước xương hầm nóng hổi.', price: '45.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 17:00', name: 'Dạo Thác Bạc & Thác Tình Yêu Hùng Vĩ', desc: 'Ngắm dải lụa trắng xóa đổ từ độ cao 200m giữa rừng quốc gia Hoàng Liên xanh ngút ngàn.', price: '75.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Lẩu Cá Hồi Thác Bạc Tươi Rói', desc: 'Từng lát cá hồi đỏ au nhúng lẩu chua cay măng rừng và đọt su su non giòn ngọt.', price: '180.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 11:00', name: 'Trekking Nhẹ Thung Lũng Séo Mý Tỷ', desc: 'Khám phá hồ nước nhân tạo cao nhất Việt Nam trong vắt phản chiếu núi rừng đại ngàn.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Cơm Lam Thịt Lợn Bản Nướng Than Củi', desc: 'Ống cơm lam dẻo quánh chấm muối vừng ăn kèm thịt lợn cắp nách nướng lá mắc khén.', price: '120.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 17:00', name: 'Tắm Suối Nước Nóng Tự Nhiên Nậm Cang', desc: 'Thư giãn ngâm mình trong dòng suối khoáng nóng tự nhiên giữa thung lũng nguyên sơ.', price: '80.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Lẩu Gà Đen Hầm Thuốc Bắc Bản Làng', desc: 'Món gà đen bổ dưỡng hầm cùng nấm linh chi và thảo dược rừng Hoàng Liên Sơn.', price: '160.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 10:00', name: 'Ngắm Ruộng Bậc Thang Tả Van Từ Chòi Gỗ', desc: 'Nhâm nhi tách cà phê nóng ngắm nhìn những sóng lúa vàng uốn lượn theo triền núi.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Phở Gà Đồi Bắc Hà Thơm Nức Mùi Thảo Quả', desc: 'Tô phở gà đồi sợi phở mềm dai nước dùng ninh thảo quả thơm ngát xua tan sương mù.', price: '55.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Ngâm Chân Thảo Mộc Cùng Đồng Bào Bản', desc: 'Bồn ngâm chân nước nóng nấu từ rễ cây thuốc rừng giúp khí huyết lưu thông sảng khoái.', price: '60.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Uống Trà Gừng Nóng & Nướng Bắp Ngô Đêm', desc: 'Quây quần bên lò sưởi ấm cúng trò chuyện cùng người bản địa về cuộc sống vùng cao.', price: '45.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Thăm Bản Suối Thầu Hoang Sơ Tuyệt Mỹ', desc: 'Ngắm cánh đồng tam giác mạch bung nở rực rỡ và những mái nhà gỗ đơn sơ trong sương.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Lẩu Cá Tầm Suối Nấu Măng Cay', desc: 'Thịt cá tầm sụn giòn ngọt béo ngậy nhúng trong nồi nước lẩu chua cay đậm đà.', price: '190.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Mua Măng Rừng & Mật Ong Bạc Hà Về Xuôi', desc: 'Chọn những can mật ong hoa rừng nguyên chất và túi nấm hương rừng khô thơm phức.', price: '180.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Tạm Biệt Sa Pa Thành Phố Trong Mây', desc: 'Hít căng lồng ngực bầu không khí trong lành của đại ngàn trước khi lên tàu về Hà Nội.', price: '30.000 đ' }
          ]
        }
      ],
      rationale: 'Hành trình thanh lọc tâm hồn, hít thở bầu không khí tinh khiết và phục hồi năng lượng giữa đại ngàn.'
    },
    foodie: {
      title: 'Sa Pa — Tinh Hoa Ẩm Thực Vùng Cao Đại Ngàn',
      costDay: 630000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Phở Chua Bắc Hà & Bánh Cuốn Nóng', desc: 'Món phở chua thanh mát với thịt xá xíu thơm lừng và đậu phộng giòn bùi.', price: '50.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:30', name: 'Thắng Cố Ngựa A Quỳnh & Rượu Ngô', desc: 'Nồi thắng cố truyền thống nấu từ hạt dổi, quế, thảo quả ngào ngạt hương vị núi rừng.', price: '160.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Xôi Bảy Màu Nương Rẫy & Trâu Gác Bếp', desc: 'Hạt nếp nương dẻo quánh nhuộm màu tự nhiên từ lá rừng ăn kèm thịt trâu cay thơm nồng.', price: '90.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Lẩu Cá Tầm & Cá Hồi Suối Sapa', desc: 'Thịt cá tầm giòn ngọt nhúng trong nước lẩu măng chua cùng đọt su su non tươi giòn.', price: '190.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Bánh Ngô Nướng & Trứng Nướng Than', desc: 'Bánh ngô nếp nướng thơm dẻo béo bùi và quả trứng gà so nướng muối tiêu chanh ấm nóng.', price: '35.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Lợn Cắp Nách Quay Giòn Bì Rượu San Lùng', desc: 'Miếng thịt lợn bản quay da giòn tan như bánh phồng tôm chấm muối tiêu chanh ớt.', price: '150.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Hạt Dẻ Rừng Nướng Nóng Hổi Bờ Hồ', desc: 'Túi hạt dẻ nướng nứt vỏ thơm lừng vàng ươm bùi ngậy vừa đi dạo vừa thưởng thức.', price: '40.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Lẩu Gà Đen Hầm Nấm Rừng Tươi Roi Rói', desc: 'Nồi lẩu gà đen xương đen ninh nấm hương rừng tươi và rau cải mèo đắng ngọt.', price: '170.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:30 - 08:45', name: 'Cơm Lam Nướng Ống Nứa Muối Vừng', desc: 'Ống nứa non nướng đều trên than củi, hạt nếp dẻo thơm nức mùi tre non.', price: '30.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Thịt Lợn Gác Bếp Xào Cải Mèo Đắng Thanh', desc: 'Vị đậm đà của thịt hun khói củi hòa quyện cùng vị đắng thanh của rau cải mèo rừng.', price: '110.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Thắng Dền Nóng Nổi Danh Phố Núi', desc: 'Bát bánh trôi vùng cao nấu nước gừng cay nóng, rắc đậu phộng rang và vừng thơm lừng.', price: '30.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Cá Suối Mường Hoa Nướng Than Củi', desc: 'Những con cá suối nhỏ bằng ngón tay nướng giòn rụm cả xương chấm mắm tỏi ớt gừng.', price: '130.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:00 - 08:30', name: 'Phở Bò Vùng Cao Nước Dùng Thảo Quả', desc: 'Bát phở bò nóng hổi với thịt bò tái tươi ngon và nước dùng thơm ngát thảo quả rừng.', price: '55.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Thịt Trâu Nhúng Mẻ Mắc Khén Đậm Vị', desc: 'Từng lát thịt trâu tươi mềm nhúng nước mẻ chua thanh thơm lừng hạt mắc khén.', price: '140.000 đ' },
            { slotLabel: 'Xế Chiều', time: '15:00 - 16:30', name: 'Rượu Mận Bắc Hà & Đồ Nướng Chợ Đêm', desc: 'Nhấp ngụm rượu mận chua ngọt và thưởng thức xiên nấm kim châm cuộn thịt heo.', price: '80.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Đại Tiệc Nướng Than Hoa Tây Bắc', desc: 'Xiên thịt bò cuốn cải mèo nướng, dạ dày nướng sa tế và khoai lang nướng than hồng.', price: '150.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Điểm Tâm', time: '07:30 - 09:00', name: 'Xôi Nếp Nương Gà Đồi Hấp Lá Chanh', desc: 'Hạt xôi dẻo thơm ăn kèm thịt gà đồi xé phay chấm muối ớt chanh cay nồng.', price: '50.000 đ' },
            { slotLabel: 'Ăn Trưa', time: '11:30 - 13:00', name: 'Canh Rau Dớn Xào Tỏi Rừng Hoang Dã', desc: 'Rau dớn mọc ven khe suối giòn sần sật xào tỏi thơm phức đặc trưng núi rừng Tây Bắc.', price: '65.000 đ' },
            { slotLabel: 'Xế Chiều', time: '14:30 - 16:30', name: 'Mua Thịt Trâu Gác Bếp & Hạt Mắc Khén Làm Quà', desc: 'Chọn những thanh thịt trâu gác bếp chuẩn khói củi và gói hạt dổi, mắc khén về xuôi.', price: '250.000 đ' },
            { slotLabel: 'Ăn Tối', time: '18:30 - 21:00', name: 'Lẩu Thập Cẩm Cá Suối Nấm Rừng Tạm Biệt', desc: 'Bữa tiệc ẩm thực ấm cúng khép lại hành trình khám phá phong vị núi rừng Tây Bắc.', price: '160.000 đ' }
          ]
        }
      ],
      rationale: 'Hành trình đánh thức vị giác với những phong vị ẩm thực hoang sơ, đậm đà bản sắc núi rừng Tây Bắc.'
    },
    culture: {
      title: 'Sa Pa — Mùa Vàng Bậc Thang & Nét Đẹp Bản Làng',
      costDay: 650000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 11:30', name: 'Trekking Bản Tả Van & Lao Chải', desc: 'Men theo những triền ruộng bậc thang hùng vĩ ngắm nhìn cuộc sống người H\'Mông, Giáy.', price: '75.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '12:00 - 13:30', name: 'Thắng Cố & Xôi Ngũ Sắc Nương Rẫy', desc: 'Ẩm thực truyền thống vùng cao đậm đà hương thảo quả và mắc khén thơm lừng.', price: '130.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:30 - 17:30', name: 'Khám Phá Bản Cát Cát & Nhà Gỗ Pơ Mu', desc: 'Tìm hiểu guồng nước khổng lồ, nghề chạm bạc và kiến trúc nhà trình tường người Mông.', price: '150.000 đ' },
            { slotLabel: 'Buổi Tối', time: '19:00 - 21:30', name: 'Chợ Tình Sa Pa & Giao Lưu Khèn Mông', desc: 'Thưởng thức đồ nướng than hoa và lắng nghe tiếng khèn gọi bạn tình tha thiết đêm cuối tuần.', price: '80.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:30 - 12:00', name: 'Chinh Phục Fansipan — Nóc Nhà Đông Dương', desc: 'Đi cáp treo 3 dây qua thung lũng Mường Hoa và leo lên cột mốc 3.143m linh thiêng.', price: '850.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '12:30 - 13:30', name: 'Cơm Lam Thịt Nướng Đỉnh Thiêng', desc: 'Bữa trưa ấm áp trên đỉnh núi với cơm lam dẻo và thịt xiên nướng than hồng.', price: '120.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Chiêm Bái Đại Tượng Phật A Di Đà Bằng Đồng', desc: 'Quần thể tâm linh hùng vĩ ẩn hiện trong mây ngàn trên sườn núi Fansipan.', price: 'Miễn phí' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 21:00', name: 'Đốt Lửa Trại & Giao Lưu Văn Nghệ Bản Làng', desc: 'Hòa mình vào điệu múa xòe hoa của các cô gái Thái, Mông bên ngọn lửa bập bùng.', price: '60.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Bãi Đá Cổ Sa Pa — Di Tích Quốc Gia', desc: 'Chiêm ngưỡng gần 200 khối đá khắc hình người và ký tự cổ bí ẩn chưa có lời giải.', price: '30.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Ẩm Thực Người Giáy Bên Suối Mường Hoa', desc: 'Thịt heo xào măng chua, cá nướng pa pỉnh tộp và canh rau cải nương ngọt lịm.', price: '110.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Thăm Bản Tả Phìn Người Dao Đỏ & Chùa Cổ', desc: 'Khám phá trang phục khăn đỏ rực rỡ và tu viện cổ Tả Phìn xây từ thời Pháp 1942.', price: '50.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Xem Nghi Lễ Cấp Sắc Của Người Dao Đỏ', desc: 'Nghi lễ trưởng thành thiêng liêng và độc đáo nhất trong kho tàng văn hóa dân tộc Dao.', price: '80.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '07:00 - 11:30', name: 'Chợ Phiên Bắc Hà Rực Rỡ Sắc Màu Dân Tộc', desc: 'Chợ phiên lớn nhất Tây Bắc nơi bà con người Mông Hoa, Dao, Tày mua bán ngựa, vải vóc.', price: '50.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '12:00 - 13:30', name: 'Thắng Cố Ngựa & Rượu Ngô Bản Phố', desc: 'Thưởng thức bát thắng cố nóng hổi ngay giữa chợ phiên cùng chén rượu ngô thơm lừng.', price: '120.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Dinh Hoàng A Tưởng (Dinh Vua Mèo Bắc Hà)', desc: 'Tòa dinh thự kiến trúc Á - Âu kết hợp xây dựng từ năm 1914 giữa cao nguyên đá.', price: '30.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Trở Về Sa Pa Thưởng Trà Shan Tuyết Cổ Thụ', desc: 'Nhấp ngụm trà tuyết búp trắng hái từ những cây trà cổ thụ trên 300 năm tuổi.', price: '50.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Bản Sin Chải Nơi Giữ Nếp Cổ Người H\'Mông', desc: 'Tìm hiểu phong tục tập quán mộc mạc và cuộc sống tự cung tự cấp của đồng bào vùng cao.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Cơm Trưa Gia Đình Đồng Bào Thân Tình', desc: 'Bữa cơm đầm ấm với gà đồi xào gừng, rau rừng luộc và bát canh măng ngọt ngào.', price: '90.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Mua Váy Áo Thổ Cẩm Tự Dệt Làm Kỷ Niệm', desc: 'Chọn những chiếc túi xách, khăn quàng dệt tay tinh xảo ủng hộ sinh kế phụ nữ bản địa.', price: '180.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Khép Lại Chuyến Hành Trình Di Sản Tây Bắc', desc: 'Lưu giữ những kỷ niệm đẹp đẽ về con người đôn hậu và thiên nhiên kỳ vĩ nơi địa đầu Tổ quốc.', price: '50.000 đ' }
          ]
        }
      ],
      rationale: 'Chạm sâu vào bản sắc đại ngàn Hoàng Liên Sơn, tôn trọng lối sống và văn hóa của đồng bào thiểu số.'
    },
    craft: {
      title: 'Sa Pa — Tinh Hoa Dệt Thổ Cẩm & Nhuộm Chàm Tây Bắc',
      costDay: 600000,
      days: [
        {
          day: 1,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Workshop Nhuộm Chàm & Vẽ Sáp Ong', desc: 'Nghệ nhân người Mông hướng dẫn vẽ hoa văn bằng sáp ong nóng trên vải lanh tự dệt.', price: '120.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Gà Đen Hầm Thuốc Bắc & Cơm Lam Bản', desc: 'Món gà đen xương đen bồi bổ cơ thể nấu cùng thảo dược mọc tự nhiên trên vách đá.', price: '140.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Làng Dệt Thổ Cẩm Tả Phìn Người Dao', desc: 'Tận mắt xem các bà, các mẹ thêu từng đường kim mũi chỉ tạo nên hoa văn rực rỡ.', price: '50.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thưởng Trà Shan Tuyết Cổ Thụ & Chạm Bạc', desc: 'Nhấp ngụm trà cổ thụ mọc trên độ cao 2.000m và tự tay gõ chiếc vòng bạc kỷ niệm.', price: '80.000 đ' }
          ]
        },
        {
          day: 2,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Làng Rèn Đúc Nông Cụ & Dao Mèo Cát Cát', desc: 'Xem thợ rèn người Mông nung thép đỏ rực và quai búa rèn nên những con dao mèo sắc bén.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Bún Chả Nướng Xiên Rừng Tây Bắc', desc: 'Thịt xiên nướng lá rừng thơm cay ăn kèm bún tươi và nước chấm thảo mộc đậm đà.', price: '60.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Workshop Làm Giấy Dó Bản Địa Người Mông', desc: 'Học cách giã vỏ cây dó rừng, seo giấy trên khung vải và phơi khô dưới ánh nắng vùng cao.', price: '90.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Thăm Xưởng Chế Tác Khèn Mông & Đàn Tính', desc: 'Nghệ nhân già biểu diễn và chỉ cách khoét lỗ 6 ống trúc tạo nên âm thanh khèn tha thiết.', price: '70.000 đ' }
          ]
        },
        {
          day: 3,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Làng Chạm Bạc Truyền Thống Lao Chải', desc: 'Nghệ nhân hướng dẫn cách nấu bạc, cán sợi và chạm khắc họa tiết hoa văn vòng cổ truyền thống.', price: '100.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Lẩu Nấm Rừng Tự Nhiên Dãy Hoàng Liên', desc: 'Nồi lẩu thơm phức với hơn 5 loại nấm rừng quý và rau rừng tươi non ngọt thanh.', price: '150.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Workshop Nhuộm Vải Bằng Củ Nâu & Vỏ Cây', desc: 'Trải nghiệm kỹ thuật nhuộm màu tự nhiên tạo nên các sắc độ nâu, vàng, đỏ mộc mạc.', price: '80.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Mua Trang Sức Bạc Thủ Công Vùng Cao', desc: 'Chọn mua những chiếc nhẫn, lắc tay bạc chạm khắc hoa văn tinh xảo trừ tà cầu an.', price: '180.000 đ' }
          ]
        },
        {
          day: 4,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:00 - 10:30', name: 'Làng Đan Gùi Tre & Thúng Mủng Tả Van', desc: 'Khám phá nghệ thuật đan gùi tre dẻo dai giúp đồng bào mang vác nông sản trên dốc núi.', price: '40.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Canh Măng Rừng Sườn Heo Bản', desc: 'Bát canh măng nứa ngọt mát ninh cùng sườn heo bản mềm thơm ăn cùng cơm nóng.', price: '75.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Thêu Hoa Văn Vạt Áo Thổ Cẩm Cùng Nghệ Nhân', desc: 'Học cách xỏ chỉ ngũ sắc và thêu từng mũi chữ thập tạo hình hoa mặt trời trên vạt áo.', price: '70.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Trải Nghiệm Chưng Cất Tinh Dầu Pơ Mu', desc: 'Xem quy trình chưng cất gỗ pơ mu và ngải cứu rừng tỏa hương thơm dịu nhẹ xoa dịu tâm hồn.', price: '60.000 đ' }
          ]
        },
        {
          day: 5,
          slots: [
            { slotLabel: 'Buổi Sáng', time: '08:30 - 11:00', name: 'Thăm Rừng Trà Shan Tuyết Cổ Thụ Trăm Năm', desc: 'Trèo lên đồi chè cổ thụ hái những búp chè ngậm sương sớm và học cách sao chè củi thủ công.', price: '70.000 đ' },
            { slotLabel: 'Buổi Trưa', time: '11:30 - 13:00', name: 'Cơm Nắm Muối Vừng & Gà Bản Hấp', desc: 'Bữa cơm trưa mộc mạc thơm dẻo trên đường trở về thị trấn Sa Pa.', price: '80.000 đ' },
            { slotLabel: 'Buổi Chiều', time: '14:00 - 16:30', name: 'Mua Trà Shan Tuyết & Thổ Cẩm Dệt Tay Tinh Xảo', desc: 'Đóng gói các món quà thủ công độc bản đậm đà hồn thiêng Tây Bắc gửi tặng gia đình.', price: '200.000 đ' },
            { slotLabel: 'Buổi Tối', time: '18:30 - 20:30', name: 'Khép Lại Chuyến Du Hành Làng Nghề Vùng Cao', desc: 'Thưởng thức ngụm trà nóng chia tay núi rừng Tây Bắc hùng vĩ và mến khách.', price: '40.000 đ' }
          ]
        }
      ],
      rationale: 'Tôn vinh và trải nghiệm những nghề thủ công cổ xưa lưu truyền qua hàng chục thế hệ đồng bào vùng cao.'
    }
  }
};

function initAiTripSimulator() {
  const destSelect = document.getElementById('sim-destination');
  const durationSelect = document.getElementById('sim-duration');
  const styleSelect = document.getElementById('sim-style');
  const budgetSelect = document.getElementById('sim-budget');
  const generateBtn = document.getElementById('btn-generate-plan');
  const copyBtn = document.getElementById('btn-copy-plan');

  const loadingEl = document.getElementById('sim-loading');
  const contentEl = document.getElementById('sim-content');
  const progressEl = document.getElementById('sim-progress');
  const stepTextEl = document.getElementById('sim-loading-step');

  const resBadge = document.getElementById('res-badge');
  const resTitle = document.getElementById('res-title');
  const resMeta = document.getElementById('res-meta');
  const resSlots = document.getElementById('res-slots');
  const resRationale = document.getElementById('res-rationale');

  // Only update plan when user clicks the AI Generate button (do not auto-update on dropdown change)
  [destSelect, durationSelect, styleSelect, budgetSelect].forEach(select => {
    if (select && generateBtn) {
      select.addEventListener('change', () => {
        // Subtle hint on the generate button
        generateBtn.classList.add('btn-highlight');
        setTimeout(() => generateBtn.classList.remove('btn-highlight'), 1200);
      });
    }
  });

  function renderPlan() {
    const dest = destSelect ? destSelect.value : 'hanoi';
    const selectedDays = durationSelect ? parseInt(durationSelect.value, 10) : 1;
    const selectedStyle = styleSelect ? styleSelect.value : 'slow';
    const selectedBudget = budgetSelect ? budgetSelect.value : 'budget';

    // Find matching itinerary or fallback
    let destData = itineraryDatabase[dest] || itineraryDatabase.hanoi;
    let plan = destData[selectedStyle] || Object.values(destData)[0] || itineraryDatabase.hanoi.slow;

    const multiplier = selectedBudget === 'premium' ? 1.8 : (selectedBudget === 'standard' ? 1.3 : 1);
    const totalCost = Math.round((plan.costDay * selectedDays * multiplier) / 10000) * 10000;
    const formattedCost = new Intl.NumberFormat('vi-VN').format(totalCost) + ' đ';

    const dayCount = selectedDays;
    const totalActivities = dayCount * 4;

    resBadge.textContent = `LỊCH TRÌNH ĐỘC BẢN • ${selectedDays} NGÀY`;
    resTitle.textContent = `${plan.title} (${selectedDays} Ngày)`;
    resMeta.innerHTML = `
      <span class="meta-item">⏱️ <strong>${selectedDays} Ngày</strong> (${totalActivities} Hoạt động độc bản)</span>
      <span class="meta-item">💰 Dự toán: <strong>~${formattedCost}/người</strong></span>
      <span class="meta-item">🧭 Lịch trình gợi ý để bạn tham khảo</span>
    `;

    // Render slots in 4-card horizontal grid for each day without ANY duplication!
    let slotsHtml = '';
    for (let dayNum = 1; dayNum <= selectedDays; dayNum++) {
      if (selectedDays > 1) {
        slotsHtml += `<div class="day-divider"><span>🗓️ NGÀY ${dayNum}</span></div>`;
      }
      slotsHtml += `<div class="day-slots-grid">`;

      // Get the unique day data from days array
      let dayData = (plan.days && plan.days[dayNum - 1]) ? plan.days[dayNum - 1].slots : (plan.slots || []);

      dayData.forEach((slot, idx) => {
        slotsHtml += `
          <div class="slot-card">
            <div class="slot-card-header">
              <span class="slot-time-badge">⏱️ ${slot.time}</span>
              <span class="slot-slot-tag">${slot.slotLabel || ('Hoạt động ' + (idx + 1))}</span>
            </div>
            <div class="slot-details">
              <div class="slot-name">${slot.name}</div>
              <div class="slot-desc">${slot.desc}</div>
            </div>
            <div class="slot-card-footer">
              <span class="slot-price">💵 Chi phí: <strong>${slot.price}</strong></span>
            </div>
          </div>
        `;
      });
      slotsHtml += `</div>`;
    }

    resSlots.innerHTML = slotsHtml;
    resRationale.textContent = plan.rationale;
  }

  // Initial render
  renderPlan();

  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      // Show loading sequence
      contentEl.style.display = 'none';
      loadingEl.classList.remove('hidden');
      progressEl.style.width = '0%';

      const steps = [
        'Đang chuẩn bị gợi ý theo lựa chọn của bạn...',
        'Đang sắp xếp các hoạt động minh họa...',
        'Đang tính tổng ngân sách tham khảo...',
        'Hoàn tất bản lịch trình mẫu!'
      ];

      let progress = 0;
      let stepIdx = 0;

      const interval = setInterval(() => {
        progress += 25;
        progressEl.style.width = progress + '%';
        if (steps[stepIdx]) {
          stepTextEl.textContent = steps[stepIdx];
          stepIdx++;
        }

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            loadingEl.classList.add('hidden');
            contentEl.style.display = 'flex';
            renderPlan();
            showToast('Đã tạo lịch trình mẫu để bạn tham khảo.');
          }, 300);
        }
      }, 250);
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const planText = `${resTitle.textContent}\n${resMeta.textContent}\nLên lịch trình cùng https://viloca.app`;
      navigator.clipboard.writeText(planText).then(() => {
        showToast('Đã sao chép lịch trình mẫu vào bộ nhớ tạm.');
      }).catch(() => {
        showToast('📋 Đã ghi nhận lịch trình của bạn!');
      });
    });
  }
}

/* ==================== 6. DESTINATION FILTERS & AI PLAN SHORTCUTS ==================== */
function initDestinationFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.dest-card');
  const destSelect = document.getElementById('sim-destination');
  const generateBtn = document.getElementById('btn-generate-plan');

  if (filterBtns.length && cards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            card.style.animation = 'fadeInCard 0.4s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Handle "✨ Lên lịch AI" buttons on Destination cards
  const planDestBtns = document.querySelectorAll('.btn-plan-dest');
  planDestBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetDest = btn.getAttribute('data-dest');
      if (targetDest && destSelect) {
        destSelect.value = targetDest;
        const plannerSection = document.getElementById('ai-planner');
        if (plannerSection) {
          plannerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (generateBtn) {
          generateBtn.classList.add('btn-highlight');
          setTimeout(() => {
            generateBtn.click();
          }, 450);
        }
      }
    });
  });
}

/* ==================== 7. FESTIVAL COUNTDOWN TIMERS ==================== */
function initFestivalCountdowns() {
  const cards = document.querySelectorAll('.festival-card');
  const remindBtns = document.querySelectorAll('.btn-remind');

  function updateAllCountdowns() {
    const now = new Date().getTime();

    cards.forEach(card => {
      const countdownEl = card.querySelector('.festival-countdown');
      if (!countdownEl) return;

      const targetDateStr = countdownEl.getAttribute('data-date');
      const targetTime = new Date(targetDateStr).getTime();
      let diff = targetTime - now;

      if (diff <= 0) {
        // If passed, add 1 year
        diff = Math.abs(diff) % (365 * 24 * 3600 * 1000);
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const daysEl = card.querySelector('[data-unit="days"]');
      const hoursEl = card.querySelector('[data-unit="hours"]');
      const minsEl = card.querySelector('[data-unit="mins"]');
      const secsEl = card.querySelector('[data-unit="secs"]');

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
    });
  }

  updateAllCountdowns();
  setInterval(updateAllCountdowns, 1000);

  remindBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const festName = btn.getAttribute('data-fest') || 'Lễ hội';
      btn.textContent = '✓ Đã đặt nhắc nhở';
      btn.style.borderColor = 'var(--secondary)';
      btn.style.color = 'var(--secondary)';
      showToast(`🔔 Bạn sẽ nhận được thông báo lịch trình trước 3 ngày diễn ra ${festName}!`);
    });
  });
}

/* ==================== 8. FAQ ACCORDION ==================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

/* ==================== 9. QR CODE MODAL ==================== */
function initQrModal() {
  const modal = document.getElementById('qr-modal');
  const openBtns = document.querySelectorAll('#btn-open-qr, .btn-qr-trigger');
  const closeBtn = document.getElementById('modal-close-btn');
  const copyBtn = document.getElementById('btn-copy-link');
  const linkInput = document.getElementById('app-link-input');

  if (!modal) return;

  function openModal(e) {
    if (e) e.preventDefault();
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  if (copyBtn && linkInput) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(linkInput.value).then(() => {
        showToast('🔗 Đã sao chép link tải app vào clipboard!');
      });
    });
  }
}

/* ==================== 10. NEWSLETTER & WAITLIST FORM ==================== */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('email-input');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (email) {
      try {
        const list = JSON.parse(localStorage.getItem('viloca_waitlist') || '[]');
        list.push({ email, time: new Date().toISOString() });
        localStorage.setItem('viloca_waitlist', JSON.stringify(list));
      } catch (err) {}

      emailInput.value = '';
      showToast('💌 Cảm ơn bạn! Cẩm nang văn hóa đầu tiên đã được gửi đến hòm thư của bạn.');
    }
  });
}

/* ==================== 11. SCROLL REVEAL ANIMATIONS ==================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ==================== 12. STAT COUNTERS ==================== */
function initStatCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 1500;
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = new Intl.NumberFormat('vi-VN').format(target);
            clearInterval(timer);
          } else {
            el.textContent = new Intl.NumberFormat('vi-VN').format(Math.floor(current));
          }
        }, stepTime);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ==================== HELPER: TOAST NOTIFICATIONS ==================== */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
