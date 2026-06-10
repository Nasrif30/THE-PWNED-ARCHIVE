/* ===================================================
   ROUTER.JS — Hash-based SPA routing
   =================================================== */

class Router {
    constructor() {
        this.appView   = document.getElementById('app-view');
        this.navLinks  = document.querySelectorAll('.nav-link[data-route]');
        this.tabBtns   = document.querySelectorAll('.tab-btn[data-route]');

        window.addEventListener('hashchange', () => this.handleRoute());
    }

    init() {
        if (!window.location.hash || window.location.hash === '#') {
            window.location.hash = '#archive';
        } else {
            this.handleRoute();
        }
    }

    handleRoute() {
        const raw  = window.location.hash.substring(1);
        let view   = raw;
        let slug   = null;

        // Dynamic route: #entry/some-slug
        if (raw.startsWith('entry/')) {
            view = 'entry';
            slug = raw.split('/')[1];
        }

        // Update active states
        this.navLinks.forEach(l => {
            l.classList.toggle('active', l.dataset.route === view);
        });
        this.tabBtns.forEach(b => {
            b.classList.toggle('active', b.dataset.route === view);
        });

        this.renderView(view, slug);
    }

    renderView(view, slug) {
        this.appView.innerHTML = '';
        this.appView.className = 'animate-fade-in';

        // Force reflow for re-animation
        void this.appView.offsetWidth;

        switch (view) {
            case 'archive':   this.mountArchive();     break;
            case 'analytics': this.mountAnalytics();   break;
            case 'profile':   this.mountProfile();     break;
            case 'entry':     this.mountEntry(slug);   break;
            default:          this.mountArchive();     break;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    mountArchive() {
        this.appView.innerHTML = `
            <div class="page-header">
                <h2>The Archive</h2>
                <p class="page-header-sub">All documented machines, challenges &amp; writeups</p>
            </div>

            <div class="archive-controls">
                <div class="search-container">
                    <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                    </svg>
                    <input type="search"
                           id="archive-search"
                           class="search-bar"
                           placeholder="Search by name, platform, tag..."
                           aria-label="Search archive">
                </div>

                <div class="filter-bar" id="filter-bar" role="group" aria-label="Platform filters"></div>

                <div class="archive-toolbar">
                    <span class="archive-count" id="archive-count"></span>
                    <div style="display:flex; gap:var(--space-8); align-items:center;">
                        <select class="sort-select" id="sort-select" aria-label="Sort entries">
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="name-asc">Name A–Z</option>
                            <option value="difficulty">Difficulty</option>
                        </select>
                        <div class="view-toggle" role="group" aria-label="View mode">
                            <button class="view-btn active" id="view-grid" aria-label="Grid view" title="Grid view">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                    <rect x="0" y="0" width="6" height="6" rx="1"/><rect x="8" y="0" width="6" height="6" rx="1"/>
                                    <rect x="0" y="8" width="6" height="6" rx="1"/><rect x="8" y="8" width="6" height="6" rx="1"/>
                                </svg>
                            </button>
                            <button class="view-btn" id="view-list" aria-label="Timeline view" title="Timeline view">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                    <rect x="0" y="0" width="14" height="2.5" rx="1.25"/>
                                    <rect x="0" y="5.75" width="14" height="2.5" rx="1.25"/>
                                    <rect x="0" y="11.5" width="14" height="2.5" rx="1.25"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="stats-row" id="archive-stats"></div>
            <div id="archive-grid" class="grid-layout"></div>
        `;

        if (window.ArchiveManager) window.ArchiveManager.init();
    }

    mountAnalytics() {
        this.appView.innerHTML = `
            <div class="page-header">
                <h2>Analytics</h2>
                <p class="page-header-sub">Intelligence reports generated from your archive</p>
            </div>
            <div class="stats-row" id="analytics-stats"></div>
            <div class="analytics-grid" id="charts-grid">
                <div style="color:var(--text-secondary); font-family:var(--font-mono); padding:var(--space-40); text-align:center;">
                    Generating reports...
                </div>
            </div>
        `;
        if (window.AnalyticsManager) window.AnalyticsManager.init();
    }

    mountProfile() {
        this.appView.innerHTML = `
            <div class="page-header">
                <h2>Operator Profile</h2>
                <p class="page-header-sub">Intelligence dossier</p>
            </div>
            <div id="profile-content"></div>
        `;
        if (window.ProfileManager) window.ProfileManager.renderFullProfile();
    }

    mountEntry(slug) {
        this.appView.innerHTML = `
            <button onclick="window.history.back()" class="back-btn" aria-label="Go back to archive">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                    <polyline points="10 4 6 8 10 12"/>
                </svg>
                Back to Archive
            </button>
            <article id="entry-content" class="markdown-body">
                <div class="loading-pulse">
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                    Decrypting writeup...
                </div>
            </article>
            <div id="gallery-container"></div>
        `;
        if (window.MarkdownManager) window.MarkdownManager.loadEntry(slug);
    }
}

window.AppRouter = new Router();