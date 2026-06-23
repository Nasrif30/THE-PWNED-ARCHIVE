class MarkdownParser {
    constructor() {
        this.containerId = 'entry-content';
    }

    async loadEntry(slug) {
        window.UI.showLoading(this.containerId);
        
        try {
            // Fetch metadata JSON for this specific entry
            const jsonRes = await fetch(`entries/${slug}.json`);
            if (!jsonRes.ok) throw new Error("Metadata missing.");
            const metadata = await jsonRes.json();

            // Fetch markdown content
            const mdRes = await fetch(metadata.writeup);
            if (!mdRes.ok) throw new Error("Writeup missing.");
            const mdText = await mdRes.text();

            this.render(metadata, mdText);

            // Pass screenshots to gallery
            if (window.GalleryManager && metadata.screenshots) {
                window.GalleryManager.init(metadata.screenshots);
            }

        } catch (error) {
            console.error("Writeup Error:", error);
            window.UI.showError(this.containerId, `Failed to decrypt writeup: ${error.message}`);
        }
    }

    render(metadata, mdText) {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Convert Markdown to HTML using Regex
        let html = mdText
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Code blocks
            .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            // Bold
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            // Images
            .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' loading='lazy' />")
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank' style='color: var(--accent-color); text-decoration: underline;'>$1</a>")
            // Unordered Lists
            .replace(/^\s*\n\*/gm, '<ul>\n*')
            .replace(/^(\* .*)\n([^\*])/gm, '$1\n</ul>\n$2')
            .replace(/^\* (.*)/gm, '<li>$1</li>')
            // Tables (Basic support)
            .replace(/\|(.+)\|/gim, '<tr><td>$1</td></tr>')
            .replace(/<tr><td>---.*?<\/td><\/tr>/gim, '') // Remove table separator
            // Paragraphs
            .replace(/^\s*(\n)?(.+)/gim, function(m) {
                return  /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img|tr|td)/.test(m) ? m : '<p>'+m+'</p>';
            });

        // Prepend Machine Metadata Header
        const headerHTML = `
            <div style="margin-bottom: var(--spacing-xl); padding-bottom: var(--spacing-md); border-bottom: 2px solid var(--border-color);">
                <h1 style="font-family: var(--font-mono); color: var(--accent-color); font-size: clamp(1.5rem, 8vw, 2.5rem); margin-bottom: var(--spacing-sm); word-break: break-word; overflow-wrap: break-word; line-height: 1.2;">${metadata.title}</h1>
                <div class="tag-container" style="margin-bottom: var(--spacing-sm);">
                    <span class="tag platform">${metadata.platform}</span>
                    <span class="tag difficulty-${metadata.difficulty.toLowerCase()}">${metadata.difficulty}</span>
                    <span class="tag">OS: ${metadata.os}</span>
                    <span class="tag">Flags: ${metadata.flags}</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Compromised on: ${metadata.date}</p>
            </div>
        `;

        container.innerHTML = headerHTML + html;
    }
}

window.MarkdownManager = new MarkdownParser();