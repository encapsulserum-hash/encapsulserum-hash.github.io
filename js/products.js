/* ============================================================
   STRAND — Products
   Loads catalog, renders cards, sorts, filters
   ============================================================ */

(function () {
  'use strict';

  let CATALOG = null;
  let loadPromise = null;

  function loadCatalog() {
    if (CATALOG) return Promise.resolve(CATALOG);
    if (loadPromise) return loadPromise;
    loadPromise = fetch('data/products.json')
      .then(r => {
        if (!r.ok) throw new Error('catalog failed to load');
        return r.json();
      })
      .then(data => { CATALOG = data; return data; });
    return loadPromise;
  }
  window.STRAND_loadCatalog = loadCatalog;

  function findProduct(id) {
    if (!CATALOG) return null;
    return CATALOG.products.find(p => p.id === id) || null;
  }
  window.STRAND_findProduct = findProduct;

  function formatPrice(amount, currency) {
    currency = currency || (CATALOG && CATALOG.currency) || 'USD';
    const sym = currency === 'USD' ? '$' : currency + ' ';
    return `<span class="price-currency">${sym}</span>${Number(amount).toFixed(2)}`;
  }
  window.STRAND_formatPrice = formatPrice;

  function categoryLabel(cat) {
    return ({ pens: 'Pens', vials: 'Vials', tertiary: 'Lab Supplies' }[cat]) || cat;
  }
  window.STRAND_categoryLabel = categoryLabel;

  function stockPill(status) {
    if (status === 'low') return '<span class="stock-pill low">Low stock</span>';
    if (status === 'out') return '<span class="stock-pill out">Out of stock</span>';
    return '<span class="stock-pill">In stock</span>';
  }

  function renderCard(p) {
    const img = (p.images && p.images[0]) || 'https://picsum.photos/seed/placeholder/800/1000';
    return `
      <a class="product-card reveal" href="product.html?id=${encodeURIComponent(p.id)}">
        <div class="product-card-media">
          <span class="product-card-badge">Research Use</span>
          <img src="${img}" alt="${escapeHtml(p.name)}" loading="lazy">
        </div>
        <div class="product-card-body">
          <span class="product-card-cat">${escapeHtml(categoryLabel(p.category))}</span>
          <h3 class="product-card-name">${escapeHtml(p.name)}</h3>
          <div class="product-card-foot">
            <span class="price">${formatPrice(p.price)}</span>
            ${stockPill(p.stockStatus)}
          </div>
        </div>
      </a>
    `;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  window.STRAND_escape = escapeHtml;

  function sortProducts(items, mode) {
    const copy = items.slice();
    switch (mode) {
      case 'price-asc': return copy.sort((a, b) => a.price - b.price);
      case 'price-desc': return copy.sort((a, b) => b.price - a.price);
      case 'name': return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'featured':
      default:
        return copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }

  function filterProducts(items, opts) {
    return items.filter(p => {
      if (opts.category && opts.category !== 'all' && p.category !== opts.category) return false;
      if (opts.inStockOnly && p.stockStatus === 'out') return false;
      return true;
    });
  }

  // Render into any element with class .product-grid
  // Optional sibling [data-product-count] gets filled with count
  function renderGrid(grid) {
    if (!CATALOG) return;
    const category = grid.dataset.category || 'all';
    const sortMode = grid.dataset.sort || 'featured';
    const inStockOnly = grid.dataset.inStockOnly === 'true';
    let items = filterProducts(CATALOG.products, { category, inStockOnly });
    items = sortProducts(items, sortMode);

    if (!items.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p class="eyebrow">No results</p>
          <h2>Nothing matches those filters</h2>
          <p>Try removing the in-stock filter, or browse other categories.</p>
        </div>`;
    } else {
      grid.innerHTML = items.map(renderCard).join('');
    }

    // Update count
    const countEl = document.querySelector('[data-product-count]');
    if (countEl) countEl.textContent = items.length + (items.length === 1 ? ' item' : ' items');

    // Re-arm scroll reveal
    if (window.STRAND_armReveal) window.STRAND_armReveal();
  }
  window.STRAND_renderGrid = renderGrid;

  // ---------- Toolbar wiring (category pages) ----------
  function setupToolbar(grid) {
    const sortSel = document.querySelector('[data-sort]');
    const stockToggle = document.querySelector('[data-instock]');
    if (sortSel) {
      sortSel.addEventListener('change', () => {
        grid.dataset.sort = sortSel.value;
        renderGrid(grid);
      });
    }
    if (stockToggle) {
      stockToggle.addEventListener('change', () => {
        grid.dataset.inStockOnly = stockToggle.checked ? 'true' : 'false';
        renderGrid(grid);
      });
    }
  }

  // ---------- Auto init ----------
  function init() {
    const grids = document.querySelectorAll('.product-grid');
    if (!grids.length) return;
    loadCatalog().then(() => {
      grids.forEach(g => {
        renderGrid(g);
        setupToolbar(g);
      });
    }).catch(err => {
      grids.forEach(g => { g.innerHTML = `<p class="muted" style="grid-column: 1/-1;">Catalog unavailable: ${err.message}</p>`; });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
