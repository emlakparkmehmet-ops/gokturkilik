/**
 * GÖKTÜRK İLİK SİGORTA — Interactive Engine & WhatsApp Redirector
 */
(() => {
  'use strict';

  const CONFIG = {
    whatsappPhone: '905075950731',
    agencyName: 'Göktürk İlik Sigorta',
    // toUpperCase() Türkçe'de "İlik" -> "ILIK" yapıyor; başlık sabit tutuluyor.
    agencyNameUpper: 'GÖKTÜRK İLİK SİGORTA'
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Elemanlar görünür alana girdiğinde `run` çağırır.
   * IntersectionObserver'ın hiç tetiklenmediği durumlar (arka planda açılan
   * sekme, eski WebView, render edilmeyen görünüm) için iki katmanlı yedek
   * vardır: önce konum tabanlı kontrol, sonra hiçbiri çalışmadıysa hepsini aç.
   */
  function whenVisible(items, run, options = {}) {
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(run);
      return;
    }

    const pending = new Set(items);
    const fire = (el) => {
      if (!pending.has(el)) return;
      pending.delete(el);
      run(el);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fire(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    items.forEach((el) => observer.observe(el));

    // 1. yedek: konuma göre görünür olanları aç.
    const sweep = () => {
      pending.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) fire(el);
      });
    };

    setTimeout(() => {
      const before = pending.size;
      sweep();
      // 2. yedek: gözlemci hiç çalışmamışsa kaydırmaya güvenmeden hepsini aç.
      if (pending.size === before && before === items.length) {
        window.addEventListener('scroll', sweep, { passive: true });
        setTimeout(() => { pending.forEach(fire); }, 3000);
      }
    }, 2000);
  }

  /* ==========================================================================
     1) Splash — CSS kendi kendine kapatıyor, JS yalnızca iyileştiriyor:
        oturum içinde ikinci kez gösterme + bittiğinde DOM'dan çıkar.
     ========================================================================== */
  (function splash() {
    const el = $('#introSplash');
    if (!el) return;

    let seen = false;
    try { seen = sessionStorage.getItem('gis_splash_seen') === '1'; } catch (_) { /* private mode */ }

    if (seen || reducedMotion) {
      el.classList.add('skip');
      el.remove();
      return;
    }

    try { sessionStorage.setItem('gis_splash_seen', '1'); } catch (_) { /* yoksay */ }

    el.addEventListener('animationend', (e) => {
      if (e.animationName === 'splashOut') el.remove();
    });

    // Güvenlik ağı: animasyon bir sebeple tetiklenmezse yine de kaldır.
    setTimeout(() => el.remove(), 4000);
  })();

  /* ==========================================================================
     2) Header: scroll durumu + okuma ilerlemesi (rAF ile kısıtlanmış)
     ========================================================================== */
  (function headerScroll() {
    const header = $('.header');
    const backToTop = $('.back-to-top');
    if (!header) return;

    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      header.classList.toggle('scrolled', y > 40);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      header.style.setProperty('--scroll', max > 0 ? (y / max).toFixed(4) : '0');

      if (backToTop) backToTop.classList.toggle('show', y > 700);
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    update();

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ==========================================================================
     3) Mobil menü
     ========================================================================== */
  const mobileMenu = (function () {
    const toggler = $('.mobile-toggler');
    const navLinks = $('.nav-links');
    const overlay = $('.nav-overlay');

    const setState = (open) => {
      if (!navLinks) return;
      navLinks.classList.toggle('active', open);
      if (overlay) overlay.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (toggler) {
        toggler.setAttribute('aria-expanded', String(open));
        toggler.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
        const icon = toggler.querySelector('i');
        if (icon) icon.className = open ? 'fas fa-times' : 'fas fa-bars';
      }
    };

    const isOpen = () => !!navLinks && navLinks.classList.contains('active');

    if (toggler) toggler.addEventListener('click', () => setState(!isOpen()));
    if (overlay) overlay.addEventListener('click', () => setState(false));

    // Menüdeki bir bağlantıya tıklanınca kapat. Kaydırma offset'ini
    // CSS `scroll-padding-top` hallettiği için preventDefault yok.
    $$('.nav-links a').forEach((a) => a.addEventListener('click', () => setState(false)));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setState(false);
        if (toggler) toggler.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && isOpen()) setState(false);
    });

    return { close: () => setState(false) };
  })();

  /* ==========================================================================
     4) Scrollspy — menüde aktif bölümü işaretle
     ========================================================================== */
  (function scrollSpy() {
    const links = $$('.nav-link');
    if (!links.length || !('IntersectionObserver' in window)) return;

    const map = new Map();
    links.forEach((link) => {
      const id = link.getAttribute('href');
      if (id && id.startsWith('#') && id.length > 1) {
        const section = document.querySelector(id);
        if (section) map.set(section, link);
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove('active'));
        const link = map.get(entry.target);
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    map.forEach((_, section) => observer.observe(section));
  })();

  /* ==========================================================================
     5) Scroll reveal
     ========================================================================== */
  (function reveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    if (reducedMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    whenVisible(items, (el) => el.classList.add('is-visible'),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  })();

  /* ==========================================================================
     5b) Gerçek header yüksekliğini CSS'e yaz — mobil çekmecenin üst
         konumu ve çapa kaydırma boşluğu bununla hizalanır.
     ========================================================================== */
  (function headerHeight() {
    const header = $('.header');
    if (!header) return;

    const apply = () => {
      document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
    };

    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', () => setTimeout(apply, 250));

    if ('ResizeObserver' in window) new ResizeObserver(apply).observe(header);
  })();

  /* ==========================================================================
     6) Sayaçlar
     ========================================================================== */
  (function counters() {
    const nodes = $$('[data-count]');
    if (!nodes.length) return;

    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      if (Number.isNaN(target)) return;

      if (reducedMotion) {
        el.textContent = target.toFixed(decimals);
        return;
      }

      const duration = 1400;
      const start = performance.now();
      let done = false;

      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          done = true;
        }
      };

      requestAnimationFrame(step);

      // requestAnimationFrame arka plandaki sekmelerde duraklatılır; sayı
      // "0" olarak takılı kalmasın diye son değeri garantiye al.
      setTimeout(() => {
        if (!done) el.textContent = target.toFixed(decimals);
      }, duration + 800);
    };

    whenVisible(nodes, run, { threshold: 0.4 });
  })();

  /* ==========================================================================
     7) Hero branş döngüsü
     ========================================================================== */
  (function rotator() {
    const track = $('#heroRotator');
    if (!track || reducedMotion) return;

    const items = track.children.length;
    if (items < 2) return;

    let index = 0;

    setInterval(() => {
      index += 1;
      track.style.transition = 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)';
      track.style.transform = `translateY(-${index * (100 / items)}%)`;

      // Son eleman ilkiyle aynı; oraya varınca animasyonsuz başa sar.
      if (index === items - 1) {
        setTimeout(() => {
          track.style.transition = 'none';
          track.style.transform = 'translateY(0)';
          index = 0;
        }, 780);
      }
    }, 2600);
  })();

  /* ==========================================================================
     8) Marquee — kusursuz döngü için içeriği ikiye katla
     ========================================================================== */
  (function marquee() {
    $$('[data-marquee]').forEach((wrap) => {
      const track = $('.marquee-track', wrap);
      if (!track) return;
      track.innerHTML += track.innerHTML;
      wrap.classList.add('ready');
    });
  })();

  /* ==========================================================================
     9) 3B eğim + imleç spot ışığı (yalnızca fare olan cihazlarda)
     ========================================================================== */
  (function pointerFx() {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || reducedMotion) return;

    // Spot ışığı
    $$('[data-spotlight], .quote-card').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    });

    // 3B eğim
    const MAX = 6;
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', `${(px * MAX).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-py * MAX).toFixed(2)}deg`);
      });

      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      });
    });

    // İmleci takip eden ışık
    const glow = $('.cursor-glow');
    if (glow) {
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      let cx = x;
      let cy = y;

      window.addEventListener('pointermove', (e) => {
        x = e.clientX;
        y = e.clientY;
        document.body.classList.add('cursor-active');
      }, { passive: true });

      document.addEventListener('pointerleave', () => document.body.classList.remove('cursor-active'));

      const loop = () => {
        cx += (x - cx) * 0.09;
        cy += (y - cy) * 0.09;
        glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        requestAnimationFrame(loop);
      };
      loop();
    }
  })();

  /* ==========================================================================
     10) Sigorta türü seçimi
     ========================================================================== */
  let selectedInsuranceType = 'Trafik Sigortası';

  const typePills = $$('.type-pill');
  const plakaGroup = $('#plakaGroup');
  const formTitle = $('#selectedFormTitle');
  const VEHICLE_TYPES = ['Trafik Sigortası', 'Kasko Sigortası'];

  function selectType(type) {
    const pill = typePills.find((p) => p.dataset.type === type);
    selectedInsuranceType = type;

    typePills.forEach((p) => {
      const on = p === pill;
      p.classList.toggle('active', on);
      p.setAttribute('aria-pressed', String(on));
    });

    if (formTitle) formTitle.textContent = `${type} Hızlı Teklif Al`;
    if (plakaGroup) plakaGroup.style.display = VEHICLE_TYPES.includes(type) ? 'block' : 'none';
  }

  typePills.forEach((pill) => {
    pill.addEventListener('click', () => selectType(pill.dataset.type));
  });

  // Hizmet kartlarındaki "Teklif Al" butonları formu hazırlar
  $$('[data-quote-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.quoteType;
      // Seyahat Sağlık için ayrı bir pill yok; en yakın seçimi koru.
      if (typePills.some((p) => p.dataset.type === type)) selectType(type);

      mobileMenu.close();
      const quote = $('#quote');
      if (quote) quote.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => { const n = $('#nameInput'); if (n) n.focus({ preventScroll: true }); }, 600);
    });
  });

  /* ==========================================================================
     11) Alan biçimlendirme
     ========================================================================== */
  const plakaInput = $('#plakaInput');
  const phoneInput = $('#phoneInput');
  const tcInput = $('#tcInput');
  const nameInput = $('#nameInput');
  const kvkkConsent = $('#kvkkConsent');

  if (plakaInput) {
    plakaInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    });
  }

  const digits = (v) => v.replace(/\D/g, '');

  function formatPhone(raw) {
    let d = digits(raw).slice(0, 11);
    // 5xx... girilirse başına 0 ekle
    if (d.length && d[0] !== '0') d = `0${d}`.slice(0, 11);
    const parts = [d.slice(0, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    return parts.filter(Boolean).join(' ');
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = formatPhone(e.target.value);
    });
  }

  if (tcInput) {
    tcInput.addEventListener('input', (e) => {
      e.target.value = digits(e.target.value).slice(0, 11);
    });
  }

  /* ==========================================================================
     12) Doğrulama
     ========================================================================== */
  function setError(input, errorId, message) {
    const box = document.getElementById(errorId);
    if (box) {
      box.textContent = message || '';
      box.classList.toggle('show', !!message);
    }
    if (input) {
      input.classList.toggle('is-invalid', !!message);
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    return !message;
  }

  /** TC Kimlik No algoritmik doğrulaması (11 hane). */
  function isValidTC(v) {
    if (!/^[1-9][0-9]{10}$/.test(v)) return false;
    const n = v.split('').map(Number);
    const odd = n[0] + n[2] + n[4] + n[6] + n[8];
    const even = n[1] + n[3] + n[5] + n[7];
    if ((odd * 7 - even) % 10 !== n[9]) return false;
    return n.slice(0, 10).reduce((a, b) => a + b, 0) % 10 === n[10];
  }

  function validate() {
    let firstInvalid = null;
    const fail = (el) => { if (!firstInvalid) firstInvalid = el; };

    const name = (nameInput?.value || '').trim();
    if (name.length < 2) {
      setError(nameInput, 'nameError', 'Lütfen adınızı ve soyadınızı yazın.');
      fail(nameInput);
    } else {
      setError(nameInput, 'nameError', '');
    }

    const phone = digits(phoneInput?.value || '');
    if (!/^0(5\d{9}|[2-4]\d{9})$/.test(phone)) {
      setError(phoneInput, 'phoneError', 'Geçerli bir telefon numarası girin. Örn: 0507 595 07 31');
      fail(phoneInput);
    } else {
      setError(phoneInput, 'phoneError', '');
    }

    const plakaVisible = plakaGroup && plakaGroup.style.display !== 'none';
    const plaka = (plakaInput?.value || '').trim();
    if (plakaVisible && plaka && !/^[0-8][0-9][A-Z]{1,3}[0-9]{2,5}$/.test(plaka)) {
      setError(plakaInput, 'plakaError', 'Plakayı boşluksuz yazın. Örn: 27ABC123');
      fail(plakaInput);
    } else {
      setError(plakaInput, 'plakaError', '');
    }

    const tc = (tcInput?.value || '').trim();
    if (tc && !(tc.length === 10 || isValidTC(tc))) {
      setError(tcInput, 'tcError', 'TC Kimlik No 11 haneli ve geçerli olmalı (VKN için 10 hane).');
      fail(tcInput);
    } else {
      setError(tcInput, 'tcError', '');
    }

    if (kvkkConsent && !kvkkConsent.checked) {
      setError(null, 'kvkkError', 'Devam edebilmek için aydınlatma metnini onaylamanız gerekiyor.');
      fail(kvkkConsent);
    } else {
      setError(null, 'kvkkError', '');
    }

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: false });
      return false;
    }
    return true;
  }

  // Kullanıcı düzeltince hatayı anında temizle
  [[nameInput, 'nameError'], [phoneInput, 'phoneError'],
   [plakaInput, 'plakaError'], [tcInput, 'tcError']].forEach(([input, id]) => {
    if (input) input.addEventListener('input', () => setError(input, id, ''));
  });
  if (kvkkConsent) kvkkConsent.addEventListener('change', () => setError(null, 'kvkkError', ''));

  /* ==========================================================================
     13) Form gönderimi -> WhatsApp
     ========================================================================== */
  const quoteForm = $('#quickQuoteForm');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;

      const nameVal = nameInput.value.trim();
      const phoneVal = phoneInput.value.trim();
      const plakaVal = (plakaInput?.value || '').trim();
      const tcVal = (tcInput?.value || '').trim();

      let text = `*${CONFIG.agencyNameUpper} TEKLİF TALEBİ*\n\n`;
      text += `📌 *Sigorta Türü:* ${selectedInsuranceType}\n`;
      text += `👤 *Ad Soyad / Unvan:* ${nameVal}\n`;
      text += `📞 *Telefon:* ${phoneVal}\n`;

      if (plakaVal && VEHICLE_TYPES.includes(selectedInsuranceType)) {
        text += `🚗 *Araç Plakası:* ${plakaVal}\n`;
      }
      if (tcVal) {
        text += `🆔 *TC / VKN No:* ${tcVal}\n`;
      }

      text += '\nİyi çalışmalar, sigorta poliçesi ve prim teklifini rica ediyorum.';

      const url = `https://wa.me/${CONFIG.whatsappPhone}?text=${encodeURIComponent(text)}`;

      // ÖNEMLİ: window.open doğrudan submit olayının içinde çağrılıyor.
      // setTimeout içine alınırsa kullanıcı hareketi izni düşer ve
      // tarayıcı pencereyi engeller.
      const win = window.open(url, '_blank', 'noopener');
      openSuccessModal(selectedInsuranceType, url, !win);
    });
  }

  /* ==========================================================================
     14) Başarı modalı (odak tuzağı + Esc + geri dönüş odağı)
     ========================================================================== */
  const modal = $('#successModal');
  const modalTypeEl = $('#modalType');
  const modalHintEl = $('#modalHint');
  const modalRedirect = $('#modalRedirectBtn');
  let lastFocused = null;

  const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

  function openSuccessModal(type, url, wasBlocked) {
    if (!modal) { window.location.href = url; return; }

    // textContent kullanılıyor: her açılışta güncellenir ve HTML enjeksiyonu olmaz.
    if (modalTypeEl) modalTypeEl.textContent = type;
    if (modalHintEl) {
      modalHintEl.textContent = wasBlocked
        ? 'talebiniz hazır. Tarayıcınız yeni sekmenin açılmasını engelledi — aşağıdaki butona dokunarak WhatsApp\'ta açabilirsiniz.'
        : 'için hazırlanan talebiniz WhatsApp\'ta açıldı. Açılmadıysa aşağıdaki butonu kullanın.';
    }
    if (modalRedirect) modalRedirect.href = url;

    lastFocused = document.activeElement;
    modal.hidden = false;
    // reflow: hidden kaldırıldıktan sonra geçişin çalışması için
    void modal.offsetWidth;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const target = modalRedirect || modal.querySelector(FOCUSABLE);
    if (target) target.focus();
  }

  function closeSuccessModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';

    const done = () => { modal.hidden = true; };
    setTimeout(done, 360);

    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (modal) {
    $('#closeModalBtn')?.addEventListener('click', closeSuccessModal);
    $('#modalCloseX')?.addEventListener('click', closeSuccessModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSuccessModal();
    });

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeSuccessModal(); return; }
      if (e.key !== 'Tab') return;

      const items = $$(FOCUSABLE, modal).filter((el) => el.offsetParent !== null);
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    if (modalRedirect) {
      modalRedirect.addEventListener('click', () => setTimeout(closeSuccessModal, 300));
    }
  }

  /* ==========================================================================
     15) SSS akordeonu — <button> tabanlı, klavye ile erişilebilir
     ========================================================================== */
  (function faq() {
    const items = $$('.faq-item');

    const close = (item) => {
      item.classList.remove('active');
      const btn = $('.faq-header', item);
      const body = $('.faq-body', item);
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (body) body.style.maxHeight = '';
    };

    const open = (item) => {
      item.classList.add('active');
      const btn = $('.faq-header', item);
      const body = $('.faq-body', item);
      if (btn) btn.setAttribute('aria-expanded', 'true');
      if (body) body.style.maxHeight = `${body.scrollHeight}px`;
    };

    items.forEach((item) => {
      const btn = $('.faq-header', item);
      if (!btn) return;

      btn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('active');
        items.forEach(close);
        if (!wasOpen) open(item);
      });
    });

    // İlk soru varsayılan olarak açık
    if (items[0]) open(items[0]);

    // Pencere genişliği değişince açık gövdenin yüksekliğini tazele
    window.addEventListener('resize', () => {
      const active = $('.faq-item.active');
      if (!active) return;
      const body = $('.faq-body', active);
      if (body) body.style.maxHeight = `${body.scrollHeight}px`;
    });
  })();

  /* ==========================================================================
     16) Küçük dokunuşlar
     ========================================================================== */
  const yearEl = $('#currentYear');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
