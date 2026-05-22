/* ============================================================
   STRAND — Product detail
   Reads ?id= from URL, renders product into [data-pdp]
   ============================================================ */

(function () {
  'use strict';

  function getProductId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function escape(s) {
    return window.STRAND_escape ? window.STRAND_escape(s) : String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
  }

  function renderNotFound(pdp) {
    pdp.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <p class="eyebrow">404</p>
        <h2>Product not found</h2>
        <p>The product you're looking for isn't in our catalog. It may have been discontinued or the link may be incorrect.</p>
        <div style="display: flex; gap: var(--s-3); justify-content: center; flex-wrap: wrap;">
          <a href="index.html" class="btn btn-primary">Back to shop</a>
          <a href="contact.html" class="btn btn-ghost">Contact support</a>
        </div>
      </div>`;
  }

  function renderProduct(pdp, p) {
    const images = (p.images && p.images.length) ? p.images : ['https://picsum.photos/seed/placeholder/800/1000'];
    const stockLabel = p.stockStatus === 'out' ? 'Out of stock' : (p.stockStatus === 'low' ? 'Low stock' : 'In stock');
    const stockClass = p.stockStatus === 'out' ? 'out' : (p.stockStatus === 'low' ? 'low' : '');
    const disabled = p.stockStatus === 'out' ? 'disabled' : '';

    pdp.innerHTML = `
      <div class="pdp-gallery">
        <div class="pdp-main-image">
          <img id="pdp-main-img" src="${images[0]}" alt="${escape(p.name)}">
        </div>
        <div class="pdp-thumbs">
          ${images.map((src, i) => `
            <button class="pdp-thumb ${i === 0 ? 'active' : ''}" data-thumb="${i}" aria-label="View image ${i+1}">
              <img src="${src}" alt="">
            </button>
          `).join('')}
        </div>
      </div>

      <div class="pdp-info">
        <p class="pdp-cat">${escape(window.STRAND_categoryLabel(p.category))}</p>
        <h1>${escape(p.name)}</h1>
        <p class="pdp-price">${window.STRAND_formatPrice(p.price)}</p>
        <p class="pdp-short">${escape(p.shortDescription || '')}</p>

        <div class="pdp-badge">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11v.01"/>
          </svg>
          Research use only
        </div>

        <div class="pdp-actions">
          <div class="pdp-qty">
            <button data-qty-dec aria-label="Decrease quantity">−</button>
            <input type="text" inputmode="numeric" value="1" data-pdp-qty aria-label="Quantity">
            <button data-qty-inc aria-label="Increase quantity">+</button>
          </div>
          <button class="btn btn-primary btn-lg" data-add-to-cart="${escape(p.id)}" ${disabled}>
            ${p.stockStatus === 'out' ? 'Out of stock' : 'Add to bag'}
            ${p.stockStatus === 'out' ? '' : '<svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 5l7 7-7 7"/></svg>'}
          </button>
        </div>

        <p style="font-family: var(--font-mono); font-size: var(--t-xs); color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: var(--s-5);">
          <span class="stock-pill ${stockClass}">${stockLabel}</span>
          &middot; Ships within 1 business day
        </p>

        <div class="tabs">
          <div class="tab-list" role="tablist">
            <button class="tab-btn active" data-tab="desc">Description</button>
            <button class="tab-btn" data-tab="specs">Specifications</button>
            <button class="tab-btn" data-tab="notes">Research Notes</button>
            <button class="tab-btn" data-tab="ship">Shipping</button>
          </div>

          <div class="tab-panel active" data-panel="desc">
            <p>${escape(p.longDescription || p.shortDescription || '')}</p>
          </div>

          <div class="tab-panel" data-panel="specs">
            <table class="spec-table">
              <tbody>
                ${Object.entries(p.specs || {}).map(([k, v]) => `
                  <tr><td>${escape(formatSpecKey(k))}</td><td class="mono">${escape(v)}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="tab-panel" data-panel="notes">
            <p>All STRAND products are independently tested for purity by HPLC and for sequence integrity by mass spectrometry. The certificate of analysis (COA) for the lot in your shipment is available on request &mdash; email <a href="mailto:support@strand.lab" class="link">support@strand.lab</a> with the lot number printed on your bottle.</p>
            <p>This product is supplied solely as a laboratory reference material. It has not been evaluated by any regulatory authority for therapeutic use. See our <a href="disclaimer.html" class="link">Research Use Disclaimer</a> for full terms.</p>
          </div>

          <div class="tab-panel" data-panel="ship">
            <p>Refrigerated items ship overnight with phase-change cooling material and a passive temperature data logger. Lyophilized items ship via expedited ground or expedited international.</p>
            <p>International orders may take 4&ndash;10 business days depending on customs clearance. Buyer is responsible for any import duties, taxes, or customs fees levied by the destination country. See our <a href="shipping.html" class="link">Shipping Policy</a> for the full restricted-country list and replacement terms.</p>
          </div>
        </div>
      </div>
    `;

    // Wire gallery thumbs
    const mainImg = document.getElementById('pdp-main-img');
    pdp.querySelectorAll('[data-thumb]').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.dataset.thumb, 10);
        mainImg.src = images[idx];
        pdp.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    // Wire tabs
    pdp.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.tab;
        pdp.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        pdp.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        pdp.querySelector(`[data-panel="${key}"]`).classList.add('active');
      });
    });

    // Wire quantity selector
    const qtyInput = pdp.querySelector('[data-pdp-qty]');
    pdp.querySelector('[data-qty-dec]').addEventListener('click', () => {
      qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
    });
    pdp.querySelector('[data-qty-inc]').addEventListener('click', () => {
      qtyInput.value = Math.min(99, (parseInt(qtyInput.value, 10) || 1) + 1);
    });
    qtyInput.addEventListener('change', () => {
      qtyInput.value = Math.max(1, Math.min(99, parseInt(qtyInput.value, 10) || 1));
    });

    // Wire add-to-cart button (cart.js auto-wires [data-add-to-cart] on init,
    // but since we render after init, wire manually here)
    const addBtn = pdp.querySelector('[data-add-to-cart]');
    if (addBtn && !disabled) {
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
        window.STRAND_cart.add(p.id, qty);
      });
    }
  }

  function formatSpecKey(k) {
    const map = {
      purity: 'Purity',
      size: 'Size',
      form: 'Form',
      molecular: 'Molecular',
      casNumber: 'CAS Number',
      storage: 'Storage'
    };
    return map[k] || k;
  }

  function renderRelated(catalog, currentProduct) {
    const wrap = document.querySelector('[data-related-wrap]');
    const grid = document.querySelector('[data-related]');
    if (!wrap || !grid) return;

    const related = catalog.products
      .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
      .slice(0, 3);

    if (!related.length) return;

    wrap.style.display = '';
    grid.innerHTML = related.map(p => {
      const img = (p.images && p.images[0]) || '';
      return `
        <a class="product-card reveal" href="product.html?id=${encodeURIComponent(p.id)}">
          <div class="product-card-media">
            <span class="product-card-badge">Research Use</span>
            <img src="${img}" alt="${escape(p.name)}" loading="lazy">
          </div>
          <div class="product-card-body">
            <span class="product-card-cat">${escape(window.STRAND_categoryLabel(p.category))}</span>
            <h3 class="product-card-name">${escape(p.name)}</h3>
            <div class="product-card-foot">
              <span class="price">${window.STRAND_formatPrice(p.price)}</span>
              <span class="stock-pill ${p.stockStatus === 'out' ? 'out' : (p.stockStatus === 'low' ? 'low' : '')}">${p.stockStatus === 'out' ? 'Out' : (p.stockStatus === 'low' ? 'Low' : 'In stock')}</span>
            </div>
          </div>
        </a>
      `;
    }).join('');

    if (window.STRAND_armReveal) window.STRAND_armReveal();
  }

  function init() {
    const pdp = document.querySelector('[data-pdp]');
    if (!pdp) return;

    const id = getProductId();
    if (!id) { renderNotFound(pdp); return; }

    if (!window.STRAND_loadCatalog) {
      // main.js / products.js may load after this script; wait a tick
      setTimeout(init, 50);
      return;
    }

    window.STRAND_loadCatalog().then(catalog => {
      const product = catalog.products.find(p => p.id === id);
      if (!product) { renderNotFound(pdp); return; }
      // Set page title
      document.title = `${product.name} — STRAND`;
      renderProduct(pdp, product);
      renderRelated(catalog, product);
    }).catch(() => {
      renderNotFound(pdp);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
