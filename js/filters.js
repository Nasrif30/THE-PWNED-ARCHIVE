/* ===================================================
   FILTERS.JS — Platform/difficulty filter pills + sort
   =================================================== */

window.FiltersManager = (() => {
    let allEntries  = [];
    let activeFilter = 'all';

    const PLATFORM_FILTERS = [
        { key: 'all',       label: 'All' },
        { key: 'favorites', label: 'Favorites' },
        { key: 'hackthebox',label: 'HackTheBox' },
        { key: 'tryhackme', label: 'TryHackMe' },
        { key: 'picoctf',   label: 'PicoCTF' },
        { key: 'vulnhub',   label: 'VulnHub' },
        { key: 'custom',    label: 'Custom' },
    ];

    function init(entries) {
        allEntries = entries;
        renderFilterPills();
        bindSortSelect();
    }

    function renderFilterPills() {
        const bar = document.getElementById('filter-bar');
        if (!bar) return;

        bar.innerHTML = PLATFORM_FILTERS.map(f => `
            <button class="filter-pill ${f.key === activeFilter ? 'active' : ''}"
                    data-filter="${f.key}"
                    aria-pressed="${f.key === activeFilter}"
                    role="button">
                ${f.label}
            </button>
        `).join('');

        bar.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                activeFilter = btn.dataset.filter;
                bar.querySelectorAll('.filter-pill').forEach(b => {
                    b.classList.toggle('active', b.dataset.filter === activeFilter);
                    b.setAttribute('aria-pressed', b.dataset.filter === activeFilter);
                });
                applyFilters();
            });
        });
    }

    function bindSortSelect() {
        const sel = document.getElementById('sort-select');
        if (sel) sel.addEventListener('change', applyFilters);
    }

    function applyFilters() {
        const searchVal = (document.getElementById('archive-search')?.value || '').toLowerCase().trim();
        const sortVal   = document.getElementById('sort-select')?.value || 'date-desc';

        let result = [...allEntries];

        // Platform filter
        switch (activeFilter) {
            case 'favorites':
                result = result.filter(e => e.favorite);
                break;
            case 'hackthebox':
                result = result.filter(e => e.platform?.toLowerCase().includes('hackthebox') || e.platform?.toLowerCase().includes('hack the box'));
                break;
            case 'tryhackme':
                result = result.filter(e => e.platform?.toLowerCase().includes('tryhackme'));
                break;
            case 'picoctf':
                result = result.filter(e => e.platform?.toLowerCase().includes('pico'));
                break;
            case 'vulnhub':
                result = result.filter(e => e.platform?.toLowerCase().includes('vulnhub'));
                break;
            case 'custom':
                result = result.filter(e => e.platform?.toLowerCase().includes('custom'));
                break;
        }

        // Search filter (from SearchManager)
        if (searchVal) {
            result = result.filter(e =>
                e.title?.toLowerCase().includes(searchVal)      ||
                e.platform?.toLowerCase().includes(searchVal)   ||
                e.difficulty?.toLowerCase().includes(searchVal) ||
                e.os?.toLowerCase().includes(searchVal)         ||
                (e.tags || []).some(t => t.toLowerCase().includes(searchVal))
            );
        }

        // Sort
        switch (sortVal) {
            case 'date-desc':
                result.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                result.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'name-asc':
                result.sort((a, b) => a.title?.localeCompare(b.title));
                break;
            case 'difficulty':
                const order = { easy: 0, medium: 1, hard: 2, insane: 3 };
                result.sort((a, b) =>
                    (order[a.difficulty?.toLowerCase()] ?? 99) -
                    (order[b.difficulty?.toLowerCase()] ?? 99)
                );
                break;
        }

        if (window.ArchiveManager) window.ArchiveManager.updateFiltered(result);
    }

    return { init, applyFilters };
})();
