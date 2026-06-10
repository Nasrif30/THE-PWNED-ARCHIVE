/* ===================================================
   PROFILE.JS — Sidebar + full profile page
   =================================================== */

class Profile {
    constructor() {
        this.profileData = null;
        this.dataSource  = 'data/profile.json';
    }

    async init() {
        try {
            const res = await fetch(this.dataSource);
            if (!res.ok) throw new Error('Profile data missing.');
            this.profileData = await res.json();
            this.populateSidebar();
        } catch (err) {
            console.error('Profile Load Error:', err);
            // Use defaults so sidebar is not empty
            this.profileData = {
                name: 'Alnasrif Haliddin',
                handle: '@Nasrif30',
                bio: 'Cybersecurity Enthusiast • CTF Player • Future Penetration Tester',
                certifications: [],
                learningFocus: 'Penetration Testing',
                location: 'Philippines',
                github: 'https://github.com/Nasrif30'
            };
            this.populateSidebar();
        }
    }

    populateSidebar() {
        if (!this.profileData) return;
        const d = this.profileData;

        const nameEl   = document.getElementById('ui-name');
        const handleEl = document.getElementById('ui-handle');
        const bioEl    = document.getElementById('ui-bio');

        if (nameEl)   nameEl.textContent   = d.name   || '';
        if (handleEl) handleEl.textContent = d.handle || '';
        if (bioEl)    bioEl.textContent    = d.bio    || '';

        document.title = `The Pwned Archive | ${d.name || 'Operator'}`;

        // Social links
        const socialEl = document.getElementById('ui-social-links');
        if (socialEl) {
            const platforms = [
                { key: 'github',   icon: 'assets/icons/github.svg',   label: 'GitHub'  },
                { key: 'htb',      icon: 'assets/icons/htb.svg',      label: 'HackTheBox' },
                { key: 'thm',      icon: 'assets/icons/thm.svg',      label: 'TryHackMe'  },
                { key: 'linkedin', icon: 'assets/icons/linkedin.svg',  label: 'LinkedIn'   },
            ];

            socialEl.innerHTML = platforms
                .filter(p => d[p.key])
                .map(p => `
                    <a href="${d[p.key]}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="social-icon hover-scale"
                       aria-label="${p.label} profile"
                       title="${p.label}">
                        <img src="${p.icon}" alt="${p.label}" loading="lazy">
                    </a>
                `).join('');
        }
    }

    renderFullProfile() {
        if (!this.profileData) {
            const el = document.getElementById('profile-content');
            if (el) el.innerHTML = `
                <div class="loading-pulse">
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                    Loading profile...
                </div>
            `;
            setTimeout(() => this.renderFullProfile(), 500);
            return;
        }

        const d = this.profileData;
        const container = document.getElementById('profile-content');
        if (!container) return;

        const entries = window.ArchiveManager?.entries || [];
        const total   = entries.length;
        const htb     = entries.filter(e => e.platform?.toLowerCase().includes('hackthebox')).length;
        const thm     = entries.filter(e => e.platform?.toLowerCase().includes('tryhackme')).length;
        const pico    = entries.filter(e => e.platform?.toLowerCase().includes('pico')).length;
        const flags   = entries.reduce((s, e) => s + (e.flags || 0), 0);

        const certHtml = (d.certifications || []).map(cert => `
            <div class="cert-item">
                <div class="cert-icon">C</div>
                <span>${cert}</span>
            </div>
        `).join('') || '<p style="color:var(--text-tertiary); font-size:0.85rem;">No certifications listed yet.</p>';

        // Achievements
        const achievements = this.calcAchievements(entries, d);

        container.innerHTML = `
            <div class="profile-page-grid">
                <!-- Left: Profile Card -->
                <div class="profile-card animate-scale-in">
                    <img src="assets/profile.jpg"
                         alt="${d.name}"
                         class="profile-page-pic"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'><circle cx=\'50\' cy=\'50\' r=\'50\' fill=\'%231c1c1e\'/><text x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-size=\'32\' font-family=\'system-ui\' fill=\'%2300ff9d\'>AN</text></svg>'">
                    <div class="profile-page-name">${d.name || ''}</div>
                    <div class="profile-page-handle">${d.handle || ''}</div>
                    <p class="profile-page-bio">${d.bio || ''}</p>

                    <div style="margin-top:var(--space-20); display:flex; flex-direction:column; gap:var(--space-12); width:100%;">
                        ${d.github   ? `<a href="${d.github}"   target="_blank" rel="noopener" class="btn btn-ghost" style="width:100%; justify-content:center;">GitHub Profile</a>` : ''}
                        ${d.htb      ? `<a href="${d.htb}"      target="_blank" rel="noopener" class="btn btn-ghost" style="width:100%; justify-content:center;">HackTheBox</a>`     : ''}
                        ${d.thm      ? `<a href="${d.thm}"      target="_blank" rel="noopener" class="btn btn-ghost" style="width:100%; justify-content:center;">TryHackMe</a>`      : ''}
                        ${d.linkedin ? `<a href="${d.linkedin}"  target="_blank" rel="noopener" class="btn btn-ghost" style="width:100%; justify-content:center;">LinkedIn</a>`       : ''}
                    </div>
                </div>

                <!-- Right: Info -->
                <div class="profile-info-group">
                    <!-- Stats -->
                    <div class="info-card animate-fade-in">
                        <div class="info-card-title">Archive Stats</div>
                        <div class="info-row">
                            <span class="info-row-label">Total Machines Pwned</span>
                            <span class="info-row-value" style="color:var(--accent-color);">${total}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-row-label">Flags Captured</span>
                            <span class="info-row-value">${flags}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-row-label">Primary Focus</span>
                            <span class="info-row-value">${d.learningFocus || '—'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-row-label">Location</span>
                            <span class="info-row-value">${d.location || '—'}</span>
                        </div>
                    </div>

                    <!-- Platform Progress -->
                    <div class="info-card animate-fade-in" style="animation-delay:.08s">
                        <div class="info-card-title">Platform Progress</div>

                        ${this.buildProgressItem('HackTheBox', htb, total, 'var(--color-htb)')}
                        ${this.buildProgressItem('TryHackMe', thm, total, 'var(--color-thm)')}
                        ${this.buildProgressItem('PicoCTF', pico, total, 'var(--sys-blue)')}
                    </div>

                    <!-- Certifications -->
                    <div class="info-card animate-fade-in" style="animation-delay:.14s">
                        <div class="info-card-title">Certifications</div>
                        ${certHtml}
                    </div>

                    <!-- Achievements -->
                    <div class="info-card animate-fade-in" style="animation-delay:.20s">
                        <div class="info-card-title">Achievements</div>
                        <div class="achievements-grid">
                            ${achievements.map(a => `
                                <div class="achievement-badge">
                                    <div class="achievement-icon" style="background:${a.color}20; color:${a.color};">${a.icon}</div>
                                    <div class="achievement-info">
                                        <div class="achievement-title">${a.title}</div>
                                        <div class="achievement-desc">${a.desc}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    buildProgressItem(name, count, total, color) {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
            <div class="platform-progress-item">
                <div class="platform-progress-row">
                    <span class="platform-progress-name">${name}</span>
                    <span class="platform-progress-count">${count} / ${total}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${pct}%; background:${color};"></div>
                </div>
            </div>
        `;
    }

    calcAchievements(entries, profile) {
        const list = [];
        const total = entries.length;
        const htb   = entries.filter(e => e.platform?.toLowerCase().includes('hackthebox')).length;
        const thm   = entries.filter(e => e.platform?.toLowerCase().includes('tryhackme')).length;
        const linux = entries.filter(e => e.os?.toLowerCase() === 'linux').length;
        const hard  = entries.filter(e => ['hard', 'insane'].includes(e.difficulty?.toLowerCase())).length;

        if (total >= 1)   list.push({ icon: '&#9889;', title: 'First Blood', desc: 'First machine documented', color: 'var(--sys-red)' });
        if (total >= 5)   list.push({ icon: '&#128293;', title: 'Getting Warm', desc: '5 machines pwned', color: 'var(--sys-orange)' });
        if (total >= 10)  list.push({ icon: '&#127881;', title: 'Double Digits', desc: '10 machines pwned', color: 'var(--sys-purple)' });
        if (total >= 25)  list.push({ icon: '&#128081;', title: 'Elite Hacker', desc: '25 machines pwned', color: 'var(--sys-yellow)' });
        if (total >= 50)  list.push({ icon: '&#128584;', title: 'Legend', desc: '50 machines pwned', color: 'var(--accent-color)' });
        if (htb >= 5)     list.push({ icon: '&#128007;', title: 'HTB Veteran', desc: '5+ HackTheBox machines', color: 'var(--color-htb)' });
        if (thm >= 5)     list.push({ icon: '&#128163;', title: 'THM Explorer', desc: '5+ TryHackMe rooms', color: 'var(--color-thm)' });
        if (linux >= 5)   list.push({ icon: '&#128032;', title: 'Linux Master', desc: '5+ Linux machines', color: 'var(--sys-blue)' });
        if (hard >= 3)    list.push({ icon: '&#128171;', title: 'Pain Lover', desc: '3+ Hard/Insane machines', color: 'var(--sys-red)' });
        if (profile.certifications?.length > 0) {
            list.push({ icon: '&#127891;', title: 'Certified', desc: 'Holds certifications', color: 'var(--sys-green)' });
        }

        if (list.length === 0) {
            list.push({ icon: '&#128640;', title: 'Getting Started', desc: 'Begin your journey', color: 'var(--text-tertiary)' });
        }

        return list;
    }
}

window.ProfileManager = new Profile();