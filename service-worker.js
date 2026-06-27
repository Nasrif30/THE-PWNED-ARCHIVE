/* ===================================================
   SERVICE WORKER — The Pwned Archive PWA
   =================================================== */

const CACHE_NAME = 'pwned-archive-v1';
const BASE = '/THE-PWNED-ARCHIVE/';

// Core shell files to pre-cache
const SHELL_ASSETS = [
    BASE,
    BASE + 'index.html',
    BASE + 'css/reset.css',
    BASE + 'css/variables.css',
    BASE + 'css/layout.css',
    BASE + 'css/components.css',
    BASE + 'css/pages.css',
    BASE + 'css/animations.css',
    BASE + 'css/responsive.css',
    BASE + 'js/theme.js',
    BASE + 'js/router.js',
    BASE + 'js/profile.js',
    BASE + 'js/app.js',
    BASE + 'js/archive.js',
    BASE + 'js/search.js',
    BASE + 'js/filters.js',
    BASE + 'js/markdown.js',
    BASE + 'js/gallery.js',
    BASE + 'js/analytics.js',
    BASE + 'js/charts.js',
    BASE + 'js/terminal.js',
    BASE + 'assets/favicon.png',
    BASE + 'assets/icon-192.png',
    BASE + 'assets/icon-512.png',
    BASE + 'data/profile.json',
];

// Install: pre-cache shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: Network-first for entries/content (fresh data), Cache-first for shell
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Always go network for entries/content (they change often)
    if (url.pathname.includes('/entries/') || url.pathname.includes('/content/')) {
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    if (res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    }
                    return res;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for everything else (shell, CSS, JS, images)
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(res => {
                if (res.ok) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                }
                return res;
            });
        })
    );
});
