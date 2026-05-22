/* ============================================================
   STRAND — Animations
   Scroll reveal + subtle parallax
   ============================================================ */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Reveal on scroll ----------
  let observer = null;
  function armReveal() {
    if (reduced) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    }
    document.querySelectorAll('.reveal:not(.in)').forEach(el => observer.observe(el));
  }
  window.STRAND_armReveal = armReveal;

  // ---------- Parallax ----------
  function setupParallax() {
    if (reduced) return;
    const els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    let raf = null;
    function update() {
      const y = window.scrollY;
      els.forEach(el => {
        const rate = parseFloat(el.dataset.parallax) || 0.2;
        el.style.transform = `translate3d(0, ${y * rate}px, 0)`;
      });
      raf = null;
    }
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  // ---------- Init ----------
  function init() {
    armReveal();
    setupParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
