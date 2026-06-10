/* ===================================================
   GALLERY.JS — Masonry gallery + lightbox
   =================================================== */

class Gallery {
    constructor() {
        this.images       = [];
        this.currentIndex = 0;
        this.lb           = document.getElementById('lightbox');
        this.lbImg        = document.getElementById('lightbox-img');
        this.lbCaption    = document.getElementById('lightbox-caption');

        this.bindLightboxControls();
    }

    init(screenshotPaths) {
        this.images = screenshotPaths || [];
        const container = document.getElementById('gallery-container');
        if (!container || this.images.length === 0) return;

        container.innerHTML = `
            <div class="gallery-section">
                <div class="gallery-title">Operation Screenshots (${this.images.length})</div>
                <div class="gallery-grid" id="screenshot-grid"></div>
            </div>
        `;

        const grid = document.getElementById('screenshot-grid');

        this.images.forEach((src, i) => {
            const thumb = document.createElement('div');
            thumb.className = 'gallery-thumb animate-fade-in';
            thumb.style.animationDelay = `${i * 0.06}s`;
            thumb.setAttribute('role', 'button');
            thumb.setAttribute('tabindex', '0');
            thumb.setAttribute('aria-label', `View screenshot ${i + 1}`);
            thumb.innerHTML = `
                <img src="${src}"
                     alt="Screenshot ${i + 1}"
                     loading="lazy"
                     onerror="this.parentElement.style.display='none'">
                <div class="gallery-overlay">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">
                        <circle cx="12" cy="12" r="6"/>
                        <line x1="16.5" y1="16.5" x2="24" y2="24"/>
                        <line x1="9" y1="12" x2="15" y2="12"/>
                        <line x1="12" y1="9" x2="12" y2="15"/>
                    </svg>
                </div>
            `;

            thumb.addEventListener('click', () => this.openLightbox(i));
            thumb.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.openLightbox(i);
            });

            grid.appendChild(thumb);
        });
    }

    bindLightboxControls() {
        const closeBtn = document.getElementById('lightbox-close');
        const prevBtn  = document.getElementById('lightbox-prev');
        const nextBtn  = document.getElementById('lightbox-next');

        if (closeBtn) closeBtn.addEventListener('click', () => this.closeLightbox());
        if (prevBtn)  prevBtn.addEventListener('click',  () => this.prev());
        if (nextBtn)  nextBtn.addEventListener('click',  () => this.next());

        if (this.lb) {
            this.lb.addEventListener('click', (e) => {
                if (e.target === this.lb) this.closeLightbox();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (!this.lb || !this.lb.classList.contains('open')) return;
            if (e.key === 'ArrowLeft')  this.prev();
            if (e.key === 'ArrowRight') this.next();
            if (e.key === 'Escape')     this.closeLightbox();
        });
    }

    openLightbox(index) {
        this.currentIndex = index;
        this.updateLightbox();
        if (this.lb) {
            this.lb.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    closeLightbox() {
        if (this.lb) {
            this.lb.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    updateLightbox() {
        if (this.lbImg)     this.lbImg.src         = this.images[this.currentIndex];
        if (this.lbCaption) this.lbCaption.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
    }

    prev() {
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.images.length - 1;
        this.updateLightbox();
    }

    next() {
        this.currentIndex = this.currentIndex < this.images.length - 1 ? this.currentIndex + 1 : 0;
        this.updateLightbox();
    }
}

window.GalleryManager = new Gallery();