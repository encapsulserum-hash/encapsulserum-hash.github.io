/* ============================================================
   STRAND — Cart page
   Renders the full-page version of the bag.
   ============================================================ */

(function () {
  'use strict';

  function render() {
    const body = document.querySelector('[data-cart-page-body]');
    const checkoutBtn = document.querySelector('[data-checkout-btn]');
    if (!body) return;

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('strand-cart') || '[]'); } catch (e) { cart = []; }

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="empty-state" style="padding-block: var(--s-8);">
          <p class="eyebrow">— Empty —</p>
          <h2 style="font-family: var(--font-display); font-size: var(--t-3xl); margin-bottom: var(--s-4);">Your bag is empty</h2>
          <p>Browse our research products and add something to get started.</p>
          <a class="btn btn-primary" href="index.html#shop">Browse the shop</a>
        </div>`;
      if (checkoutBtn) checkoutBtn.style.opacity = '0.4';
      if (checkoutBtn) checkoutBtn.style.pointerEvents = 'none';
      const sub = document.querySelector('[data-subtotal]');
      if (sub) sub.innerHTML = window.STRAND_formatPrice(0);
      return;
    }

    // Render line items
    body.innerHTML = cart.map(item => {
      const p = window.STRAND_findProduct(item.productId);
      if (!p) return '';
      const img = (p.images && p.images[0]) || '';
      const esc = window.STRAND_escape;
      return `
        <div class="line-item" style="grid-template-columns: 100px 1fr auto;" data-line="${esc(item.productId)}">
          <div class="line-thumb"><img src="${img}" alt=""></div>
          <div class="line-info">
            <span class="line-cat">${esc(window.STRAND_categoryLabel(p.category))}</span>
            <a href="product.html?id=${encodeURIComponent(p.id)}" class="line-name" style="text-decoration: none;">${esc(p.name)}</a>
            <p class="muted" style="font-size: var(--t-sm); margin-top: 4px;">${esc(p.shortDescription || '')}</p>
            <div class="qty" style="margin-top: var(--s-3);">
              <button data-dec="${esc(item.productId)}">−</button>
              <input type="text" inputmode="numeric" value="${item.quantity}" data-qty="${esc(item.productId)}">
              <button data-inc="${esc(item.productId)}">+</button>
            </div>
          </div>
          <div class="line-end">
            <span class="price">${window.STRAND_formatPrice(p.price * item.quantity)}</span>
            <button class="line-remove" data-rm="${esc(item.productId)}">Remove</button>
          </div>
        </div>`;
    }).join('');

    // Subtotal
    const subtotal = window.STRAND_subtotal();
    const sub = document.querySelector('[data-subtotal]');
    if (sub) sub.innerHTML = window.STRAND_formatPrice(subtotal);

    // Wire buttons
    body.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.inc;
      const cur = window.STRAND_cart.read().find(i => i.productId === id);
      if (cur) window.STRAND_cart.setQty(id, cur.quantity + 1);
      render();
    }));
    body.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.dec;
      const cur = window.STRAND_cart.read().find(i => i.productId === id);
      if (cur) window.STRAND_cart.setQty(id, cur.quantity - 1);
      render();
    }));
    body.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
      window.STRAND_cart.remove(b.dataset.rm);
      render();
    }));
    body.querySelectorAll('[data-qty]').forEach(inp => inp.addEventListener('change', () => {
      const v = Math.max(0, Math.min(99, parseInt(inp.value, 10) || 0));
      window.STRAND_cart.setQty(inp.dataset.qty, v);
      render();
    }));
  }

  function init() {
    if (!window.STRAND_loadCatalog) { setTimeout(init, 50); return; }
    window.STRAND_loadCatalog().then(render);
    window.addEventListener('cart:change', render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
