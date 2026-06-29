/* ===================================================
   ANALYTICS.JS — Data processing + chart rendering
   =================================================== */

window.AnalyticsManager = (() => {
    let processedData = null;

    function processData(entries) {
        if (!entries || entries.length === 0) return;

        const platforms   = {};
        const difficulties = {};
        const osMap       = {};
        const monthly     = {};

        entries.forEach(e => {
            // Platforms
            const plat = e.platform || 'Unknown';
            platforms[plat] = (platforms[plat] || 0) + 1;

            // Difficulty
            const diff = e.difficulty || 'Unknown';
            difficulties[diff] = (difficulties[diff] || 0) + 1;

            // OS
            const os = e.os || 'Unknown';
            osMap[os] = (osMap[os] || 0) + 1;

            // Monthly
            if (e.date) {
                const key = e.date.substring(0, 7); // YYYY-MM
                monthly[key] = (monthly[key] || 0) + 1;
            }
        });

        processedData = { platforms, difficulties, os: osMap, monthly, total: entries.length };
    }

    function init() {
        if (!processedData) {
            if (window.ArchiveManager && window.ArchiveManager.entries.length === 0 && !window.ArchiveManager.isLoading) {
                window.ArchiveManager.init();
            }
            // Retry if archive hasn't loaded yet
            setTimeout(init, 500);
            return;
        }

        renderStats();
        renderCharts();

        window.addEventListener('themechange', () => {
            if (document.getElementById('charts-grid')) {
                renderCharts();
            }
        });
    }

    function renderStats() {
        const container = document.getElementById('analytics-stats');
        if (!container || !processedData) return;

        const { total, difficulties, os } = processedData;
        const easy   = difficulties['Easy'] || 0;
        const medium = difficulties['Medium'] || 0;
        const hard   = (difficulties['Hard'] || 0) + (difficulties['Insane'] || 0);
        const linux  = os['Linux'] || 0;
        const windows = os['Windows'] || 0;
        
        let flags = 0;
        if (window.ArchiveManager && window.ArchiveManager.entries) {
            flags = window.ArchiveManager.entries.reduce((acc, e) => acc + (e.flags || 0), 0);
        }

        container.innerHTML = `
            <div class="stat-widget accent-green animate-card-pop">
                <div class="stat-label">Total Entries</div>
                <div class="stat-value">${total}</div>
                <div class="stat-sub">All time</div>
            </div>
            <div class="stat-widget accent-blue animate-card-pop">
                <div class="stat-label">Easy / Medium</div>
                <div class="stat-value">${easy} / ${medium}</div>
                <div class="stat-sub">Difficulty split</div>
            </div>
            <div class="stat-widget accent-orange animate-card-pop">
                <div class="stat-label">Hard / Insane</div>
                <div class="stat-value">${hard}</div>
                <div class="stat-sub">Hardest challenges</div>
            </div>
            <div class="stat-widget accent-teal animate-card-pop">
                <div class="stat-label">Linux / Win</div>
                <div class="stat-value">${linux} / ${windows}</div>
                <div class="stat-sub">OS breakdown</div>
            </div>
            <div class="stat-widget accent-purple animate-card-pop">
                <div class="stat-label">Flags Captured</div>
                <div class="stat-value">${flags}</div>
                <div class="stat-sub">Total flags found</div>
            </div>
        `;
    }

    function renderCharts() {
        const grid = document.getElementById('charts-grid');
        if (!grid || !processedData) return;

        grid.innerHTML = `
            <div class="chart-card animate-fade-in">
                <div class="chart-card-title">Platform Distribution</div>
                <canvas id="chart-platforms" height="220" aria-label="Platform distribution chart"></canvas>
            </div>
            <div class="chart-card animate-fade-in" style="animation-delay:.1s">
                <div class="chart-card-title">Difficulty Breakdown</div>
                <canvas id="chart-difficulty" height="220" aria-label="Difficulty chart"></canvas>
            </div>
            <div class="chart-card animate-fade-in" style="animation-delay:.15s">
                <div class="chart-card-title">OS Distribution</div>
                <canvas id="chart-os" height="220" aria-label="OS distribution chart"></canvas>
            </div>
            <div class="chart-card animate-fade-in" style="animation-delay:.2s" style="grid-column:1/-1;">
                <div class="chart-card-title">Monthly Activity</div>
                <canvas id="chart-monthly" height="180" aria-label="Monthly activity chart"></canvas>
            </div>
        `;

        // Wait for DOM paint then draw
        requestAnimationFrame(() => {
            if (!window.ChartRenderer) return;

            const { platforms, difficulties, os, monthly } = processedData;

            // Platform donut
            window.ChartRenderer.donut('chart-platforms', platforms, [
                '#9fef00', '#c11111', '#0a84ff', '#ff9f0a', '#bf5af2', '#64d2ff'
            ]);

            // Difficulty donut
            window.ChartRenderer.donut('chart-difficulty', difficulties, [
                '#30d158', '#ffd60a', '#ff453a', '#bf5af2'
            ]);

            // OS donut
            window.ChartRenderer.donut('chart-os', os, [
                '#0a84ff', '#ff9f0a', '#30d158', '#ff453a'
            ]);

            // Monthly bar
            const sortedMonths = Object.keys(monthly).sort();
            const labels  = sortedMonths.map(m => {
                const [y, mo] = m.split('-');
                return new Date(y, parseInt(mo) - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
            });
            window.ChartRenderer.bar('chart-monthly', labels, sortedMonths.map(m => monthly[m]));
        });
    }

    return { init, processData };
})();
