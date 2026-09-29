(function () {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shots = [...document.querySelectorAll('.shot')];
  const scenes = [...document.querySelectorAll('.scene')];
  const N = shots.length;                      // 6 cảnh, mỗi cảnh một "khoảng" thời gian
  const SPAN = 10;

  if (!window.gsap || !window.ScrollTrigger) return; // dạng tĩnh
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('live');

  const cur = document.getElementById('cur'), label = document.getElementById('label'), prog = document.getElementById('prog');

  /* ---------- Lồng đèn bay lên (chủ đề phi trọng lực) ---------- */
  const cv = document.getElementById('lanterns'), ctx = cv.getContext('2d');
  let W, H, lamps = [], boost = 0, lastDraw = 0;
  const DPR = 1;                                           // canvas nền mờ: 1x là đủ
  const sprites = [22, 30, 38].map(hue => {                // 3 sprite phát sáng dựng sẵn
    const s = document.createElement('canvas'); s.width = s.height = 128;
    const g = s.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, `hsla(${hue},95%,62%,.55)`); gr.addColorStop(.35, `hsla(${hue},90%,50%,.18)`); gr.addColorStop(1, 'hsla(20,90%,40%,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return s;
  });
  function resize() {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    const n = innerWidth < 720 ? 10 : 18;
    lamps = Array.from({ length: n }, () => mk(true));
  }
  function mk(anywhere) {
    return { x: Math.random() * W, y: anywhere ? Math.random() * H : H + 60,
      r: (5 + Math.random() * 12), v: (.12 + Math.random() * .35) * 2, s: Math.random() * 6.28, sp: sprites[(Math.random() * 3) | 0] };
  }
  function draw(t) {
    requestAnimationFrame(draw);
    if (t - lastDraw < 32) return;                         // ~30fps
    const dt = Math.min(3, (t - lastDraw) / 16.7); lastDraw = t;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const l of lamps) {
      l.y -= l.v * (1 + boost) * dt; l.x += Math.sin(t / 1800 + l.s) * .7;
      if (l.y < -80) Object.assign(l, mk(false));
      const d = l.r * 8; ctx.drawImage(l.sp, l.x - d / 2, l.y - d / 2, d, d);
    }
    boost *= .92;
  }
  addEventListener('resize', resize); resize();
  if (!reduce) requestAnimationFrame(draw);

  // hạt phim: tile nhiễu 128px dựng một lần (thay cho SVG feTurbulence phủ 400% diện tích)
  (function () {
    const g = document.createElement('canvas'); g.width = g.height = 128;
    const x = g.getContext('2d'), im = x.createImageData(128, 128);
    for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0);
    const el = document.querySelector('.grain'); if (el) el.style.backgroundImage = `url(${g.toDataURL()})`;
  })();

  /* ---------- Mở màn: letterbox khép kín rồi mở ra hoàn toàn ---------- */
  const rest = parseFloat(getComputedStyle(document.querySelector('.letter')).getPropertyValue('--rest')) ?? 0;
  gsap.fromTo('.letter', { scaleY: 1 }, { scaleY: rest, duration: 2.4, ease: 'power3.inOut', delay: .5, onComplete: () => gsap.set('.letter', { display: 'none' }) });

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
    // Zoom xen kẽ: cảnh chẵn zoom VÀO, cảnh lẻ zoom RA. Tỉ lệ cuối cảnh này bằng tỉ lệ đầu cảnh kế nên khi giao nhau
    // chuyển động liền mạch (vào -> ra -> vào ...), chỉ dùng transform nên rất nhẹ.
    const z0 = Math.max(0, t0 - 1.5), z1 = i === N - 1 ? t0 + SPAN : t0 + SPAN + 1.5;
    const IN = 1.0, OUT = 1.4;
    tl.fromTo(s, { scale: i % 2 ? OUT : IN }, { scale: i % 2 ? IN : OUT, duration: z1 - z0 }, z0);
    if (i > 0) {
      tl.fromTo(s, { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.5 }, t0 - 1.5);
      tl.to(shots[i - 1], { autoAlpha: 0, duration: 2.5 }, t0 - 1.5);
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
      const i = Math.min(N - 1, Math.floor((self.progress * total + 0.1) / SPAN));
      if (i !== last) {
        last = i; cur.textContent = String(i + 1).padStart(2, '0'); label.textContent = scenes[i].dataset.label;
      }
    }
  });
})();
