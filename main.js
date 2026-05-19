/* ESTATEZW — interactions */
(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const fmtUSD = n =>
    n >= 1e6 ? "$" + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + "M"
    : n >= 1e3 ? "$" + Math.round(n / 1e3) + "k"
    : "$" + n;

  /* Year */
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* Theme toggle */
  const themeBtn = $("#themeToggle");
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const applyTheme = t => {
    document.documentElement.setAttribute("data-theme", t);
    if (metaTheme) metaTheme.setAttribute("content", t === "dark" ? "#0e0f10" : "#f7f5f1");
  };
  themeBtn?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
  // sync meta on load
  applyTheme(document.documentElement.getAttribute("data-theme") || "light");

  /* Nav scroll + drawer */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  document.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  const burger = $("#burger"), drawer = $("#drawer");
  burger?.addEventListener("click", () => {
    const open = drawer.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    drawer.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("#drawer a").forEach(a => a.addEventListener("click", () => burger.click()));

  /* Reveal on scroll */
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el, i) => {
    if (i % 3 === 1) el.classList.add("delay-1");
    if (i % 3 === 2) el.classList.add("delay-2");
    ro.observe(el);
  });

  /* Hero count-up */
  const counters = $$(".num[data-count]");
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, dur = 1400, t0 = performance.now();
      const tick = t => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.floor(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
        else el.textContent = end;
      };
      requestAnimationFrame(tick); cObs.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => cObs.observe(c));

  /* Hero parallax */
  const para = $$("[data-parallax]");
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.addEventListener("scroll", () => {
      const y = window.scrollY;
      para.forEach(el => {
        const k = parseFloat(el.dataset.parallax) || 0.2;
        el.style.transform = `translate3d(0, ${y * k}px, 0)`;
      });
    }, { passive: true });
  }

  /* ===== Listings ===== */
  const E = window.ESTATE || { listings: [], gallery: [], cases: [], testimonials: [] };
  const cardHTML = l => `
    <article class="card reveal" data-id="${l.id}">
      <div class="img">
        <img src="${l.img}" alt="${l.name}" loading="lazy" decoding="async" />
        <div class="price-tag">${fmtUSD(l.price)}</div>
      </div>
      <div class="body">
        <div class="loc">${l.city} · ${l.type}</div>
        <h3>${l.name}</h3>
        <div class="meta">
          <span>${l.beds} bd</span><span>${l.baths} ba</span><span>${l.area}</span>
        </div>
      </div>
    </article>`;

  const featured = $("#featuredGrid");
  if (featured) {
    featured.innerHTML = E.listings.slice(0, 6).map(cardHTML).join("");
    $$(".reveal", featured).forEach((el, i) => {
      if (i % 3 === 1) el.classList.add("delay-1");
      if (i % 3 === 2) el.classList.add("delay-2");
      ro.observe(el);
    });
  }

  const dGrid = $("#discoverGrid");
  const empty = $("#emptyState");
  const fCity = $("#fCity"), fType = $("#fType"), fBeds = $("#fBeds"),
        fPrice = $("#fPrice"), fLabel = $("#fPriceLabel"), fReset = $("#fReset");

  function renderDiscover() {
    const c = fCity.value, t = fType.value, b = +fBeds.value, p = +fPrice.value;
    const out = E.listings.filter(l =>
      (!c || l.city === c) &&
      (!t || l.type === t) &&
      (!b || l.beds >= b) &&
      l.price <= p
    );
    fLabel.textContent = fmtUSD(p);
    if (!out.length) { dGrid.innerHTML = ""; empty.hidden = false; return; }
    empty.hidden = true;
    dGrid.innerHTML = out.map(cardHTML).join("");
    // re-trigger reveal
    $$(".card.reveal", dGrid).forEach(el => { el.classList.add("in"); });
  }
  [fCity, fType, fBeds, fPrice].forEach(el => el?.addEventListener("input", renderDiscover));
  fReset?.addEventListener("click", () => {
    fCity.value = ""; fType.value = ""; fBeds.value = "0"; fPrice.value = 5000000; renderDiscover();
  });
  renderDiscover();

  /* ===== Card 3D tilt (desktop only) ===== */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.addEventListener("mousemove", e => {
      const card = e.target.closest?.(".tilt-grid .card, .light-on-dark .card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
    });
    document.addEventListener("mouseout", e => {
      const card = e.target.closest?.(".card");
      if (card) card.style.transform = "";
    });
  }

  /* ===== Video play ===== */
  const vid = $("#heroVid"), playBtn = $("#playBtn");
  playBtn?.addEventListener("click", () => {
    vid.muted = false; vid.play();
    playBtn.classList.add("hidden");
  });
  vid?.addEventListener("click", () => {
    if (vid.paused) { vid.play(); playBtn.classList.add("hidden"); }
    else { vid.pause(); playBtn.classList.remove("hidden"); }
  });

  /* ===== Floor plan hotspots ===== */
  const hotInfo = $("#hotInfo");
  $$(".hot").forEach(h => {
    h.addEventListener("click", () => {
      $$(".hot").forEach(x => x.classList.remove("active"));
      h.classList.add("active");
      hotInfo.innerHTML = `<strong>${h.dataset.room}</strong><span>${h.dataset.info}</span>`;
    });
  });

  /* ===== Gallery ===== */
  const gg = $("#gallery-grid");
  if (gg) gg.innerHTML = E.gallery.map(g =>
    `<a href="${g.src}" class="${g.cls}"><img src="${g.src}" alt="" loading="lazy" decoding="async" /></a>`
  ).join("");

  const lb = $("#lightbox"), lbImg = lb?.querySelector("img"), lbClose = lb?.querySelector(".lb-close");
  gg?.addEventListener("click", e => {
    const a = e.target.closest("a"); if (!a) return;
    e.preventDefault();
    lbImg.src = a.href; lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
  });
  lbClose?.addEventListener("click", () => { lb.classList.remove("open"); lbImg.src = ""; });
  lb?.addEventListener("click", e => { if (e.target === lb) lbClose.click(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && lb?.classList.contains("open")) lbClose.click(); });

  /* ===== Cases ===== */
  const cg = $("#caseGrid");
  if (cg) cg.innerHTML = E.cases.map(c => `
    <article class="case">
      <div class="img"><img src="${c.img}" alt="${c.title}" loading="lazy" decoding="async" /></div>
      <div class="body">
        <div class="loc">${c.loc}</div>
        <h4>${c.title}</h4>
        <div class="stats">
          ${c.stats.map(s => `<div><small>${s.k}</small><b class="${s.up ? "up" : ""}">${s.v}</b></div>`).join("")}
        </div>
      </div>
    </article>`).join("");

  /* ===== ROI calculator ===== */
  const rPrice = $("#rPrice"), rYield = $("#rYield"), rApp = $("#rApp"), rYears = $("#rYears");
  const oVal = $("#oVal"), oRent = $("#oRent"), oTot = $("#oTot"), oRoi = $("#oRoi"), chart = $("#roiChart");

  function calcROI() {
    const p = +rPrice.value || 0, yld = (+rYield.value || 0) / 100,
          app = (+rApp.value || 0) / 100, yrs = Math.max(1, Math.min(30, +rYears.value || 1));
    const series = [];
    for (let i = 0; i <= yrs; i++) {
      const value = p * Math.pow(1 + app, i);
      const rent = i === 0 ? 0 : series[i - 1].rent + p * yld * Math.pow(1 + app, i - 1);
      series.push({ year: i, value, rent });
    }
    const last = series[series.length - 1];
    const total = last.value + last.rent;
    const roi = ((total - p) / p) * 100;
    oVal.textContent = "$" + Math.round(last.value).toLocaleString();
    oRent.textContent = "$" + Math.round(last.rent).toLocaleString();
    oTot.textContent = "$" + Math.round(total).toLocaleString();
    oRoi.textContent = roi.toFixed(0) + "%";

    // chart
    const W = 300, H = 90, pad = 4;
    const max = Math.max(...series.map(s => s.value + s.rent));
    const min = p;
    const sx = i => pad + (i / (series.length - 1)) * (W - pad * 2);
    const sy = v => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
    const linePts = series.map((s, i) => `${sx(i)},${sy(s.value + s.rent)}`).join(" ");
    const areaPts = `${sx(0)},${H} ${linePts} ${sx(series.length - 1)},${H}`;
    chart.innerHTML = `
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#9a6b3f" stop-opacity=".35"/>
          <stop offset="1" stop-color="#9a6b3f" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="${areaPts}" fill="url(#g)"/>
      <polyline points="${linePts}" fill="none" stroke="#9a6b3f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  [rPrice, rYield, rApp, rYears].forEach(el => el?.addEventListener("input", calcROI));
  calcROI();

  /* ===== Testimonials ===== */
  const track = $("#tTrack"), dots = $("#tDots");
  if (track) {
    track.innerHTML = E.testimonials.map(t => `
      <div class="t-card">
        <img src="${t.img}" alt="" loading="lazy" />
        <div><blockquote>"${t.quote}"</blockquote><cite>— ${t.who}</cite></div>
      </div>`).join("");
    dots.innerHTML = E.testimonials.map((_, i) => `<button data-i="${i}" class="${i === 0 ? "active" : ""}" aria-label="Slide ${i + 1}"></button>`).join("");

    let idx = 0;
    const go = i => {
      idx = (i + E.testimonials.length) % E.testimonials.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      $$("#tDots button").forEach((b, j) => b.classList.toggle("active", j === idx));
    };
    dots.addEventListener("click", e => {
      const b = e.target.closest("button"); if (b) go(+b.dataset.i);
    });
    let auto = setInterval(() => go(idx + 1), 6000);
    track.addEventListener("pointerenter", () => clearInterval(auto));
    track.addEventListener("pointerleave", () => auto = setInterval(() => go(idx + 1), 6000));

    // swipe
    let sx = 0, dx = 0;
    track.addEventListener("pointerdown", e => { sx = e.clientX; dx = 0; track.setPointerCapture(e.pointerId); });
    track.addEventListener("pointermove", e => { if (sx) dx = e.clientX - sx; });
    track.addEventListener("pointerup", () => {
      if (Math.abs(dx) > 60) go(idx + (dx < 0 ? 1 : -1));
      sx = 0; dx = 0;
    });
  }

  /* ===== Booking steps ===== */
  const form = $("#booking");
  if (form) {
    const panes = $$(".step-pane", form), tabs = $$(".step", form);
    let step = 1;
    const show = n => {
      step = n;
      panes.forEach(p => p.classList.toggle("active", +p.dataset.pane === n));
      tabs.forEach(t => t.classList.toggle("active", +t.dataset.step <= n));
    };
    form.addEventListener("click", e => {
      if (e.target.classList.contains("next")) {
        const cur = panes[step - 1];
        const valid = $$("input,select,textarea", cur).every(i => i.checkValidity());
        if (!valid) { cur.querySelector(":invalid")?.reportValidity(); return; }
        show(Math.min(3, step + 1));
      }
      if (e.target.classList.contains("prev")) show(Math.max(1, step - 1));
    });
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.querySelector(":invalid")?.reportValidity(); return; }
      const data = Object.fromEntries(new FormData(form).entries());
      console.log("[ESTATEZW booking]", data);
      $("#bookSuccess").hidden = false;
    });
  }

  /* ===== PWA ===== */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    const inIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
    if (!inIframe) navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
  let deferredPrompt;
  const banner = $("#pwaBanner"), btnInstall = $("#pwaInstall"), btnDismiss = $("#pwaDismiss");
  const standalone = matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  const inIframeForPwa = (() => { try { return window.self !== window.top; } catch { return true; } })();
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); deferredPrompt = e;
    if (!standalone && !inIframeForPwa && !localStorage.getItem("pwaDismissed") && banner) banner.hidden = false;
  });
  window.addEventListener("appinstalled", () => { if (banner) banner.hidden = true; deferredPrompt = null; });
  btnInstall?.addEventListener("click", async () => {
    if (!deferredPrompt) { banner.hidden = true; return; }
    deferredPrompt.prompt(); await deferredPrompt.userChoice;
    deferredPrompt = null; banner.hidden = true;
  });
  btnDismiss?.addEventListener("click", () => {
    banner.hidden = true; localStorage.setItem("pwaDismissed", "1");
  });
})();
