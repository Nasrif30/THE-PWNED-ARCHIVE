document.addEventListener('DOMContentLoaded', () => {
    console.log('%c THE PWNED ARCHIVE ', 'background:#00ff9d; color:#000; font-weight:700; font-size:14px; padding:4px 8px; border-radius:4px;');

    // 1. Initialize Router
    if (window.AppRouter) window.AppRouter.init();

    // 2. Load Profile data (populates sidebar)
    if (window.ProfileManager) window.ProfileManager.init();
});

// Global UI helpers
window.UI = {
    showLoading: (elementId) => {
        const el = document.getElementById(elementId);
        if (el) el.innerHTML = `
            <div class="loading-pulse">
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
                Retrieving payload...
            </div>
        `;
    },
    showError: (elementId, msg) => {
        const el = document.getElementById(elementId);
        if (el) el.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">&#x26A0;</div>
                <div class="empty-state-title">Error</div>
                <div class="empty-state-desc" style="color:var(--sys-red);">${msg}</div>
            </div>
        `;
    }
};