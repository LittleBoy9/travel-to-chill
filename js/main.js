/* =========================================================
   Travel to Chill — interactions
   Vanilla JS + GSAP/ScrollTrigger + Lenis (all optional:
   the page stays fully usable if any CDN script fails).
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap && window.ScrollTrigger ? window.gsap : null;
  const animate = !!G && !reduce;
  const WA = '918318932610';
  const EMAIL = 'official.traveltochill@gmail.com';
  const fmt = n => Math.round(n).toLocaleString('en-IN');

  if (!animate) root.classList.add('no-anim', 'no-pin');
  if (G) G.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    if (G) {
      lenis.on('scroll', ScrollTrigger.update);
      G.ticker.add(t => lenis.raf(t * 1000));
      G.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollToTarget = target => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    else $(target)?.scrollIntoView({ behavior: 'smooth' });
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#') return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(id === '#top' ? 0 : id);
  });

  /* ---------- Text splitting ---------- */
  $$('.split-chars').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach(c => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
    });
  });

  const splitWords = (el, cls, skip) => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = cls;
            if (cls === 'w') { const i = document.createElement('span'); i.textContent = part; w.appendChild(i); }
            else w.textContent = part;
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !(skip && n.matches(skip))) walk(n);
      });
    };
    walk(el);
  };
  $$('.js-split').forEach(el => splitWords(el, 'w'));
  const manifesto = $('.js-manifesto');
  if (manifesto) splitWords(manifesto, 'mw', '.pill-img');

  /* ---------- Preloader + hero intro ---------- */
  const loader = $('.loader');
  const finishLoading = () => {
    document.body.classList.remove('is-loading');
    lenis?.start();
  };
  const heroIntro = () => {
    if (!animate) return;
    const tl = G.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero__bg', { scale: 1.25, duration: 2.4 }, 0)
      .from('.hero__mtn--back', { yPercent: 35, duration: 2 }, 0.1)
      .from('.hero__mtn--mid', { yPercent: 55, duration: 2 }, 0.2)
      .from('.hero__mtn--front', { yPercent: 70, duration: 2 }, 0.3)
      .from('.hero__line .ch', { yPercent: 115, rotate: 8, duration: 1.5, stagger: 0.045 }, 0.25)
      .from('.hero__kicker', { opacity: 0, y: 16, duration: 1 }, 0.6)
      .from('.hero__lead, .hero__ctas > *, .hero__meta > div, .hero__scroll', { opacity: 0, y: 24, duration: 1.2, stagger: 0.08 }, 0.9);
  };

  if (animate && loader) {
    lenis?.stop();
    const trail = $('.loader__trail'), plane = $('.loader__plane'), logoImg = $('.loader__logo img');
    const L = trail.getTotalLength();
    const LOGO_X0 = 132, LOGO_X1 = 468; // logo spans 22%–78% of the 600-wide stage
    trail.style.strokeDasharray = L;
    trail.style.strokeDashoffset = L;
    // split tagline into letters
    const tag = $('.loader__tag');
    tag.innerHTML = [...tag.textContent].map(c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');

    // plane flies along the trail and "writes" the logo in as it passes over it
    const flight = { p: 0 };
    const fly = () => {
      const l = flight.p * L;
      const pt = trail.getPointAtLength(l);
      const ahead = trail.getPointAtLength(Math.min(L, l + 1));
      const ang = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI;
      plane.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${ang})`);
      trail.style.strokeDashoffset = L - l;
      const reveal = Math.max(0, Math.min(1, (pt.x - LOGO_X0) / (LOGO_X1 - LOGO_X0)));
      logoImg.style.clipPath = `inset(-10% ${(1 - reveal) * 100}% -10% 0)`;
    };
    fly();

    G.timeline()
      .to(flight, { p: 1, duration: 2.1, ease: 'power1.inOut', onUpdate: fly })
      .fromTo(logoImg, { filter: 'blur(6px)', scale: 1.06 }, { filter: 'blur(0px)', scale: 1, duration: 1.1, ease: 'expo.out' }, 0.7)
      .to(plane, { opacity: 0, duration: 0.35 }, 1.75)
      .to(trail, { opacity: 0, duration: 0.6 }, 1.8)
      .to('.loader__shine', { backgroundPosition: '-20% 0', duration: 1, ease: 'power2.inOut' }, 1.9)
      .from('.loader__tag .ch', { yPercent: 120, opacity: 0, duration: 0.7, stagger: 0.025, ease: 'expo.out' }, 1.7)
      .to('.loader__inner', { opacity: 0, scale: 0.94, duration: 0.5, ease: 'power2.in' }, '+=0.35')
      .to('.loader__panel--a', { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, '<0.2')
      .to('.loader__panel--b', { yPercent: 100, duration: 1.2, ease: 'expo.inOut' }, '<')
      .add(() => { heroIntro(); }, '<0.25')
      .add(() => { loader.classList.add('is-done'); finishLoading(); }, '<0.6');
  } else {
    loader?.remove();
    finishLoading();
  }

  /* ---------- Clock ---------- */
  const clock = $('.js-clock');
  if (clock) {
    const f = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
    const tick = () => { clock.textContent = f.format(new Date()).toUpperCase() + ' IST'; };
    tick(); setInterval(tick, 15000);
  }

  /* ---------- Cursor + magnetic ---------- */
  if (fine && !reduce) {
    const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    const loop = () => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor]');
      if (t) { label.textContent = t.dataset.cursor; cur.classList.add('is-hover'); }
      else cur.classList.remove('is-hover');
    });
    document.addEventListener('mouseleave', () => { cur.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { cur.style.opacity = 1; });

    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.3;
        const y = (e.clientY - r.top - r.height / 2) * 0.4;
        el.style.translate = `${x}px ${y}px`;
      });
      el.addEventListener('mouseleave', () => { el.style.translate = '0 0'; });
      el.style.transition = 'translate .5s cubic-bezier(.22,1,.36,1), color .4s';
    });

    /* Hero mouse parallax (uses CSS `translate`, so it composes with GSAP transforms) */
    const layers = $$('.hero [data-depth]');
    const hero = $('.hero');
    hero.addEventListener('mousemove', e => {
      const cx = e.clientX / innerWidth - 0.5, cy = e.clientY / innerHeight - 0.5;
      layers.forEach(l => {
        const d = parseFloat(l.dataset.depth) * 600;
        l.style.translate = `${-cx * d}px ${-cy * d * 0.4}px`;
      });
    });
    layers.forEach(l => { l.style.transition = 'translate 1.2s cubic-bezier(.22,1,.36,1)'; });
  }

  /* ---------- Mist canvas ---------- */
  const mist = $('.hero__mist');
  if (mist && !reduce) {
    const ctx = mist.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    let W, H, parts = [], running = true;
    const size = () => {
      W = mist.clientWidth; H = mist.clientHeight;
      mist.width = W * dpr; mist.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size(); addEventListener('resize', size);
    for (let i = 0; i < 22; i++) {
      parts.push({ x: Math.random() * W, y: H * (0.35 + Math.random() * 0.6), r: 120 + Math.random() * 260, v: 0.08 + Math.random() * 0.3, a: 0.03 + Math.random() * 0.06 });
    }
    const draw = () => {
      if (running) {
        ctx.clearRect(0, 0, W, H);
        parts.forEach(p => {
          p.x += p.v; if (p.x - p.r > W) p.x = -p.r;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, `rgba(240,244,240,${p.a})`);
          g.addColorStop(1, 'rgba(240,244,240,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        });
      }
      requestAnimationFrame(draw);
    };
    draw();
    new IntersectionObserver(([en]) => { running = en.isIntersecting; }).observe(mist);
  }

  /* ---------- Nav + altimeter ---------- */
  const nav = $('.nav'), dock = $('.dock');
  const altFill = $('.altimeter__fill'), altNum = $('.altimeter__num');
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    dock.classList.toggle('is-hidden', y < innerHeight * 0.6);
    if (!document.body.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY && y > 500);
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, y / max) : 0;
    altFill.style.height = p * 100 + '%';
    altNum.textContent = fmt(9 + p * (5183 - 9));
    $('.altimeter__read').style.bottom = p * 100 + '%';
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Menu ---------- */
  const burger = $('.burger'), menu = $('.menu');
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    lenis?.start();
  }
  burger.addEventListener('click', () => {
    if (document.body.classList.contains('menu-open')) return closeMenu();
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    lenis?.stop();
    if (animate) G.from('.menu__list a', { yPercent: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.05, delay: 0.25 });
  });
  $$('.menu__list a').forEach(a => a.addEventListener('mouseenter', () => {
    $$('.menu__media img').forEach(img => img.classList.toggle('is-active', img.dataset.key === a.dataset.key));
  }));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Scroll animations ---------- */
  if (animate) {
    // Hero exit
    const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    G.to('.hero__title-wrap', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: heroST });
    G.to('.hero__bg', { yPercent: 18, ease: 'none', scrollTrigger: heroST });
    G.to('.hero__mtn--mid', { y: -60, ease: 'none', scrollTrigger: heroST });
    G.to('.hero__mtn--back', { y: -20, ease: 'none', scrollTrigger: heroST });
    G.to('.hero__bottom', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '40% top', scrub: true } });

    // Headings
    $$('.js-split').forEach(el => {
      G.from(el.querySelectorAll('.w > span'), { yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    $$('.eyebrow').forEach(el => G.from(el, { opacity: 0, x: -24, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));

    // Manifesto: words light up as you scroll, image pills grow
    G.to('.manifesto .mw', { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top 78%', end: 'bottom 50%', scrub: true } });
    G.from('.pill-img', { width: 0, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top 78%', end: 'bottom 50%', scrub: true } });

    // Batched reveals
    const batchReveal = (sel, opts = {}) => {
      G.set(sel, { opacity: 0, y: 50 });
      ScrollTrigger.batch(sel, { start: 'top 90%', onEnter: els => G.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, ...opts }) });
    };
    batchReveal('.stat');
    batchReveal('.tile');
    batchReveal('.qa');
    batchReveal('.foot__cols > div');
    G.from('.motto > *', { opacity: 0, y: 40, duration: 1.2, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.motto', start: 'top 80%' } });
  }

  /* Counters */
  const countUp = el => {
    const to = +el.dataset.to;
    if (!animate) { el.textContent = to; return; }
    const o = { v: 0 };
    G.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
  };
  const io = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); } }), { threshold: 0.6 });
  $$('.js-count').forEach(el => io.observe(el));

  /* ---------- The Route: horizontal pin + elevation profile ---------- */
  const route = $('.route'), track = $('.route__track');
  if (animate && route) {
    const svg = $('.route__svg'), pathBg = $('.route__path-bg'), path = $('.route__path'), car = $('.route__car'), marks = $('.route__marks');
    const hudAlt = $('.js-hud-alt'), hudStop = $('.js-hud-stop'), hudBar = $('.js-hud-bar');
    const panels = $$('.route__panel');
    const MAX_ALT = 2800;
    let len = 0, H = 0, pts = [], markEls = [];
    const altToY = a => H - 18 - (a / MAX_ALT) * (H - 60);
    const yToAlt = y => Math.max(0, ((H - 18 - y) / (H - 60)) * MAX_ALT);
    const dist = () => track.scrollWidth - innerWidth;

    const build = () => {
      const W = track.scrollWidth;
      H = svg.clientHeight || innerHeight * 0.24;
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      pts = panels.map(p => ({ x: p.offsetLeft + p.offsetWidth * 0.5, alt: +p.dataset.alt, name: p.dataset.name }));
      const all = [{ x: 0, alt: 9 }, ...pts, { x: W, alt: 9 }];
      let d = `M0 ${altToY(9)}`;
      for (let i = 1; i < all.length; i++) {
        const a = all[i - 1], b = all[i], mx = (a.x + b.x) / 2;
        d += ` C${mx} ${altToY(a.alt)} ${mx} ${altToY(b.alt)} ${b.x} ${altToY(b.alt)}`;
      }
      pathBg.setAttribute('d', d); path.setAttribute('d', d);
      len = path.getTotalLength();
      path.style.strokeDasharray = len;
      marks.innerHTML = '';
      markEls = pts.map(p => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const y = altToY(p.alt);
        g.innerHTML = `<circle cx="${p.x}" cy="${y}" r="7"></circle><text x="${p.x + 14}" y="${y - 12}">${p.name} · ${fmt(p.alt)} m</text>`;
        marks.appendChild(g);
        return g.querySelector('circle');
      });
      update();
    };

    const lengthAtX = x => {
      let lo = 0, hi = len;
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2;
        if (path.getPointAtLength(mid).x < x) lo = mid; else hi = mid;
      }
      return lo;
    };

    function update() {
      if (!len) return;
      const cx = -G.getProperty(track, 'x') + innerWidth * 0.5;
      const l = lengthAtX(cx);
      const pt = path.getPointAtLength(l);
      path.style.strokeDashoffset = len - l;
      car.setAttribute('cx', pt.x); car.setAttribute('cy', pt.y);
      hudAlt.textContent = fmt(yToAlt(pt.y));
      let near = 0, best = Infinity;
      pts.forEach((p, i) => {
        const dd = Math.abs(p.x - cx);
        if (dd < best) { best = dd; near = i; }
        markEls[i]?.classList.toggle('is-hit', p.x <= cx + 2);
      });
      hudStop.textContent = pts[near]?.name || '';
      hudBar.style.width = Math.min(100, (cx / track.scrollWidth) * 100) + '%';
    }

    const hTween = G.to(track, {
      x: () => -dist(),
      ease: 'none',
      onUpdate: update,
      scrollTrigger: {
        trigger: route, start: 'top top', end: () => '+=' + dist(),
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onRefresh: build,
      },
    });

    $$('.route__img img').forEach(img => {
      G.fromTo(img, { xPercent: 9 }, { xPercent: -9, ease: 'none', scrollTrigger: { trigger: img.closest('.route__panel'), containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true } });
    });
    $$('.route__txt, .route__njp').forEach(t => {
      G.from(t.children, { y: 60, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: t, containerAnimation: hTween, start: 'left 75%' } });
    });
    build();
  }

  /* ---------- Marquee ---------- */
  const row = $('.marquee__row');
  if (row) {
    row.innerHTML += row.innerHTML;
    if (animate) {
      const loop = G.to(row, { xPercent: -50, repeat: -1, duration: 28, ease: 'none' });
      const skew = G.quickTo(row, 'skewX', { duration: 0.6, ease: 'power3' });
      ScrollTrigger.create({
        trigger: '.marquee', start: 'top bottom', end: 'bottom top',
        onUpdate(self) {
          const v = self.getVelocity();
          G.to(loop, { timeScale: 1 + Math.min(Math.abs(v) / 250, 6), duration: 0.2, overwrite: true, onComplete: () => G.to(loop, { timeScale: 1, duration: 1.2 }) });
          skew(Math.max(-12, Math.min(12, -v / 150)));
          clearTimeout(row._t); row._t = setTimeout(() => skew(0), 120);
        },
      });
    }
  }

  /* ---------- Destinations accordion ---------- */
  const dcards = $$('.dcard');
  const openCard = c => dcards.forEach(d => d.classList.toggle('is-open', d === c));
  dcards.forEach(c => {
    if (fine) c.addEventListener('mouseenter', () => openCard(c));
    c.addEventListener('click', () => openCard(c));
    c.addEventListener('focus', () => openCard(c));
  });
  $$('.js-goto-pack').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    setDest(b.dataset.target);
    scrollToTarget('#packages');
  }));

  /* ---------- Trip Studio ---------- */
  const INCL_STD = ['Hotel stay', 'Breakfast · Lunch · Dinner', 'Reserved cars', 'NJP pickup & drop'];
  const PACKS = {
    gangtok: {
      tagline: 'Four specialised Gangtok tour packages designed for ultimate comfort and sightseeing. Minimum group of 5.',
      items: [
        { kicker: 'Gangtok Package 1', title: 'The Quick Escape', rating: 4.8, reviews: 232, price: 7000, min: 5, img: 'assets/img/gangtok-tsomgo-lake.jpg',
          days: ['NJP / Bagdogra pickup, drive to Gangtok. Evening stroll on MG Marg.', 'Tsomgo Lake & Baba Mandir — snow, yaks and prayer flags.', 'Gangtok sightseeing: Rumtek & Enchey monasteries, Banjhakri Falls, ropeway.', 'Breakfast and drop to NJP station.'],
          incl: [...INCL_STD, 'Permits handled'] },
        { kicker: 'Gangtok Package 2', title: 'The Lachung Adventure', rating: 4.7, reviews: 122, price: 8500, min: 5, img: 'assets/img/lachung-snow-couple.jpg',
          days: ['NJP pickup, transfer to Gangtok.', 'Drive to Lachung via Seven Sisters Waterfall and Chungthang.', 'Yumthang Valley — the Valley of Flowers — then back to Gangtok.', 'Tsomgo Lake & Baba Mandir day trip.', 'Drop to NJP station.'],
          incl: [...INCL_STD, 'North Sikkim permits'] },
        { kicker: 'Gangtok Package 3', title: 'North Sikkim Experience', rating: 4.8, reviews: 232, price: 9850, min: 5, img: 'assets/img/hero-valley-hiker.jpg',
          days: ['NJP pickup, transfer to Gangtok.', 'Drive north to Lachen.', 'Sunrise at Gurudongmar Lake (5,183 m), continue to Lachung.', 'Yumthang Valley, return to Gangtok.', 'Tsomgo Lake & Baba Mandir.', 'Drop to NJP station.'],
          incl: [...INCL_STD, 'North Sikkim permits'] },
        { kicker: 'Gangtok Package 4', title: 'Pelling & Namchi Circuit', rating: 4.8, reviews: 232, price: 8900, min: 5, img: 'assets/img/friends-forest-trek.jpg',
          days: ['NJP pickup, transfer to Gangtok.', 'Gangtok city sightseeing.', 'To Pelling via Namchi — Char Dham & Samdruptse.', 'Pelling Skywalk, Pemayangtse, Rabdentse ruins, Khecheopalri Lake & Kanchenjunga Falls.', 'Drop to NJP station.'],
          incl: INCL_STD },
      ],
    },
    darjeeling: {
      tagline: 'Darjeeling: The Queen of Hills — designed for those seeking peace and beauty.',
      items: [
        { kicker: 'Darjeeling Package', title: 'The Magic of Darjeeling', rating: 4.7, reviews: 122, price: 3599, min: 4, badge: 'Last-minute deal', img: 'assets/img/darjeeling-tea-cottages.jpg',
          days: ['NJP pickup and transfer to your Darjeeling hotel.', 'Early-morning Tiger Hill sunrise, Ghoom Monastery, Batasia Loop, Zoo, Ropeway and Tea Gardens.', 'Scenic trip to Tinchuley, Lamahatta and Takdah.', 'Mirik Lake, Pashupati Market (Nepal border) and Lepcha Jagat before NJP drop-off.'],
          incl: ['3-Star accommodation', 'Breakfast · Lunch · Dinner', 'Reserved vehicles', 'NJP pickup & drop'],
          note: 'Ropeway parking / tickets are extra.' },
      ],
    },
    dooars: {
      tagline: 'Dooars — Gorumara Jungle Special. Experience the best holiday deals in the wilderness of North Bengal.',
      items: [
        { kicker: 'Dooars Package', title: 'Gorumara Jungle Special', rating: 4.6, reviews: 247, price: 3599, min: 4, badge: 'Best value', img: 'assets/img/dooars-murti-river.jpg',
          days: ['NJP pickup to a Lataguri homestay / resort.', 'Sightseeing at Murti River, Rocky Island, Jhalong, Samsing and South Khayerbari.', 'Thrilling Gorumara Jungle Safari by jeep to spot wildlife.', 'Departure to NJP station.'],
          incl: ['Rooms with swimming pool access', 'Breakfast · Lunch · Dinner', 'Reserved cars for all transfers', 'Jeep safari'] },
      ],
    },
  };
  const S = { dest: 'gangtok', idx: 0, pax: 5 };
  const list = $('.js-pack-list');
  const tabs = $$('.tab'), ink = $('.tabs__ink');

  const moveInk = () => {
    const t = tabs.find(x => x.classList.contains('is-active'));
    if (!t) return;
    ink.style.width = t.offsetWidth + 'px';
    ink.style.transform = `translateX(${t.offsetLeft}px)`;
  };

  const shown = { pp: { v: 0 }, total: { v: 0 } };
  const tweenNum = (el, key, to) => {
    const o = shown[key];
    if (!animate) { o.v = to; el.textContent = fmt(to); return; }
    G.to(o, { v: to, duration: 0.8, overwrite: true, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); } });
  };

  const updatePrice = () => {
    const p = PACKS[S.dest].items[S.idx];
    $('.js-pax').textContent = S.pax;
    $('.js-min').textContent = `Min. ${p.min}`;
    tweenNum($('.js-pp'), 'pp', p.price);
    tweenNum($('.js-total'), 'total', p.price * S.pax);
    const msg = `Hi Travel to Chill! I'd like to book "${p.title}" (${p.kicker}) for ${S.pax} travellers. Quoted ₹${fmt(p.price)}/person, ₹${fmt(p.price * S.pax)} total. Please share availability.`;
    $('.js-book').href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  };

  const selectPack = i => {
    S.idx = i;
    const p = PACKS[S.dest].items[i];
    $$('.pcard', list).forEach((c, j) => { c.classList.toggle('is-active', j === i); c.setAttribute('aria-selected', j === i); });
    const img = $('.js-sd-img');
    img.src = p.img; img.alt = p.title;
    $('.js-sd-badge').textContent = p.badge || '';
    $('.js-sd-kicker').textContent = p.kicker;
    $('.js-sd-title').textContent = p.title;
    $('.js-sd-rating').textContent = `★ ${p.rating}`;
    $('.js-sd-reviews').textContent = `${p.reviews} reviews`;
    $('.js-sd-days').innerHTML = p.days.map((d, k) => `<li><b>Day ${k + 1}</b><span>${d}</span></li>`).join('');
    $('.js-sd-incl').innerHTML = p.incl.map(x => `<li>${x}</li>`).join('');
    $('.js-sd-note').textContent = p.note || '';
    S.pax = Math.max(S.pax, p.min);
    updatePrice();
    if (animate) {
      G.fromTo(img, { scale: 1.18, opacity: 0.2 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out' });
      G.from('.js-sd-days li', { x: -20, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'expo.out' });
      G.from('.js-sd-incl li', { scale: 0.8, opacity: 0, duration: 0.6, stagger: 0.04, ease: 'back.out(2)', delay: 0.2 });
    }
  };

  const renderList = () => {
    const items = PACKS[S.dest].items;
    $('.js-tagline').textContent = PACKS[S.dest].tagline;
    list.innerHTML = items.map((p, i) => `
      <button type="button" class="pcard" role="option" data-i="${i}" data-cursor="Select">
        <span class="pcard__k mono">${p.kicker}</span>
        <span class="pcard__t">${p.title}</span>
        <span class="pcard__p">₹${fmt(p.price)}</span>
        <span class="pcard__r mono">★ ${p.rating} · ${p.reviews} reviews</span>
        <span class="pcard__r mono">/ person</span>
      </button>`).join('');
    $$('.pcard', list).forEach(c => c.addEventListener('click', () => selectPack(+c.dataset.i)));
    if (animate) G.from($$('.pcard', list), { y: 30, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out' });
    selectPack(0);
  };

  function setDest(dest) {
    if (!PACKS[dest]) return;
    S.dest = dest;
    tabs.forEach(t => { const on = t.dataset.tab === dest; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    moveInk();
    renderList();
  }
  tabs.forEach(t => t.addEventListener('click', () => setDest(t.dataset.tab)));
  $('.js-minus').addEventListener('click', () => { const p = PACKS[S.dest].items[S.idx]; S.pax = Math.max(p.min, S.pax - 1); updatePrice(); });
  $('.js-plus').addEventListener('click', () => { S.pax = Math.min(60, S.pax + 1); updatePrice(); });
  addEventListener('resize', moveInk);
  document.fonts?.ready.then(moveInk);
  setDest('gangtok');

  /* ---------- Services stack ---------- */
  if (animate) {
    const cards = $$('.scard');
    cards.forEach(c => {
      G.fromTo(c.querySelector('.scard__img img'), { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 90px', scrub: true } });
    });
    // Stack effect only where cards are sticky (whole card fits on screen) — matches the CSS media query
    G.matchMedia().add('(min-width: 900px) and (min-height: 700px)', () => {
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        if (next) G.to(c, { scale: 0.92, filter: 'brightness(.6)', ease: 'none', scrollTrigger: { trigger: next, start: 'top 75%', end: 'top 90px', scrub: true } });
      });
    });
  }

  /* ---------- Bento: chill slider ---------- */
  const chill = $('.js-chill');
  if (chill) {
    const title = $('.js-chill-title'), sub = $('.js-chill-sub'), bar = $('.js-stress'), num = $('.js-stress-num');
    const render = () => {
      const v = +chill.value, k = v / 100;
      const stress = Math.round(94 * (1 - k));
      bar.style.width = Math.max(3, stress) + '%';
      bar.style.background = `hsl(${8 + 130 * k} 78% 52%)`;
      num.textContent = stress;
      if (v < 34) { title.textContent = 'Planning it yourself'; sub.textContent = `${Math.round(47 * (1 - k))} tabs open · ${Math.max(1, Math.round(6 * (1 - k)))} hotel calls · 0 sleep`; }
      else if (v < 80) { title.textContent = 'Getting warmer…'; sub.textContent = `${Math.round(47 * (1 - k))} tabs open · we're on the phone for you`; }
      else { title.textContent = 'Booked with Travel to Chill.'; sub.textContent = '0 tabs · 3 meals sorted · 1 chai in hand'; }
      title.style.color = v >= 80 ? 'var(--saffron)' : '';
    };
    chill.addEventListener('input', render);
    render();
    if (animate) {
      ScrollTrigger.create({
        trigger: chill, start: 'top 80%', once: true,
        onEnter: () => {
          const o = { v: 0 };
          G.timeline().to(o, { v: 38, duration: 1, ease: 'power2.inOut', onUpdate: () => { chill.value = o.v; render(); } })
            .to(o, { v: 0, duration: 0.9, ease: 'power2.inOut', onUpdate: () => { chill.value = o.v; render(); } });
        },
      });
    }
  }

  /* Customization toggles */
  const toggles = $$('.js-toggles li');
  toggles.forEach((li, i) => {
    if (i % 2 === 0) li.classList.add('on');
    li.addEventListener('click', () => li.classList.toggle('on'));
  });
  if (!reduce && toggles.length) setInterval(() => { toggles[Math.floor(Math.random() * toggles.length)].classList.toggle('on'); }, 1600);

  /* Sun arc: breakfast → lunch → dinner */
  const arc = $('.sunarc__path'), sun = $('.sunarc__sun');
  if (arc && !reduce) {
    const L = arc.getTotalLength();
    const t0 = performance.now();
    const step = now => {
      const t = ((now - t0) / 6000) % 1;
      const pt = arc.getPointAtLength(t * L);
      sun.setAttribute('cx', pt.x); sun.setAttribute('cy', pt.y);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Vista ---------- */
  if (animate) {
    G.fromTo('.vista__bg img', { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.vista', start: 'top bottom', end: 'bottom top', scrub: true } });
    G.from('.vista__title', { y: 80, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.vista', start: 'top 60%' } }); // eyebrow has its own reveal
  }

  /* ---------- FAQ smooth accordion ---------- */
  if (animate) {
    $$('.qa').forEach(d => {
      const s = d.querySelector('summary'), a = d.querySelector('.qa__a');
      s.addEventListener('click', e => {
        e.preventDefault();
        if (d.open) {
          G.to(a, { height: 0, opacity: 0, duration: 0.5, ease: 'power3.inOut', onComplete: () => { d.open = false; G.set(a, { clearProps: 'all' }); ScrollTrigger.refresh(); } });
        } else {
          d.open = true;
          G.from(a, { height: 0, opacity: 0, duration: 0.6, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
        }
      });
    });
  }

  /* ---------- Quote quiz + boarding pass ---------- */
  const quiz = $('.js-quiz');
  if (quiz) {
    const steps = $$('.qstep', quiz);
    const back = $('.js-back'), bar = $('.js-quiz-bar');
    const fName = $('[name="fullname"]', quiz), fPhone = $('[name="phone"]', quiz), fNote = $('[name="note"]', quiz);
    const Q = { group: null, min: 4, pax: 4, dest: null, code: null, when: null };
    let cur = 0;

    const setPass = (sel, val) => {
      const el = $(sel);
      if (el.textContent === val) return;
      el.textContent = val;
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    };
    const hash = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
    const barcode = seed => {
      let h = hash(seed);
      const bars = [];
      for (let i = 0; i < 34; i++) { h = (h * 1103515245 + 12345) >>> 0; const w = 1 + (h % 4); const gap = 1 + ((h >> 3) % 3); bars.push(`<i style="flex:0 0 ${w}px;margin:0 ${gap}px 0 0"></i>`); }
      $('.js-barcode').innerHTML = bars.join('');
      $('.js-p-id').textContent = String(hash(seed) % 10000).padStart(4, '0');
    };
    const refreshPass = () => {
      const name = fName.value.trim();
      setPass('.js-p-name', name || 'You');
      setPass('.js-p-group', Q.group || '—');
      setPass('.js-p-pax', Q.group ? String(Q.pax) : '—');
      setPass('.js-p-when', Q.when || '—');
      setPass('.js-p-dest', Q.dest || 'Somewhere chill');
      setPass('.js-p-code', Q.code || '???');
      barcode(`${name}|${Q.dest}|${Q.pax}|${Q.when}`);
    };

    const go = n => {
      cur = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach((s, i) => s.classList.toggle('is-active', i === cur));
      bar.style.width = ((cur + 1) / steps.length) * 100 + '%';
      back.hidden = cur === 0;
      if (cur === 4) setTimeout(() => fName.focus({ preventScroll: true }), 300);
    };

    // month options
    const months = $('.js-months');
    const now = new Date();
    const mlist = [];
    for (let i = 0; i < 11; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      mlist.push(d.toLocaleString('en-US', { month: 'short' }) + " '" + String(d.getFullYear()).slice(2));
    }
    months.innerHTML = [...mlist, 'Flexible'].map(m => `<button type="button" data-v="${m}">${m}</button>`).join('');

    const minText = $('.js-q-min'), paxOut = $('.js-q-pax');
    const setPax = v => { Q.pax = Math.max(Q.min, Math.min(80, v)); paxOut.textContent = Q.pax; refreshPass(); };

    $$('.opts', quiz).forEach(group => {
      group.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        $$('button', group).forEach(x => x.classList.toggle('is-picked', x === b));
        const f = group.dataset.field;
        if (f === 'group') {
          Q.group = b.dataset.v; Q.min = +b.dataset.min;
          minText.textContent = Q.min >= 10 ? 'Minimum 10 for corporate groups' : 'Minimum 4 for family & friends groups';
          setPax(Math.max(Q.pax, Q.min));
        } else if (f === 'dest') {
          Q.dest = b.dataset.v; Q.code = b.dataset.code;
          if (animate) G.fromTo('.pass__jet', { x: -60 }, { x: 0, duration: 1.2, ease: 'expo.out' });
        } else if (f === 'when') Q.when = b.dataset.v;
        refreshPass();
        setTimeout(() => go(cur + 1), 380);
      });
    });
    $('.js-q-minus').addEventListener('click', () => setPax(Q.pax - 1));
    $('.js-q-plus').addEventListener('click', () => setPax(Q.pax + 1));
    $('.js-next').addEventListener('click', () => go(2));
    back.addEventListener('click', () => go(cur - 1));
    fName.addEventListener('input', refreshPass);

    const compose = () => {
      const lines = [
        "Hi Travel to Chill! I'd like a custom quote.",
        `Group: ${Q.group || '-'} (${Q.pax} travellers)`,
        `Destination: ${Q.dest || '-'}`,
        `When: ${Q.when || '-'}`,
        `Name: ${fName.value.trim()}`,
        `Phone: ${fPhone.value.trim()}`,
      ];
      if (fNote.value.trim()) lines.push(`Notes: ${fNote.value.trim()}`);
      return lines.join('\n');
    };
    const valid = () => {
      const err = $('.quiz__err');
      if (!fName.value.trim()) { err.textContent = 'Please tell us your name.'; fName.focus(); return false; }
      if (fPhone.value.replace(/\D/g, '').length < 10) { err.textContent = 'Please add a valid phone number so we can call you back.'; fPhone.focus(); return false; }
      err.textContent = '';
      return true;
    };
    quiz.addEventListener('submit', e => {
      e.preventDefault();
      if (!valid()) return;
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(compose())}`, '_blank', 'noopener');
    });
    $('.js-email').addEventListener('click', () => {
      if (!valid()) return;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Custom quote request — Travel to Chill')}&body=${encodeURIComponent(compose())}`;
    });
    refreshPass();
    go(0);
  }

  /* ---------- Footer ---------- */
  $('.js-year').textContent = new Date().getFullYear();
  $('.totop').addEventListener('click', () => scrollToTarget(0));
  if (animate) {
    G.from('.foot__word > *', { yPercent: 70, opacity: 0, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '.foot__word', start: 'top bottom', end: 'bottom 85%', scrub: true } });
    G.from('.foot__cta > *', { y: 50, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.foot__cta', start: 'top 80%' } });
  }

  /* ---------- Refresh after assets settle ---------- */
  if (animate) {
    addEventListener('load', () => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }
})();
