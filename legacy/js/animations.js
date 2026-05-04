// PoultrySmart — Animations & Motion Library

(function() {
  'use strict';

  // ── INTERSECTION OBSERVER — SCROLL REVEALS ────────────────────────────────

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || (i * 60);
        setTimeout(() => {
          el.classList.add('is-visible');
        }, parseInt(delay));
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
  });

  // ── ODOMETER COUNTERS ─────────────────────────────────────────────────────

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = prefix + (decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString('en-IN')) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

  // ── PARALLAX HERO ──────────────────────────────────────────────────────────

  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.35}px)`;
    }, { passive: true });
  }

  // ── 3D TILT ON FLOATING CARD ───────────────────────────────────────────────

  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotY = ((x - cx) / cx) * 12;
      const rotX = -((y - cy) / cy) * 12;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  // ── STICKY NAVBAR ─────────────────────────────────────────────────────────

  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ── MOBILE HAMBURGER ──────────────────────────────────────────────────────

  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileClose = document.getElementById('mobile-close');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  if (mobileClose && mobileNav) {
    mobileClose.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // ── DARK MODE ─────────────────────────────────────────────────────────────

  const darkToggle = document.getElementById('dark-toggle');
  const savedTheme = localStorage.getItem('ps_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateDarkIcon(savedTheme);

  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('ps_theme', next);
      updateDarkIcon(next);
    });
  }

  function updateDarkIcon(theme) {
    if (!darkToggle) return;
    darkToggle.innerHTML = theme === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  // ── LANGUAGE SWITCHER ─────────────────────────────────────────────────────

  const langBtns = document.querySelectorAll('[data-lang]');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.PS) PS.i18n.set(btn.dataset.lang);
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ── RIPPLE EFFECT ─────────────────────────────────────────────────────────

  document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `left:${x}px;top:${y}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ── PRICING TOGGLE ────────────────────────────────────────────────────────

  const pricingToggle = document.getElementById('pricing-toggle');
  if (pricingToggle) {
    pricingToggle.addEventListener('change', function() {
      const prices = document.querySelectorAll('[data-monthly][data-annual]');
      prices.forEach(el => {
        el.textContent = this.checked ? el.dataset.annual : el.dataset.monthly;
      });
      const badge = document.getElementById('pricing-badge');
      if (badge) badge.style.opacity = this.checked ? '1' : '0';
    });
  }

  // ── TESTIMONIAL CAROUSEL ──────────────────────────────────────────────────

  const carousel = document.querySelector('.testimonial-carousel');
  const carouselTrack = document.querySelector('.carousel-track');
  let carouselIdx = 0;

  if (carouselTrack) {
    const slides = carouselTrack.querySelectorAll('.testimonial-slide');
    const totalSlides = slides.length;

    function goTo(idx) {
      carouselIdx = (idx + totalSlides) % totalSlides;
      carouselTrack.style.transform = `translateX(-${carouselIdx * 100}%)`;
      document.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === carouselIdx);
      });
    }

    document.getElementById('carousel-prev')?.addEventListener('click', () => goTo(carouselIdx - 1));
    document.getElementById('carousel-next')?.addEventListener('click', () => goTo(carouselIdx + 1));
    setInterval(() => goTo(carouselIdx + 1), 5000);
  }

  // ── SMOOTH SCROLL ─────────────────────────────────────────────────────────

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (mobileNav) {
          mobileNav.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    });
  });

  // ── SKELETON LOADER ───────────────────────────────────────────────────────

  window.PS_showSkeleton = function(container, count = 3) {
    container.innerHTML = Array(count).fill(`
      <div class="skeleton-card">
        <div class="skeleton-line" style="width:60%;height:20px;"></div>
        <div class="skeleton-line" style="width:100%;height:12px;margin-top:8px;"></div>
        <div class="skeleton-line" style="width:80%;height:12px;margin-top:6px;"></div>
      </div>
    `).join('');
  };

  console.log('✅ PoultrySmart animations loaded');
})();
