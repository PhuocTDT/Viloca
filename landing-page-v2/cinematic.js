(function () {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shots = [...document.querySelectorAll('.shot')];
  const scenes = [...document.querySelectorAll('.scene')];
  const videos = shots.map(s => s.querySelector('video'));
  const N = shots.length;                      // 6 cảnh, mỗi cảnh một "khoảng" thời gian
  const SPAN = 10;

  // Video lỗi/thiếu: gỡ video, poster tĩnh vẫn hiển thị nhờ ảnh nền của lớp
  videos.forEach((v, i) => {
    if (!v) return;
    const fallback = () => {
      const img = new Image(); img.src = v.getAttribute('poster'); img.alt = '';
      v.replaceWith(img);
      videos[i] = null;
    };
    v.querySelector('source').addEventListener('error', fallback);
  });

  if (!window.gsap || !window.ScrollTrigger) return; // dạng tĩnh
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('live');

  const cur = document.getElementById('cur'), label = document.getElementById('label'), prog = document.getElementById('prog');

  /* ---------- Lồng đèn bay lên (chủ đề phi trọng lực) ---------- */
  const cv = document.getElementById('lanterns'), ctx = cv.getContext('2d');
  let W, H, lamps = [], boost = 0;
  const DPR = Math.min(devicePixelRatio || 1, 2);
  function resize() {
    W = cv.width = innerWidth * DPR; H = cv.height = innerHeight * DPR;
    const n = innerWidth < 720 ? 14 : 28;
    lamps = Array.from({ length: n }, () => mk(true));
  }
  function mk(anywhere) {
    return { x: Math.random() * W, y: anywhere ? Math.random() * H : H + 60 * DPR,
      r: (5 + Math.random() * 12) * DPR, v: (.12 + Math.random() * .35) * DPR,
      s: Math.random() * 6.28, hue: 18 + Math.random() * 28 };
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const l of lamps) {
      l.y -= l.v * (1 + boost); l.x += Math.sin(t / 1800 + l.s) * .35 * DPR;
      if (l.y < -80 * DPR) Object.assign(l, mk(false));
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 4);
      g.addColorStop(0, `hsla(${l.hue},95%,62%,.55)`); g.addColorStop(.35, `hsla(${l.hue},90%,50%,.18)`); g.addColorStop(1, 'hsla(20,90%,40%,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(l.x, l.y, l.r * 4, 0, 6.28); ctx.fill();
    }
    boost *= .94;
    requestAnimationFrame(draw);
  }
  addEventListener('resize', resize); resize();
  if (!reduce) requestAnimationFrame(draw);

  /* ---------- Mở màn: letterbox mở + chữ hiện ---------- */
  gsap.to('.letter.t', { yPercent: -100, duration: 1.6, ease: 'power3.inOut', delay: .2 });
  gsap.to('.letter.b', { yPercent: 100, duration: 1.6, ease: 'power3.inOut', delay: .2 });

  /* ---------- Một timeline duy nhất điều khiển toàn bộ phim ---------- */
  // Cảnh 0 hiện sẵn (vào bằng CSS animation); các cảnh sau ẩn cho tới lượt
  const later = scenes.slice(1);
  gsap.set(later, { autoAlpha: 0 });
  gsap.set(later.flatMap(s => [...s.querySelectorAll('.ln > span')]), { yPercent: 115 });
  gsap.set(later.flatMap(s => [...s.querySelectorAll('.kicker,.sub,.chips,.fine,.actions,.cue')]), { opacity: 0, y: 24 });
  scenes[0].style.visibility = 'visible';

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  shots.forEach((s, i) => {
    const t0 = i * SPAN;
    // Dolly: mỗi cảnh đẩy máy vào chậm suốt thời gian nó hiện
    tl.fromTo(s, { scale: 1.02 }, { scale: 1.2, duration: SPAN + 2 }, Math.max(0, t0 - 1));
    if (i > 0) {
      tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 2.5 }, t0 - 1.5);
      tl.to(shots[i - 1], { opacity: 0, duration: 2.5 }, t0 - 1.5);
    }
  });
  scenes.forEach((sc, i) => {
    const t0 = i * SPAN + (i === 0 ? 0 : 1.2), t1 = i * SPAN + SPAN - 1.4;
    const lines = sc.querySelectorAll('.ln > span');
    const rest = sc.querySelectorAll('.kicker,.sub,.chips,.fine,.actions,.cue');
    if (i > 0) {
      tl.set(sc, { autoAlpha: 1 }, t0);
      tl.to(rest, { opacity: 1, y: 0, duration: 1.2, stagger: .25 }, t0 + .3);
      tl.to(lines, { yPercent: 0, duration: 1.3, stagger: .25, ease: 'power3.out' }, t0);
    }
    if (i < scenes.length - 1) {                       // cảnh cuối giữ lại
      tl.to(lines, { yPercent: -115, duration: 1, stagger: .1 }, t1);
      tl.to(rest, { opacity: 0, y: -20, duration: .9 }, t1);
      tl.set(sc, { autoAlpha: 0 }, t1 + 1.1);
    }
  });
  tl.to({}, { duration: 1 });                          // đệm cuối để cảnh CTA nằm yên
  const total = tl.duration();

  let last = -1, lastY = scrollY;
  ScrollTrigger.create({
    trigger: '.film', start: 'top top', end: 'bottom bottom', scrub: 1.2, animation: tl,
    onUpdate(self) {
      prog.style.transform = `scaleX(${self.progress})`;
      boost = Math.min(4, boost + Math.abs(scrollY - lastY) / 60); lastY = scrollY;   // cuộn nhanh → đèn bay nhanh
      const i = Math.min(N - 1, Math.floor((self.progress * total + 1.5) / SPAN));
      if (i !== last) {
        last = i; cur.textContent = String(i + 1).padStart(2, '0'); label.textContent = scenes[i].dataset.label;
        // Chỉ phát video của cảnh đang hiện để nhẹ máy
        videos.forEach((v, k) => { if (!v) return; if (k === i || k === i + 1 || k === i - 1) { v.play().catch(() => {}); } else v.pause(); });
      }
    }
  });
  videos[0] && videos[0].play().catch(() => {});
})();
