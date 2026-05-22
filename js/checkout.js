/* ============================================================
   STRAND — Checkout
   Renders summary, validates form, redirects to processor.
   ============================================================ */

(function () {
  'use strict';

  // -------- Order summary --------
  function renderSummary() {
    const wrap = document.querySelector('[data-checkout-items]');
    const subEl = document.querySelector('[data-subtotal]');
    const totalEl = document.querySelector('[data-total]');
    if (!wrap) return;

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('strand-cart') || '[]'); } catch (e) { cart = []; }

    if (cart.length === 0) {
      wrap.innerHTML = `<p class="muted" style="font-size: var(--t-sm);">Your bag is empty.</p>`;
      if (subEl) subEl.innerHTML = window.STRAND_formatPrice(0);
      if (totalEl) totalEl.innerHTML = window.STRAND_formatPrice(0);
      const payBtn = document.querySelector('[data-pay-btn]');
      if (payBtn) { payBtn.disabled = true; payBtn.textContent = 'Bag is empty'; }
      return;
    }

    wrap.innerHTML = cart.map(item => {
      const p = window.STRAND_findProduct(item.productId);
      if (!p) return '';
      const esc = window.STRAND_escape;
      return `
        <div style="display: flex; justify-content: space-between; gap: var(--s-3); padding-block: var(--s-3); border-bottom: 1px solid var(--line); font-size: var(--t-sm);">
          <div>
            <div style="font-family: var(--font-display); font-size: var(--t-md); margin-bottom: 2px;">${esc(p.name)}</div>
            <div class="muted" style="font-family: var(--font-mono); font-size: var(--t-xs); letter-spacing: 0.08em;">× ${item.quantity}</div>
          </div>
          <span class="price">${window.STRAND_formatPrice(p.price * item.quantity)}</span>
        </div>`;
    }).join('');

    const subtotal = window.STRAND_subtotal();
    if (subEl) subEl.innerHTML = window.STRAND_formatPrice(subtotal);
    if (totalEl) totalEl.innerHTML = window.STRAND_formatPrice(subtotal);
  }

  // -------- Form submission --------
  function handleSubmit(form, e) {
    e.preventDefault();

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('strand-cart') || '[]'); } catch (e) { cart = []; }
    if (!cart.length) {
      window.STRAND_toast && window.STRAND_toast('Your bag is empty');
      return;
    }

    // Gather all form fields
    const data = new FormData(form);
    const customer = {};
    for (const [k, v] of data.entries()) customer[k] = v;

    // Validate
    if (!form.querySelector('#confirm').checked) {
      window.STRAND_toast && window.STRAND_toast('Please confirm the research-use statement');
      return;
    }

    // Build the order package
    const order = {
      cart: cart.map(item => {
        const p = window.STRAND_findProduct(item.productId);
        return {
          productId: item.productId,
          name: p ? p.name : item.productId,
          price: p ? p.price : 0,
          quantity: item.quantity,
          lineTotal: p ? +(p.price * item.quantity).toFixed(2) : 0
        };
      }),
      subtotal: +window.STRAND_subtotal().toFixed(2),
      currency: 'USD',
      customer,
      timestamp: new Date().toISOString()
    };

    // Save to sessionStorage so success page can clear cart and processor can re-read
    try {
      sessionStorage.setItem('strand-pending-order', JSON.stringify(order));
    } catch (e) {}

    // ---- HANDOFF TO PAYMENT PROCESSOR ----
    // When your high-risk merchant account is approved, replace the demo block
    // below with a real POST to your processor's hosted-checkout endpoint.
    //
    // Example (Authorize.Net Accept Hosted, PaymentCloud, Easy Pay Direct, etc):
    //
    //   const f = document.createElement('form');
    //   f.method = 'POST';
    //   f.action = 'https://your-processor.com/hosted-checkout';
    //   const add = (name, value) => {
    //     const i = document.createElement('input');
    //     i.type = 'hidden'; i.name = name; i.value = value;
    //     f.appendChild(i);
    //   };
    //   add('amount', order.subtotal);
    //   add('currency', order.currency);
    //   add('order_ref', 'STRAND-' + Date.now());
    //   add('return_url', window.location.origin + '/success.html?order=' + ref);
    //   add('cancel_url', window.location.origin + '/cancel.html');
    //   add('customer_email', customer.email);
    //   // ... shipping fields as required by processor
    //   document.body.appendChild(f); f.submit();
    //
    // For now (demo mode), redirect straight to success.html with a fake ref:

    const demoRef = 'STRAND-' + Date.now().toString(36).toUpperCase();
    window.location.href = 'success.html?order=' + demoRef;
  }

  // -------- Init --------
  function init() {
    if (!window.STRAND_loadCatalog) { setTimeout(init, 50); return; }
    window.STRAND_loadCatalog().then(renderSummary);

    const form = document.querySelector('[data-checkout-form]');
    if (form) form.addEventListener('submit', (e) => handleSubmit(form, e));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
