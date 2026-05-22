/* ============================================================
   STRAND — FAQ accordion
   ============================================================ */

(function () {
  'use strict';

  function init() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        // Optionally close others — leave them, multi-open is friendlier
        item.classList.toggle('open', !wasOpen);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
