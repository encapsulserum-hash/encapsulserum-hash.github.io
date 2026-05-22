/* ============================================================
   STRAND — Main
   Navigation, theme toggle, cart count badge
   ============================================================ */

(function () {
  'use strict';

  // ---------- Theme ----------
  const THEME_KEY = 'strand-theme';
  const root = document.documentElement;
  const saved = localStorage.getItem(THEME_KEY);
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (sysDark ? 'dark' : 'light'));

  function setupThemeToggle() {
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  // ---------- Mobile menu ----------
  function setupMobileMenu() {
    const burger = document.querySelector('[data-menu-open]');
    const closer = document.querySelector('[data-menu-close]');
    const overlay = document.querySelector('[data-menu-overlay]');
    if (!burger || !overlay) return;
    function open() { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close() { overlay.classList.remove('open'); document.body.style.overflow = ''; }
    burger.addEventListener('click', open);
    if (closer) closer.addEventListener('click', close);
    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  // ---------- Cart count badge ----------
  function updateCartCount() {
    const badge = document.querySelector('[data-cart-count]');
    if (!badge) return;
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('strand-cart') || '[]'); } catch (e) { cart = []; }
    const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
  }
  window.STRAND_updateCartCount = updateCartCount;

  // ---------- Active nav link ----------
  function setActiveNavLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav-link]').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path) link.classList.add('active');
      // Mark category pages as active when on product detail
      if (path === 'product.html') {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('cat');
        if (cat && href && href.includes(cat)) link.classList.add('active');
      }
    });
  }

  // ---------- Year in footer ----------
  function fillYear() {
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  // ---------- Newsletter (UI only for now) ----------
  function setupNewsletter() {
    document.querySelectorAll('[data-newsletter]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (!input || !input.value) return;
        window.STRAND_toast && window.STRAND_toast('Subscribed. Welcome to the lab.');
        input.value = '';
      });
    });
  }

  // ---------- Init ----------
  function init() {
    setupThemeToggle();
    setupMobileMenu();
    setActiveNavLink();
    fillYear();
    setupNewsletter();
    updateCartCount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
