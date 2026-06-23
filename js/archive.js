/* ===================================================
   ARCHIVE.JS — Entry loader, grid renderer
   =================================================== */

class Archive {
    constructor() {
        this.entries      = [];
        this.filtered     = [];
        this.isLoading    = false;
        this.currentView  = 'grid';
        this.repoPath     = this.getRepoPath();
    }

    getRepoPath() {
        const host = window.location.hostname;
        const path = window.location.pathname.split('/')[1] || '';
        if (host.includes('github.io')) {
            return `${host.split('.')[0]}/${path}`.replace(/\/$/, '');
        }
        return 'Nasrif30/the-pwned-archive';
    }

    async init() {
        // If already loaded, just re-render (e.g. navigating back)
        if (this.entries.length > 0) {
            this.renderStats();
            this.renderGrid(this.filtered.length ? this.filtered : this.entries);
            this.initViewToggle();
            return;
        }

        this.showGridLoading();
        this.isLoading = true;

        try {
            // Try GitHub API first
            const apiUrl = `https://api.github.com/repos/${this.repoPath}/contents/entries`;
            let files = [];

            try {
                const res = await fetch(apiUrl);
                if (res.ok) {
                    files = await res.json();
                } else throw new Error('API fallback');
            } catch {
                // Local fallback — discover files via index or hardcoded list
                const knownFiles = [
                    'operation-coldstart', 'nginx-rift', 'mr-robot',
                    '0day', 'anonymous-playground', 'el-bandito',
                    'uplink-htb', 'support-thm', 'evil-corp',
                    'owasp-juice-shop', 'haskhell', 'captchapocalypse'
                ];
                files = knownFiles.map(n => ({
                    name: `${n}.json`,
                    download_url: `entries/${n}.json`
                }));
            }

            const jsonFiles = files.filter(f => f.name && f.name.endsWith('.json'));

            const results = await Promise.allSettled(
                jsonFiles.map(f => fetch(f.download_url).then(r => {
                    if (!r.ok) throw new Error('Not found');
                    return r.json();
                }))
            );

            this.entries = results
                .filter(r => r.status === 'fulfilled' && r.value && r.value.slug)
                .map(r => r.value);

            this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.filtered = [...this.entries];

            // Feed data to other modules
            if (window.AnalyticsManager) window.AnalyticsManager.processData(this.entries);
            if (window.TerminalManager)  window.TerminalManager.setEntries(this.entries);
            if (window.FiltersManager)   window.FiltersManager.init(this.entries);
            if (window.SearchManager)    window.SearchManager.init(this.entries);

            this.renderStats();
            this.renderGrid(this.filtered);
            this.initViewToggle();

        } catch (err) {
            console.error('Archive error:', err);
            const grid = document.getElementById('archive-grid');
            if (grid) grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">&#x26A0;</div>
                    <div class="empty-state-title">Failed to load archive</div>
                    <div class="empty-state-desc">${err.message}</div>
                </div>
            `;
        } finally {
            this.isLoading = false;
        }
    }

    showGridLoading() {
        const grid = document.getElementById('archive-grid');
        if (!grid) return;
        grid.innerHTML = Array(6).fill(0).map(() =>
            `<div class="skeleton skeleton-card animate-fade-in"></div>`
        ).join('');
    }

    renderStats() {
        const container = document.getElementById('archive-stats');
        if (!container || this.entries.length === 0) return;

        const total    = this.entries.length;
        const flags    = this.entries.reduce((acc, e) => acc + (e.flags || 0), 0);
        const favs     = this.entries.filter(e => e.favorite).length;
        const latest   = this.entries[0]?.platform || '—';
        const streak   = this.calcStreak();

        container.innerHTML = `
            <div class="stat-widget accent-green animate-card-pop">
                <div class="stat-label">Total Pwned</div>
                <div class="stat-value">${total}</div>
                <div class="stat-sub">Machines &amp; Challenges</div>
            </div>
            <div class="stat-widget accent-blue animate-card-pop">
                <div class="stat-label">Flags Captured</div>
                <div class="stat-value">${flags}</div>
                <div class="stat-sub">root.txt &amp; user.txt</div>
            </div>
            <div class="stat-widget accent-orange animate-card-pop">
                <div class="stat-label">Day Streak</div>
                <div class="stat-value">${streak}</div>
                <div class="stat-sub">Consecutive days</div>
            </div>
            <div class="stat-widget accent-purple animate-card-pop">
                <div class="stat-label">Favorites</div>
                <div class="stat-value">${favs}</div>
                <div class="stat-sub">Starred entries</div>
            </div>
            <div class="stat-widget accent-teal animate-card-pop">
                <div class="stat-label">Latest Platform</div>
                <div class="stat-value" style="font-size:1rem; margin-top:4px;">${latest}</div>
                <div class="stat-sub">Most recent target</div>
            </div>
        `;
    }

    calcStreak() {
        if (this.entries.length === 0) return 0;
        const dates = [...new Set(
            this.entries.map(e => e.date?.split('T')[0])
        )].sort((a, b) => new Date(b) - new Date(a));

        let streak = 0;
        let ref    = new Date();
        ref.setHours(0, 0, 0, 0);

        for (const d of dates) {
            const day = new Date(d);
            day.setHours(0, 0, 0, 0);
            const diff = Math.round((ref - day) / (1000 * 60 * 60 * 24));
            if (diff === 0 || diff === 1) { streak++; ref = day; }
            else break;
        }
        return streak;
    }

    renderGrid(data) {
        const grid    = document.getElementById('archive-grid');
        const count   = document.getElementById('archive-count');
        if (!grid) return;

        if (count) {
            count.textContent = `${data.length} ${data.length === 1 ? 'entry' : 'entries'}`;
        }

        if (data.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <div class="empty-state-icon" style="opacity: 0.5; margin-bottom: 10px; display: flex; justify-content: center;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <div class="empty-state-title">No entries found</div>
                    <div class="empty-state-desc">Try adjusting your search or filters.</div>
                </div>
            `;
            return;
        }

        if (this.currentView === 'grid') {
            grid.className = 'grid-layout';
            grid.innerHTML = data.map((entry, i) => this.buildCard(entry, i)).join('');
        } else {
            grid.className = 'timeline-layout';
            grid.innerHTML = data.map((entry, i) => `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-card card animate-card-pop" style="animation-delay:${i * 0.06}s"
                         onclick="window.location.hash='entry/${entry.slug}'"
                         role="button" tabindex="0"
                         aria-label="Open ${entry.title} writeup">
                        ${this.buildCardInner(entry)}
                    </div>
                </div>
            `).join('');
        }
    }

    buildCard(entry, i) {
        return `
            <div class="card animate-card-pop"
                 style="animation-delay:${i * 0.06}s"
                 onclick="window.location.hash='entry/${entry.slug}'"
                 role="button" tabindex="0"
                 aria-label="Open ${entry.title} writeup"
                 onkeypress="if(event.key==='Enter') window.location.hash='entry/${entry.slug}'">
                ${this.buildCardInner(entry)}
            </div>
        `;
    }

    buildCardInner(entry) {
        const diffClass  = `difficulty-${(entry.difficulty || '').toLowerCase()}`;
        const platClass  = `platform-${(entry.platform || '').toLowerCase().replace(/\s/g, '')}`;
        const tagsHtml   = (entry.tags || []).slice(0, 3).map(t =>
            `<span class="tag">${t}</span>`
        ).join('');

        return `
            <div class="card-header">
                <div class="card-title">${entry.title || 'Untitled'}</div>
                ${entry.favorite ? '<span class="card-favorite" aria-label="Favorite">&#9733;</span>' : ''}
            </div>

            <div class="tag-container">
                <span class="tag platform ${platClass}">${entry.platform || '?'}</span>
                <span class="tag ${diffClass}">${entry.difficulty || '?'}</span>
            </div>

            ${tagsHtml ? `<div class="tag-container">${tagsHtml}</div>` : ''}

            <div class="card-footer">
                <div class="card-meta">
                    <svg class="card-meta-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14A6 6 0 118 2a6 6 0 010 12z"/>
                        <path d="M8.5 4H7v5l4.28 2.54.72-1.21-3.5-2.08V4z"/>
                    </svg>
                    ${entry.date || '—'}
                </div>
                <div class="card-meta">
                    <span style="opacity:0.5; font-size:0.72rem;">OS: ${entry.os || '?'}</span>
                    ${entry.flags ? `<span style="color:var(--accent-color); font-size:0.72rem; font-weight:700;">${entry.flags} flag${entry.flags > 1 ? 's' : ''}</span>` : ''}
                </div>
            </div>
        `;
    }

    initViewToggle() {
        const gridBtn = document.getElementById('view-grid');
        const listBtn = document.getElementById('view-list');
        if (!gridBtn || !listBtn) return;

        gridBtn.addEventListener('click', () => {
            this.currentView = 'grid';
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            this.renderGrid(this.filtered);
        });

        listBtn.addEventListener('click', () => {
            this.currentView = 'list';
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            this.renderGrid(this.filtered);
        });
    }

    updateFiltered(data) {
        this.filtered = data;
        this.renderGrid(data);
    }
}

window.ArchiveManager = new Archive();