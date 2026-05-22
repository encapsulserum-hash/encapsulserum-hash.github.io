/* ============================================================
   STRAND — Cart
   localStorage state + drawer UI + toast
   ============================================================ */

(function () {
  'use strict';

  const KEY = 'strand-cart';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }
  function write(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
    if (window.STRAND_updateCartCount) window.STRAND_updateCartCount();
    window.dispatchEvent(new CustomEvent('cart:change'));
  }
  function clear() { write([]); }

  function add(productId, quantity) {
    quantity = quantity || 1;
    const cart = read();
    const found = cart.find(i => i.productId === productId);
    if (found) found.quantity = Math.min(99, found.quantity + quantity);
    else cart.push({ productId, quantity });
    write(cart);
    toast('Added to bag');
  }
  function setQty(productId, qty) {
    const cart = read();
    const found = cart.find(i => i.productId === productId);
    if (!found) return;
    if (qty <= 0) {
      const idx = cart.indexOf(found);
      cart.splice(idx, 1);
    } else {
      found.quantity = Math.min(99, qty);
    }
    write(cart);
  }
  function remove(productId) { setQty(productId, 0); }

  window.STRAND_cart = { read, write, clear, add, setQty, remove };

  // ---------- Toast ----------
  let toastEl, toastTimer;
  function ensureToast() {
    if (toastEl) return toastEl;
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8.5l3 3 7-7"/></svg><span></span>';
    document.body.appendChild(toastEl);
    return toastEl;
  }
  function toast(message) {
    const el = ensureToast();
    el.querySelector('span').textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }
  window.STRAND_toast = toast;

  // ---------- Drawer ----------
  function renderLineItem(item, product) {
    if (!product) return '';
    const img = (product.images && product.images[0]) || '';
    return `
      <div class="line-item" data-line="${escapeAttr(item.productId)}">
        <div class="line-thumb"><img src="${img}" alt=""></div>
        <div class="line-info">
          <span class="line-cat">${escapeText(window.STRAND_categoryLabel(product.category))}</span>
          <span class="line-name">${escapeText(product.name)}</span>
          <div class="qty" style="margin-top: 6px;">
            <button data-dec="${escapeAttr(item.productId)}" aria-label="Decrease">−</button>
            <input type="text" inputmode="numeric" value="${item.quantity}" data-qty="${escapeAttr(item.productId)}" aria-label="Quantity">
            <button data-inc="${escapeAttr(item.productId)}" aria-label="Increase">+</button>
          </div>
        </div>
        <div class="line-end">
          <span class="price">${window.STRAND_formatPrice(product.price * item.quantity)}</span>
          <button class="line-remove" data-rm="${escapeAttr(item.productId)}">Remove</button>
        </div>
      </div>`;
  }
  function escapeAttr(s) { return String(s).replace(/"/g, '&quot;'); }
  function escapeText(s) { return window.STRAND_escape ? window.STRAND_escape(s) : String(s); }

  function calcSubtotal() {
    if (!window.STRAND_findProduct) return 0;
    return read().reduce((sum, item) => {
      const p = window.STRAND_findProduct(item.productId);
      return p ? sum + (p.price * item.quantity) : sum;
    }, 0);
  }
  window.STRAND_subtotal = calcSubtotal;

  function renderDrawerBody() {
    const cart = read();
    const body = document.querySelector('[data-drawer-body]');
    const foot = document.querySelector('[data-drawer-foot]');
    if (!body) return;

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="drawer-empty">
          <p class="eyebrow">— Empty —</p>
          <h4>Your bag is empty</h4>
          <a class="btn btn-ghost" href="index.html#shop">Browse research products</a>
        </div>`;
      if (foot) foot.style.display = 'none';
      return;
    }
    if (foot) foot.style.display = '';

    const items = cart.map(i => renderLineItem(i, window.STRAND_findProduct(i.productId))).join('');
    body.innerHTML = items;

    const subtotal = calcSubtotal();
    const subEl = document.querySelector('[data-subtotal]');
    if (subEl) subEl.innerHTML = window.STRAND_formatPrice(subtotal);

    // Wire item buttons
    body.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.inc; const item = read().find(i => i.productId === id);
      if (item) setQty(id, item.quantity + 1); renderDrawerBody();
    }));
    body.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.dec; const item = read().find(i => i.productId === id);
      if (item) setQty(id, item.quantity - 1); renderDrawerBody();
    }));
    body.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
      remove(b.dataset.rm); renderDrawerBody();
    }));
    body.querySelectorAll('[data-qty]').forEach(inp => inp.addEventListener('change', () => {
      const v = Math.max(0, Math.min(99, parseInt(inp.value, 10) || 0));
      setQty(inp.dataset.qty, v); renderDrawerBody();
    }));
  }
  window.STRAND_renderDrawerBody = renderDrawerBody;

  function openDrawer() {
    const drawer = document.querySelector('[data-drawer]');
    const back = document.querySelector('[data-drawer-backdrop]');
    if (!drawer) return;
    // Catalog must be loaded so we can render line items
    if (window.STRAND_loadCatalog) {
      window.STRAND_loadCatalog().then(() => renderDrawerBody());
    } else {
      renderDrawerBody();
    }
    drawer.classList.add('open');
    if (back) back.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    const drawer = document.querySelector('[data-drawer]');
    const back = document.querySelector('[data-drawer-backdrop]');
    if (drawer) drawer.classList.remove('open');
    if (back) back.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.STRAND_openDrawer = openDrawer;
  window.STRAND_closeDrawer = closeDrawer;

  function init() {
    // Open via cart icon in nav
    document.querySelectorAll('[data-cart-open]').forEach(b => b.addEventListener('click', (e) => {
      e.preventDefault(); openDrawer();
    }));
    // Close handlers
    document.querySelectorAll('[data-drawer-close]').forEach(b => b.addEventListener('click', closeDrawer));
    document.querySelectorAll('[data-drawer-backdrop]').forEach(b => b.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

    // Wire any "add to cart" buttons that declare a product
    document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.addToCart;
        const qtyInput = document.querySelector('[data-pdp-qty]');
        const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
        add(id, qty);
      });
    });

    // Re-render drawer when cart changes elsewhere
    window.addEventListener('cart:change', () => {
      const drawer = document.querySelector('[data-drawer]');
      if (drawer && drawer.classList.contains('open')) renderDrawerBody();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
