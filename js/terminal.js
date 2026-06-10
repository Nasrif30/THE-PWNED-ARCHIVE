/* ===================================================
   TERMINAL.JS — macOS-style collapsible terminal
   =================================================== */

class Terminal {
    constructor() {
        this.container  = document.getElementById('terminal');
        this.toggleBtn  = document.getElementById('terminal-toggle');
        this.closeBtn   = document.getElementById('terminal-close-btn');
        this.input      = document.getElementById('terminal-input');
        this.output     = document.getElementById('terminal-output');
        this.entries    = [];
        this.history    = [];
        this.histIdx    = -1;

        this.bindEvents();
        this.bindNavButton();
    }

    setEntries(data) {
        this.entries = data;
    }

    bindNavButton() {
        // Sidebar terminal button
        const navBtn = document.getElementById('terminal-nav-btn');
        if (navBtn) {
            navBtn.addEventListener('click', () => this.toggle());
        }
    }

    bindEvents() {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', (e) => {
                if (e.target === this.closeBtn || this.closeBtn?.contains(e.target)) return;
                this.toggle();
            });
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = this.input.value.trim();
                    this.execute(cmd);
                    if (cmd) {
                        this.history.unshift(cmd);
                        if (this.history.length > 50) this.history.pop();
                    }
                    this.histIdx = -1;
                    this.input.value = '';
                }

                // Command history navigation
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.histIdx = Math.min(this.histIdx + 1, this.history.length - 1);
                    this.input.value = this.history[this.histIdx] || '';
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.histIdx = Math.max(this.histIdx - 1, -1);
                    this.input.value = this.histIdx >= 0 ? this.history[this.histIdx] : '';
                }
            });
        }

        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.container && !this.container.classList.contains('closed')) {
                this.close();
            }
        });
    }

    toggle() {
        if (!this.container) return;
        this.container.classList.toggle('closed');
        if (!this.container.classList.contains('closed') && this.input) {
            setTimeout(() => this.input.focus(), 150);
        }
    }

    close() {
        if (this.container) this.container.classList.add('closed');
    }

    print(html, type = 'normal') {
        if (!this.output) return;
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = html;
        if (type === 'error')   line.style.color = '#ff453a';
        if (type === 'success') line.style.color = '#00ff9d';
        if (type === 'info')    line.style.color = '#64d2ff';
        if (type === 'warn')    line.style.color = '#ffd60a';
        this.output.appendChild(line);
        this.output.parentElement.scrollTop = this.output.parentElement.scrollHeight;
    }

    execute(cmd) {
        this.print(`<span style="color:var(--accent-color); font-weight:600;">user@pwned-archive:~$</span> ${this.escHtml(cmd)}`);

        if (!cmd) return;

        const parts  = cmd.toLowerCase().split(' ');
        const base   = parts[0];
        const args   = parts.slice(1);

        switch (base) {
            case 'help':
                this.print(`
                    <span style="color:var(--sys-teal)">Available commands:</span><br>
                    &nbsp; <b>whoami</b>       — Operator info<br>
                    &nbsp; <b>stats</b>        — Archive statistics<br>
                    &nbsp; <b>latest</b>       — Most recent entry<br>
                    &nbsp; <b>ls</b>           — List all entries<br>
                    &nbsp; <b>grep</b> [term]  — Search entries<br>
                    &nbsp; <b>achievements</b> — Unlock status<br>
                    &nbsp; <b>archive</b>      — Navigate to archive<br>
                    &nbsp; <b>clear</b>        — Clear terminal<br>
                    &nbsp; <b>exit</b>         — Close terminal
                `, 'info');
                break;

            case 'whoami':
                const p = window.ProfileManager?.profileData;
                this.print(`
                    Operator: <b>${p?.name || 'Unknown'}</b><br>
                    Handle:   <span style="color:var(--accent-color)">${p?.handle || '?'}</span><br>
                    Focus:    ${p?.learningFocus || '?'}<br>
                    Bio:      ${p?.bio || '?'}
                `);
                break;

            case 'stats':
                if (this.entries.length === 0) {
                    this.print('No entries loaded.', 'warn');
                } else {
                    const total  = this.entries.length;
                    const flags  = this.entries.reduce((s, e) => s + (e.flags || 0), 0);
                    const htb    = this.entries.filter(e => e.platform?.toLowerCase().includes('hackthebox')).length;
                    const thm    = this.entries.filter(e => e.platform?.toLowerCase().includes('tryhackme')).length;
                    this.print(`
                        <span style="color:var(--sys-green)">Archive Statistics</span><br>
                        Total Pwned: <b>${total}</b><br>
                        Flags:       <b>${flags}</b><br>
                        HackTheBox:  <b>${htb}</b> | TryHackMe: <b>${thm}</b>
                    `, 'success');
                }
                break;

            case 'latest':
                if (this.entries.length > 0) {
                    const e = this.entries[0];
                    this.print(`
                        <span style="color:var(--accent-color)">Latest Target:</span><br>
                        Title:    <b>${e.title}</b><br>
                        Platform: ${e.platform} | Difficulty: ${e.difficulty}<br>
                        Date:     ${e.date}
                    `, 'success');
                } else {
                    this.print('No entries available.', 'warn');
                }
                break;

            case 'ls':
                if (this.entries.length === 0) {
                    this.print('No entries.', 'warn');
                } else {
                    const lines = this.entries.map(e =>
                        `<span style="color:var(--accent-color)">${e.slug}</span>  <span style="color:var(--text-tertiary)">${e.platform}</span>`
                    ).join('<br>');
                    this.print(lines);
                }
                break;

            case 'grep':
                if (!args[0]) {
                    this.print('Usage: grep [search term]', 'warn');
                } else {
                    const term    = args.join(' ');
                    const results = this.entries.filter(e =>
                        e.title?.toLowerCase().includes(term) ||
                        (e.tags || []).some(t => t.toLowerCase().includes(term))
                    );
                    if (results.length === 0) {
                        this.print(`No results for "${term}"`, 'error');
                    } else {
                        this.print(results.map(e =>
                            `<span style="color:var(--accent-color)">${e.title}</span> — ${e.platform}`
                        ).join('<br>'), 'success');
                    }
                }
                break;

            case 'achievements':
                if (this.entries.length === 0) {
                    this.print('No data. Load archive first.', 'warn');
                } else {
                    this.print(`
                        <span style="color:var(--sys-yellow)">Achievements</span><br>
                        First Blood:  ${this.entries.length >= 1  ? '<span style="color:#30d158">UNLOCKED</span>' : 'locked'}<br>
                        10 Machines:  ${this.entries.length >= 10 ? '<span style="color:#30d158">UNLOCKED</span>' : 'locked'}<br>
                        25 Machines:  ${this.entries.length >= 25 ? '<span style="color:#30d158">UNLOCKED</span>' : 'locked'}<br>
                        50 Machines:  ${this.entries.length >= 50 ? '<span style="color:#30d158">UNLOCKED</span>' : 'locked'}
                    `);
                }
                break;

            case 'archive':
                window.location.hash = '#archive';
                this.print('Navigating to archive...', 'info');
                break;

            case 'clear':
                this.output.innerHTML = '';
                break;

            case 'exit':
                this.close();
                break;

            default:
                this.print(`bash: ${this.escHtml(cmd)}: command not found<br>Type <span style="color:var(--accent-color)">help</span> for available commands.`, 'error');
        }
    }

    escHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.TerminalManager = new Terminal();
});