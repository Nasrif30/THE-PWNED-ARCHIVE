/* ===================================================
   SEARCH.JS — Real-time fuzzy search with debounce
   =================================================== */

window.SearchManager = (() => {
    let debounceTimer = null;

    function init(entries) {
        const input = document.getElementById('archive-search');
        if (!input) return;

        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (window.FiltersManager) window.FiltersManager.applyFilters();
            }, 180);
        });

        // Clear on ESC
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                input.value = '';
                if (window.FiltersManager) window.FiltersManager.applyFilters();
            }
        });
    }

    return { init };
})();
