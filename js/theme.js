/* ===================================================
   THEME.JS — Dark/Light mode with system preference
   =================================================== */

window.ThemeManager = (() => {
    const STORAGE_KEY = 'pwned-archive-theme';
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');

    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function getSavedTheme() {
        return localStorage.getItem(STORAGE_KEY);
    }

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // Update all toggle buttons ARIA
        document.querySelectorAll('#theme-toggle, #theme-toggle-desktop, #theme-toggle-mobile').forEach(t => {
            t.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
        });

        // Update theme-color meta
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.content = theme === 'dark' ? '#00ff9d' : '#1d9e75';
        }
    }

    function init() {
        const saved = getSavedTheme();
        const theme = saved || getSystemTheme();
        applyTheme(theme);

        document.querySelectorAll('#theme-toggle, #theme-toggle-desktop, #theme-toggle-mobile').forEach(t => {
            t.addEventListener('click', () => {
                const current = root.getAttribute('data-theme');
                applyTheme(current === 'dark' ? 'light' : 'dark');
            });
        });

        // Listen to system preference changes
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
            if (!getSavedTheme()) {
                applyTheme(e.matches ? 'light' : 'dark');
            }
        });
    }

    init();

    return { applyTheme, getTheme: () => root.getAttribute('data-theme') };
})();
