/**
 * Viloca Landing Page v2 Scripts
 * Chạm vào Việt Nam, nhẹ như không trọng lực
 */

(function () {
  'use strict';

  // --- 1. Video Fallback & Handling ---
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    const src = heroVideo.querySelector('source');
    if (src) {
      src.addEventListener('error', () => {
        heroVideo.style.display = 'none';
      });
    }
  }

  // --- 2. Navigation Scroll State ---
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('progress-bar');

  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (navbar) {
      if (scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    if (progressBar) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (scrollY / maxScroll) : 0;
      progressBar.style.transform = `scaleX(${progress})`;
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --- 3. Mobile Drawer Navigation ---
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-link, .drawer-footer .btn');

  function openDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.add('open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // --- 4. Organic Ambient Sound (Web Audio API Pentatonic Chimes) ---
  const soundToggle = document.getElementById('sound-toggle');
  let audioCtx = null;
  let isPlayingSound = false;
  let ambientInterval = null;

  const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33]; // C4, D4, E4, G4, A4, C5, D5

  function playAmbientChime() {
    if (!audioCtx || !isPlayingSound) return;

    try {
      const freq = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 3.6);
    } catch (err) {
      console.warn('Audio note error:', err);
    }
  }

  function toggleAmbientSound() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlayingSound = !isPlayingSound;

    if (soundToggle) {
      soundToggle.classList.toggle('playing', isPlayingSound);
      const label = soundToggle.querySelector('.sound-label');
      if (label) {
        label.textContent = isPlayingSound ? 'Đang phát' : 'Âm thanh';
      }
    }

    if (isPlayingSound) {
      playAmbientChime();
      ambientInterval = setInterval(() => {
        if (Math.random() > 0.3) playAmbientChime();
      }, 2400);
    } else {
      if (ambientInterval) clearInterval(ambientInterval);
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', toggleAmbientSound);
  }

  // --- 5. Interactive Planner Demo Engine ---
  const plannerData = {
    danang: {
      culture: {
        2: {
          title: 'Di sản Hội An & Làng Nghề Thủ Công (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Làng mộc Kim Bồng & Đêm phố cổ Hội An', desc: 'Thăm nghệ nhân chạm khắc gỗ 500 năm tuổi, đi thuyền trên sông Thu Bồn và ngắm đèn lồng phố cổ.' },
            { day: 'Ngày 2', title: 'Làng gốm Thanh Hà & Không gian Ký ức', desc: 'Thử chuốt gốm thủ công tại Thanh Hà, thưởng thức ẩm thực Cao Lầu và xem show Ký Ức Hội An.' }
          ]
        },
        3: {
          title: 'Hành trình Lắng đọng Văn hóa Xứ Quảng (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Phố cổ Hội An & Làng rau Trà Quế', desc: 'Dạo bộ các hội quán cổ, đạp xe ra làng Trà Quế trải nghiệm làm nông dân hữu cơ.' },
            { day: 'Ngày 2', title: 'Làng mộc Kim Bồng & Rừng dừa Bảy Mẫu', desc: 'Chiêm ngưỡng tinh hoa điêu khắc mộc và chèo thuyền thúng len lỏi rạch dừa nước.' },
            { day: 'Ngày 3', title: 'Làng gốm Thanh Hà & Thưởng thức cà phê sông Hoài', desc: 'Sáng ngắm bình minh trên cầu Cẩm Nam, mua quà gốm lưu niệm trước khi rời đi.' }
          ]
        },
        4: {
          title: 'Khám phá Chiều sâu Di sản & Làng cổ (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Đà Nẵng — Bảo tàng Điêu khắc Chăm & Chợ Hàn', desc: 'Tìm hiểu lịch sử văn hóa Champa cổ đại và nếm thử đặc sản mì Quảng.' },
            { day: 'Ngày 2', title: 'Hội An — Làng mộc Kim Bồng & Đêm đèn hoa đăng', desc: 'Tham quan xưởng mộc truyền thống và thả đèn hoa đăng trên sông Hoài.' },
            { day: 'Ngày 3', title: 'Rừng dừa Bảy Mẫu & Show Ký ức Hội An', desc: 'Hòa mình vào thiên nhiên sông nước Cẩm Thanh và xem vũ kịch thực cảnh.' },
            { day: 'Ngày 4', title: 'Làng gốm Thanh Hà & Cổng trời Đông Giang', desc: 'Chạm tay vào đất sét nung và ngắm mây ngàn vùng cao xứ Quảng.' }
          ]
        }
      },
      nature: {
        2: {
          title: 'Sông nước Cẩm Thanh & Bán đảo Sơn Trà (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Rừng dừa Bảy Mẫu & Hoàng hôn An Bàng', desc: 'Chèo thuyền thúng tĩnh lặng và đón gió biển chiều mộc mạc.' },
            { day: 'Ngày 2', title: 'Bán đảo Sơn Trà & Rạn Nam Ô', desc: 'Khám phá cung đường ven biển hoang sơ và thiên nhiên xanh mát.' }
          ]
        },
        3: {
          title: 'Non nước Xanh biếc Đà Nẵng — Hội An (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Sơn Trà & Ngũ Hành Sơn', desc: 'Leo núi đá vôi ngắm toàn cảnh biển và vãn cảnh chùa cổ.' },
            { day: 'Ngày 2', title: 'Rừng dừa Bảy Mẫu & Cồn bắp Cẩm Nam', desc: 'Chèo thuyền thúng ngắm dừa nước, dạo vườn bắp thanh bình.' },
            { day: 'Ngày 3', title: 'Cổng trời Đông Giang xanh ngát', desc: 'Hít thở không khí núi rừng nguyên sơ miền Trung.' }
          ]
        },
        4: {
          title: 'Hành trình Rừng & Biển trọn vẹn (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Bán đảo Sơn Trà nguyên sinh', desc: 'Tìm dấu vết Voọc chà vá chân nâu và ngắm hoàng hôn đỉnh Bàn Cờ.' },
            { day: 'Ngày 2', title: 'Rừng dừa Cẩm Thanh & Biển Cửa Đại', desc: 'Hành trình xuôi mái chèo trên dòng sông trù phú.' },
            { day: 'Ngày 3', title: 'Thác Grăng & Đại ngàn Đông Giang', desc: 'Khám phá thác nước hùng vĩ giữa lòng đại ngàn.' },
            { day: 'Ngày 4', title: 'Thong thả ngắm bình minh biển Mỹ Khê', desc: 'Thưởng thức nước dừa tươi và dạo bờ cát êm.' }
          ]
        }
      },
      food: {
        2: {
          title: 'Hương vị Ẩm thực Xứ Quảng (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Mì Quảng ếch & Bánh mì Phố Hội', desc: 'Thưởng thức tô mì Quảng nóng hổi và bánh mì giòn rụm trứ danh.' },
            { day: 'Ngày 2', title: 'Cao Lầu giếng Bá Lễ & Bánh đập hến xào', desc: 'Trải nghiệm ẩm thực gia truyền tại khu chợ cổ ven sông.' }
          ]
        },
        3: {
          title: 'Bản đồ Ẩm thực Đậm đà Miền Trung (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Bánh tráng cuốn thịt heo & Gỏi cá Nam Ô', desc: 'Đậm đà hương vị mắm nêm nguyên chất.' },
            { day: 'Ngày 2', title: 'Cơm gà Hội An & Chè bắp Cẩm Nam', desc: 'Khám phá bí quyết luộc gà thơm ngọt và món chè thanh mát.' },
            { day: 'Ngày 3', title: 'Cà phê muối & Hải sản làng chài Mân Thái', desc: 'Thưởng thức hải sản tươi ngon lúc thuyền vừa cập bến.' }
          ]
        },
        4: {
          title: 'Trải nghiệm Ẩm thực Bản địa Sâu sắc (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Chợ Hàn & Thiên đường Ẩm thực đường phố', desc: 'Bánh bèo, nậm, lọc và chả bò Đà Nẵng.' },
            { day: 'Ngày 2', title: 'Trà thảo mộc Mót & Bánh đập Cẩm Nam', desc: 'Vừa dạo phố cổ vừa nhâm nhi vị thảo mộc thanh dịu.' },
            { day: 'Ngày 3', title: 'Học nấu ăn tại làng rau Trà Quế', desc: 'Tự tay hái rau tươi và chế biến bánh xèo miền Trung.' },
            { day: 'Ngày 4', title: 'Hải sản nướng than hoa làng chài', desc: 'Bữa cơm tiễn biệt ấm áp với người dân ven biển.' }
          ]
        }
      }
    },
    hanoi: {
      culture: {
        2: {
          title: 'Hà Nội — Ngàn Năm Văn Hiến & Làng Nghề (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Văn Miếu Quốc Tử Giám & Phố Cổ 36 Phố Phường', desc: 'Tìm hiểu cái nôi khoa cử và kiến trúc nhà ống cổ truyền.' },
            { day: 'Ngày 2', title: 'Làng gốm Bát Tràng & Làng chuồn chuồn Thạch Xá', desc: 'Thử tay nặn gốm và xem nghệ nhân vót tre làm chuồn chuồn cân bằng.' }
          ]
        },
        3: {
          title: 'Ký Ức Thăng Long & Tinh Hoa Làng Nghề Bắc Bộ (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Hoàng Thành Thăng Long & Hồ Tây trầm mặc', desc: 'Chiêm ngưỡng di sản khảo cổ nghìn năm và thưởng trà sen.' },
            { day: 'Ngày 2', title: 'Làng lụa Vạn Phúc & Chuồn chuồn tre Thạch Xá', desc: 'Khám phá lụa tơ tằm óng ả và đồ chơi dân gian mộc mạc.' },
            { day: 'Ngày 3', title: 'Bảo tàng Dân tộc học & Cà phê Trứng phố cổ', desc: 'Tìm hiểu văn hóa 54 dân tộc và thưởng thức hương vị cà phê độc đáo.' }
          ]
        },
        4: {
          title: 'Hành trình Di sản Bắc Bộ Cổ kính (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Phố Cổ, Đền Ngọc Sơn & Cầu Long Biên', desc: 'Đón bình minh trên cây cầu lịch sử trăm tuổi.' },
            { day: 'Ngày 2', title: 'Làng cổ Đường Lâm & Chùa Mía', desc: 'Bước qua cổng làng đá ong, thưởng thức kẹo dồi và chè lam.' },
            { day: 'Ngày 3', title: 'Làng nón Chuông & Làng quạt Chàng Sơn', desc: 'Khám phá những làng nghề lưu giữ vẻ đẹp truyền thống.' },
            { day: 'Ngày 4', title: 'Văn Miếu & Mua sắm quà thủ công phố Hàng', desc: 'Lưu giữ những kỷ niệm văn hóa lắng đọng.' }
          ]
        }
      },
      nature: {
        2: {
          title: 'Hồ Tây lộng gió & Rừng thông Ba Vì (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Đạp xe quanh Hồ Tây & Thung lũng hoa', desc: 'Tận hưởng gió mát và không gian thoáng đãng giữa lòng thủ đô.' },
            { day: 'Ngày 2', title: 'Vườn quốc gia Ba Vì sương phủ', desc: 'Dạo bước giữa rừng thông và thăm nhà kính xương rồng cổ kính.' }
          ]
        },
        3: {
          title: 'Thiên nhiên Xanh ven đô Hà Nội (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Hồ Gươm sương sớm & Vườn bách thảo', desc: 'Ngắm người dân tập dưỡng sinh và hít thở không khí trong lành.' },
            { day: 'Ngày 2', title: 'Núi Hàm Lợn Sóc Sơn & Hồ Đồng Đò', desc: 'Cắm trại thảnh thơi bên hồ nước trong vắt.' },
            { day: 'Ngày 3', title: 'Làng gốm Bát Tràng ven đê sông Hồng', desc: 'Ngắm bãi bồi sông Hồng và hoa cải mùa đông.' }
          ]
        },
        4: {
          title: 'Hành trình Sinh thái & Non nước Bắc Bộ (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Không gian xanh Hồ Tây & Bãi đá sông Hồng', desc: 'Thư giãn bên dòng sông phù sa êm đềm.' },
            { day: 'Ngày 2', title: 'Vườn quốc gia Ba Vì', desc: 'Khám phá phế tích nhà thờ cổ giữa rừng sương.' },
            { day: 'Ngày 3', title: 'Khu sinh thái Đồng Mô & Hồ Quan Sơn', desc: 'Chèo thuyền ngắm phong cảnh được ví như Hạ Long trên cạn.' },
            { day: 'Ngày 4', title: 'Thong thả thưởng trà sen Tây Hồ', desc: 'Khép lại chuyến đi nhẹ nhàng và an yên.' }
          ]
        }
      },
      food: {
        2: {
          title: 'Hà Nội 36 Phố Phường — Đậm Đà Vị Cũ (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Phở bò gia truyền & Cà phê Trứng Giảng', desc: 'Bắt đầu ngày mới với bát phở nghi ngút khói và cà phê trứng béo ngậy.' },
            { day: 'Ngày 2', title: 'Bún chả que tre & Bánh cốm Hàng Than', desc: 'Thưởng thức món ăn tinh hoa đượm hương than hoa quạt tay.' }
          ]
        },
        3: {
          title: 'Hành trình Ẩm thực Thăng Long Tinh tế (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Bún thang Cầu Gỗ & Chả cá Lã Vọng', desc: 'Nghệ thuật ẩm thực cầu kỳ của người Tràng An.' },
            { day: 'Ngày 2', title: 'Bánh cuốn Thanh Trì & Kem Tràng Tiền', desc: 'Bánh tráng mỏng mềm mướt ăn cùng hành phi thơm giòn.' },
            { day: 'Ngày 3', title: 'Bún ốc nguội Ô Quan Chưởng & Trà hoa nhài', desc: 'Vị chua thanh mát lành của giấm bỗng gia truyền.' }
          ]
        },
        4: {
          title: 'Trải nghiệm Ẩm thực Truyền thống Toàn diện (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Phở cuốn Ngũ Xã & Bánh tôm Hồ Tây', desc: 'Bữa tối đón gió lộng bên mặt hồ.' },
            { day: 'Ngày 2', title: 'Bánh cốm Làng Vòng & Chè sen long nhãn', desc: 'Mùa thu Hà Nội đọng lại trong từng hạt cốm non mộc mạc.' },
            { day: 'Ngày 3', title: 'Lẩu riêu cua bắp bò & Ốc luộc lá chanh', desc: 'Cảm nhận nhịp sống phố đêm ấm cúng.' },
            { day: 'Ngày 4', title: 'Bữa sáng bánh mì sốt vang & Trà sen', desc: 'Gói trọn dư vị tinh hoa Hà thành.' }
          ]
        }
      }
    },
    taybac: {
      culture: {
        2: {
          title: 'Bản Làng Thổ Cẩm & Nếp Sống Vùng Cao (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Bản Cát Cát & Khung dệt thổ cẩm H’Mông', desc: 'Xem nghệ nhân xe lanh dệt vải, nhuộm chàm cổ truyền.' },
            { day: 'Ngày 2', title: 'Chợ phiên vùng cao & Bếp lửa nhà sàn', desc: 'Nếm thử thắng cố, bánh ngô và nghe tiếng khèn gọi bạn.' }
          ]
        },
        3: {
          title: 'Sắc Màu Văn Hóa Các Dân Tộc Tây Bắc (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Bản Tả Phìn — Nghề dệt & Tắm lá thuốc Dao Đỏ', desc: 'Trải nghiệm bài thuốc tắm thảo dược cổ truyền của người Dao.' },
            { day: 'Ngày 2', title: 'Bản Lao Chải — Tả Van & Nhà trình tường', desc: 'Dạo bước giữa thung lũng Mường Hoa thơ mộng.' },
            { day: 'Ngày 3', title: 'Thưởng trà Shan Tuyết cổ thụ & Mua thổ cẩm', desc: 'Mua tấm khăn dệt tay làm quà kỷ niệm.' }
          ]
        },
        4: {
          title: 'Hành trình Bản Hùng Ca Núi Rừng Tây Bắc (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Mộc Châu — Bản Lóng Luông & Đồi chè trái tim', desc: 'Gặp gỡ những đứa trẻ vùng cao hồn nhiên.' },
            { day: 'Ngày 2', title: 'Đèo Khau Phạ & Làng văn hóa Mù Cang Chải', desc: 'Học cách thêu hoa văn sáp ong độc đáo.' },
            { day: 'Ngày 3', title: 'Bản Cu Vai trên mây & Điệu xòe Thái', desc: 'Uống rượu cần bên bếp lửa bập bùng cùng bà con.' },
            { day: 'Ngày 4', title: 'Chợ phiên Bắc Hà rực rỡ sắc áo', desc: 'Bức tranh văn hóa sống động nhất núi rừng phía Bắc.' }
          ]
        }
      },
      nature: {
        2: {
          title: 'Mù Cang Chải — Mùa Vàng Hoàng Hôn (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Đồi Mâm Xôi & Thung lũng La Pán Tẩn', desc: 'Chiêm ngưỡng những nấc thang lên cổng trời rực rỡ.' },
            { day: 'Ngày 2', title: 'Đồi Móng Ngựa hoàng hôn buông', desc: 'Bức tranh mặt trời lặn ngoạn mục trên triền lúa chín.' }
          ]
        },
        3: {
          title: 'Săn Mây & Biển Lúa Tây Bắc Đại Ngàn (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Đèo Ô Quy Hồ & Cổng trời Sapa', desc: 'Ngắm biển mây cuồn cuộn trên đỉnh đèo hùng vĩ.' },
            { day: 'Ngày 2', title: 'Thung lũng Mường Hoa & Ruộng bậc thang', desc: 'Đi bộ trekking nhẹ nhàng qua những con suối róc rách.' },
            { day: 'Ngày 3', title: 'Thác Tình Yêu & Suối Vàng', desc: 'Không gian tĩnh lặng của rừng trúc bạt ngàn.' }
          ]
        },
        4: {
          title: 'Cung Đường Mây Bay Đỉnh Núi (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Tà Xùa — Đón bình minh Sống lưng Khủng long', desc: 'Biển mây trắng bồng bềnh tựa chốn bồng lai.' },
            { day: 'Ngày 2', title: 'Cây táo mèo cô đơn & Bản Mù Căng', desc: 'Khoảnh khắc bình yên không một tiếng còi xe.' },
            { day: 'Ngày 3', title: 'Mù Cang Chải mùa nước đổ / mùa lúa chín', desc: 'Vẻ đẹp kỳ vĩ của bàn tay con người kiến tạo.' },
            { day: 'Ngày 4', title: 'Tắm suối khoáng nóng Trạm Tấu', desc: 'Thư giãn cơ thể giữa thiên nhiên trong trẻo.' }
          ]
        }
      },
      food: {
        2: {
          title: 'Hương Vị Mắc Khén & Bếp Lửa Vùng Cao (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Thịt lợn bản nướng hạt dổi & Cơm lam nếp nương', desc: 'Mùi nếp thơm dẻo nấu trong ống nứa tươi.' },
            { day: 'Ngày 2', title: 'Gà đen H’Mông hấp lá chanh & Cá suối nướng', desc: 'Món quà ẩm thực dân dã đậm đà dư vị.' }
          ]
        },
        3: {
          title: 'Đại Tiệc Ẩm Thực Rừng Xanh Tây Bắc (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Thắng cố ngựa chợ phiên & Rượu ngô men lá', desc: 'Trải nghiệm ẩm thực truyền thống bên chảo thắng cố nóng hổi.' },
            { day: 'Ngày 2', title: 'Lẩu cá tầm Sapa & Rau mầm đá chấm trứng dầm', desc: 'Hương vị béo ngậy ngọt lành từ nguồn nước lạnh.' },
            { day: 'Ngày 3', title: 'Xôi ngũ sắc & Thịt trâu gác bếp', desc: 'Sắc màu thiên nhiên chiết xuất từ lá cây rừng.' }
          ]
        },
        4: {
          title: 'Ẩm Thực Núi Rừng & Chè Cổ Thụ (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Bê chao Mộc Châu & Nậm pịa Thái', desc: 'Hương vị đặc trưng thách thức vị giác.' },
            { day: 'Ngày 2', title: 'Cơm lam nếp Tú Lệ dẻo thơm trứ danh', desc: 'Loại gạo nếp tiến vua ngon nhất vùng Tây Bắc.' },
            { day: 'Ngày 3', title: 'Mèn mén & Canh óc đậu của đồng bào H’Mông', desc: 'Món ăn hàng ngày dung dị nuôi lớn bao thế hệ.' },
            { day: 'Ngày 4', title: 'Thưởng trà Shan Tuyết Suối Giàng 300 năm', desc: 'Vị chát ngọt thanh tao lưu giữ hồn non nước.' }
          ]
        }
      }
    },
    dalat: {
      culture: {
        2: {
          title: 'Đà Lạt — Dấu Xưa Di Sản & Làng Thêu XQ (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'XQ Sử Quán & Ga xe lửa cổ Đà Lạt', desc: 'Chiêm ngưỡng tranh thêu tay nghệ thuật và kiến trúc Đông Dương.' },
            { day: 'Ngày 2', title: 'Dinh Bảo Đại & Làng hoa Vạn Thành', desc: 'Khám phá nếp sống quý tộc xưa và nghề trồng hoa trăm năm.' }
          ]
        },
        3: {
          title: 'Không Gian Nghệ Thuật & Ký Ức Cao Nguyên (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Ga Đà Lạt & Chùa Tàu Thiên Vương Cổ Sát', desc: 'Hành trình xe lửa răng cưa về ga Trại Mát.' },
            { day: 'Ngày 2', title: 'Làng Cù Lần & Giao lưu cồng chiêng Lạc Dương', desc: 'Ngồi bên bếp lửa nghe già làng kể sử thi Tây Nguyên.' },
            { day: 'Ngày 3', title: 'Bảo tàng Lâm Đồng & Biệt điện Trần Lệ Xuân', desc: 'Lưu giữ mộc bản triều Nguyễn quý giá.' }
          ]
        },
        4: {
          title: 'Chạm Vào Hồn Cốt Phố Núi Sương Mù (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Khu biệt thự Pháp cổ Cadasa & Nhà thờ Domaine', desc: 'Kiến trúc phong cách Normandie thanh bình.' },
            { day: 'Ngày 2', title: 'Làng gốm B’Lao & Xưởng chế tác cà phê thủ công', desc: 'Trải nghiệm rang xay cà phê Arabica Cầu Đất.' },
            { day: 'Ngày 3', title: 'Làng dệt K’Long & Thác Prenn', desc: 'Nghề dệt thổ cẩm của người K’Ho bản địa.' },
            { day: 'Ngày 4', title: 'Thư giãn nghe nhạc Trịnh bên đồi thông', desc: 'Khép lại chuyến đi êm đềm và hoài niệm.' }
          ]
        }
      },
      nature: {
        2: {
          title: 'Đồi Chè Cầu Đất & Rừng Thông Tuyền Lâm (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Đón bình minh Đồi chè Cầu Đất & Săn mây', desc: 'Màu xanh bạt ngàn trải dài trong làn sương sớm.' },
            { day: 'Ngày 2', title: 'Chèo thuyền kayak Hồ Tuyền Lâm ngắm lá phong', desc: 'Mặt hồ phẳng lặng như gương soi bóng hàng thông.' }
          ]
        },
        3: {
          title: 'Bình Yên Giữa Những Đồi Thông Reo (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Đồi thông Hai Mộ & Hồ Than Thở', desc: 'Đi dạo dưới bóng thông nghe gió reo rì rào.' },
            { day: 'Ngày 2', title: 'Vườn quốc gia Bidoup Núi Bà', desc: 'Trekking nhẹ nhàng khám phá thảm thực vật rêu phong cổ thụ.' },
            { day: 'Ngày 3', title: 'Thác Datanla & Rừng nguyên sinh', desc: 'Hòa mình vào âm thanh thác đổ giữa rừng già.' }
          ]
        },
        4: {
          title: 'Hành Trình Chữa Lành Nơi Phố Núi (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Hồ Xuân Hương lúc sớm mai', desc: 'Khởi động ngày mới bằng một vòng đi bộ thư thái.' },
            { day: 'Ngày 2', title: 'Thung lũng Vàng & Đồi cỏ hồng', desc: 'Khung cảnh thiên nhiên lãng mạn như tranh vẽ.' },
            { day: 'Ngày 3', title: 'Cắm trại bên hồ Suối Vàng ngắm sao trời', desc: 'Bỏ lại ồn ào, ngắm dải ngân hà đêm phố núi.' },
            { day: 'Ngày 4', title: 'Thưởng trà hoa Atiso & Tản bộ đồi thông', desc: 'Tái tạo trọn vẹn năng lượng tinh khôi.' }
          ]
        }
      },
      food: {
        2: {
          title: 'Hơi Ấm Phố Núi — Lẩu Bò & Sữa Đậu Nành (2N1Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Bánh tráng nướng & Sữa đậu nành nóng hổi', desc: 'Ngồi bên bếp than hồng cảm nhận cái lạnh 16 độ C.' },
            { day: 'Ngày 2', title: 'Bánh mì xíu mại & Lẩu gà lá é Tao Ngộ', desc: 'Vị cay nồng của ớt xiêm xanh và vị chua thơm lá é.' }
          ]
        },
        3: {
          title: 'Ẩm Thực Sưởi Ấm Đêm Lạnh Đà Lạt (3N2Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Bánh căn xíu mại trứng lòng đào Tăng Bạt Hổ', desc: 'Vỏ bánh giòn xốp chấm nước sốt mỡ hành thơm phức.' },
            { day: 'Ngày 2', title: 'Lẩu bò Ba Toa quán gỗ & Nem nướng Bà Hùng', desc: 'Nồi lẩu bò nghi ngút khói trong con hẻm nhỏ xưa cũ.' },
            { day: 'Ngày 3', title: 'Kem bơ Thanh Thảo & Dâu tây vườn hái tại chỗ', desc: 'Vị béo ngậy ngọt lành của bơ sáp Tây Nguyên.' }
          ]
        },
        4: {
          title: 'Hương Vị Nông Sản Sạch & Cà Phê Cao Nguyên (4N3Đ)',
          timeline: [
            { day: 'Ngày 1', title: 'Chợ đêm Đà Lạt — Khoai nướng, bắp nướng mỡ hành', desc: 'Dạo chợ đêm trong làn sương mù bảng lảng.' },
            { day: 'Ngày 2', title: 'Salad rau củ tươi hữu cơ & Canh Atiso hầm', desc: 'Thưởng thức nông sản tươi ngon nhất từ các nhà vườn.' },
            { day: 'Ngày 3', title: 'Thịt xiên que nướng ngói & Rượu vang Đà Lạt', desc: 'Bữa tiệc ấm áp ngoài trời cùng bạn bè.' },
            { day: 'Ngày 4', title: 'Cà phê vợt Tùng & Nhâm nhi bánh ngọt', desc: 'Trải nghiệm không gian quán cà phê lâu đời nhất Đà Lạt.' }
          ]
        }
      }
    }
  };

  let currentDest = 'danang';
  let currentVibe = 'culture';
  let currentDays = 2;

  function updatePlannerUI() {
    const destData = plannerData[currentDest] || plannerData.danang;
    const vibeData = destData[currentVibe] || destData.culture;
    const plan = vibeData[currentDays] || vibeData[2];

    const titleEl = document.getElementById('res-title');
    const timeEl = document.getElementById('res-time');
    const timelineEl = document.getElementById('res-timeline');

    if (titleEl) titleEl.textContent = plan.title;
    if (timeEl) timeEl.textContent = `${currentDays} Ngày ${currentDays - 1} Đêm`;

    if (timelineEl) {
      timelineEl.innerHTML = plan.timeline.map(item => `
        <div class="timeline-item">
          <div class="t-day">${item.day}</div>
          <div class="t-title">${item.title}</div>
          <div class="t-desc">${item.desc}</div>
        </div>
      `).join('');
    }
  }

  // Bind Planner Pill Buttons
  document.querySelectorAll('#plan-dest-group .pill-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#plan-dest-group .pill-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDest = btn.dataset.dest;
      updatePlannerUI();
    });
  });

  document.querySelectorAll('#plan-vibe-group .pill-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#plan-vibe-group .pill-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentVibe = btn.dataset.vibe;
      updatePlannerUI();
    });
  });

  document.querySelectorAll('#plan-days-group .pill-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#plan-days-group .pill-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDays = parseInt(btn.dataset.days, 10) || 2;
      updatePlannerUI();
    });
  });

  updatePlannerUI();

  // --- 6. Place Category Filter ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const placeCards = document.querySelectorAll('.place-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      placeCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hide');
        } else {
          card.classList.add('hide');
        }
      });
    });
  });

  // --- 7. FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (btn && answer) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other items
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question');
            const otherAns = other.querySelector('.faq-answer');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherAns) otherAns.style.maxHeight = null;
          }
        });

        if (!isActive) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          item.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
        }
      });
    }
  });

  // --- 8. Festival Track Prev / Next Buttons ---
  const festTrack = document.getElementById('fest-track');
  const festPrev = document.getElementById('fest-prev');
  const festNext = document.getElementById('fest-next');

  if (festTrack && festPrev && festNext) {
    festPrev.addEventListener('click', () => {
      festTrack.scrollBy({ left: -340, behavior: 'smooth' });
    });
    festNext.addEventListener('click', () => {
      festTrack.scrollBy({ left: 340, behavior: 'smooth' });
    });
  }

  // --- 9. GSAP & ScrollTrigger Animations ---
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 800px)').matches;

  if (isReducedMotion) return;

  // Hero Parallax & Reveal
  gsap.to('.hero-bg', {
    yPercent: 14,
    scale: 1.12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.utils.toArray('.hero .float').forEach(el => {
    const depth = parseFloat(el.dataset.depth) || 1;
    gsap.to(el, {
      y: -160 * depth,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  gsap.from('.hero-copy > *', {
    y: 35,
    opacity: 0,
    stagger: 0.12,
    duration: 1.1,
    ease: 'power3.out'
  });

  // Story Pinned Crossfade (3 Chapters)
  const layers = gsap.utils.toArray('.story-stage .layer');
  const chapters = gsap.utils.toArray('.story-stage .chapter');
  const dotBtns = gsap.utils.toArray('.story-indicators .dot-btn');

  if (layers.length >= 3 && chapters.length >= 3) {
    const storyTimeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.story',
        start: 'top top',
        end: '+=280%',
        pin: '.story-stage',
        scrub: 0.6,
        onUpdate: (self) => {
          const activeIndex = Math.min(2, Math.floor(self.progress * 3));
          dotBtns.forEach((btn, idx) => {
            btn.classList.toggle('on', idx === activeIndex);
          });
        }
      }
    });

    // Zoom layers
    layers.forEach((layer, i) => {
      storyTimeline.to(layer, { scale: 1, duration: 3 }, i * 3);
    });

    // Crossfade chapters & layers
    [1, 2].forEach(i => {
      const time = i * 3 - 1;
      storyTimeline
        .to(chapters[i - 1], { opacity: 0, y: -40, duration: 0.8 }, time)
        .to(layers[i - 1], { opacity: 0, duration: 0.8 }, time)
        .fromTo(layers[i], { opacity: 0 }, { opacity: 1, duration: 0.8 }, time)
        .fromTo(chapters[i], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, pointerEvents: 'auto' }, time + 0.3);
    });
  }

  // Floating Places Parallax (Desktop)
  if (!isMobile) {
    gsap.utils.toArray('.cloud .place-card').forEach(card => {
      const depth = parseFloat(card.dataset.depth) || 1;
      gsap.fromTo(card,
        { y: 90 * depth },
        {
          y: -90 * depth,
          ease: 'none',
          scrollTrigger: {
            trigger: '.cloud',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        }
      );
    });

    // Horizontal Scroll for Festivals on Desktop
    if (festTrack) {
      gsap.to(festTrack, {
        x: () => -(festTrack.scrollWidth - window.innerWidth * 0.52),
        ease: 'none',
        scrollTrigger: {
          trigger: '.fest',
          start: 'top top',
          end: () => '+=' + festTrack.scrollWidth,
          pin: '.fest-pin',
          scrub: 0.8,
          invalidateOnRefresh: true
        }
      });
    }
  }

  // Values, Steps, CTA reveals
  gsap.from('.value-card', {
    y: 50,
    opacity: 0,
    stagger: 0.15,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.values-grid',
      start: 'top 85%'
    }
  });

  gsap.from('.step-card', {
    y: 50,
    opacity: 0,
    stagger: 0.15,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.steps-grid',
      start: 'top 85%'
    }
  });

  gsap.from('.cta-card', {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.cta',
      start: 'top 80%'
    }
  });

})();
