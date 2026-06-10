/* ===================================================
   CHARTS.JS — Canvas API charts (no libraries)
   Apple-style donut + animated bar charts
   =================================================== */

window.ChartRenderer = (() => {
    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

    function getTextColor()   { return isDark() ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.50)'; }
    function getGridColor()   { return isDark() ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'; }
    function getBgColor()     { return isDark() ? '#111113' : '#f2f2f7'; }

    /* ------------------------------------------------
       DONUT CHART
    ------------------------------------------------ */
    function donut(canvasId, dataObj, colors) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const entries = Object.entries(dataObj);
        if (entries.length === 0) return;

        const total  = entries.reduce((s, [, v]) => s + v, 0);
        const ctx    = canvas.getContext('2d');
        const dpr    = window.devicePixelRatio || 1;
        const W      = canvas.offsetWidth  || 280;
        const H      = parseInt(canvas.getAttribute('height')) || 220;

        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.scale(dpr, dpr);

        const cx      = W / 2 - 50;   // shift left for legend
        const cy      = H / 2;
        const radius  = Math.min(cx, cy) * 0.72;
        const inner   = radius * 0.58;
        const gap     = 0.025;

        let startAngle = -Math.PI / 2;

        entries.forEach(([label, value], i) => {
            const slice = (value / total) * (Math.PI * 2 - gap * entries.length);
            const color = colors[i % colors.length];
            const end   = startAngle + slice;
            const mid   = startAngle + slice / 2;

            // Arc
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle + gap / 2, end - gap / 2);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Inner hole
            ctx.beginPath();
            ctx.arc(cx, cy, inner, 0, Math.PI * 2);
            ctx.fillStyle = getBgColor();
            ctx.fill();

            startAngle = end;
        });

        // Center text
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle    = isDark() ? '#ffffff' : '#000000';
        ctx.font         = `700 ${Math.round(radius * 0.38)}px -apple-system, BlinkMacSystemFont, Inter, sans-serif`;
        ctx.fillText(total, cx, cy - radius * 0.06);
        ctx.font         = `500 ${Math.round(radius * 0.22)}px -apple-system, BlinkMacSystemFont, Inter, sans-serif`;
        ctx.fillStyle    = getTextColor();
        ctx.fillText('total', cx, cy + radius * 0.20);

        // Legend (right side)
        const legendX = W / 2 + 20;
        const lineH   = Math.min(22, (H - 20) / entries.length);
        const startY  = cy - (entries.length * lineH) / 2 + lineH / 2;

        entries.forEach(([label, value], i) => {
            const y     = startY + i * lineH;
            const color = colors[i % colors.length];
            const pct   = Math.round((value / total) * 100);

            // Dot
            ctx.beginPath();
            ctx.arc(legendX + 5, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Label
            ctx.textAlign    = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle    = isDark() ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)';
            ctx.font         = `500 11px -apple-system, BlinkMacSystemFont, Inter, sans-serif`;
            ctx.fillText(label, legendX + 16, y);

            // Value
            ctx.textAlign  = 'right';
            ctx.fillStyle  = getTextColor();
            ctx.fillText(`${value} (${pct}%)`, W - 4, y);
        });
    }

    /* ------------------------------------------------
       ANIMATED BAR CHART
    ------------------------------------------------ */
    function bar(canvasId, labels, values) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        if (!values || values.length === 0) return;

        const ctx  = canvas.getContext('2d');
        const dpr  = window.devicePixelRatio || 1;
        const W    = canvas.offsetWidth  || 500;
        const H    = parseInt(canvas.getAttribute('height')) || 180;

        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.scale(dpr, dpr);

        const padTop   = 16;
        const padBot   = 36;
        const padLeft  = 32;
        const padRight = 12;
        const plotW    = W - padLeft - padRight;
        const plotH    = H - padTop - padBot;

        const max      = Math.max(...values, 1);
        const barW     = (plotW / labels.length) * 0.55;
        const barGap   = plotW / labels.length;
        const accentHex = isDark() ? '#00ff9d' : '#1d9e75';

        // Grid lines
        const gridLines = 4;
        for (let g = 0; g <= gridLines; g++) {
            const y = padTop + plotH - (g / gridLines) * plotH;
            ctx.beginPath();
            ctx.strokeStyle = getGridColor();
            ctx.lineWidth   = 1;
            ctx.setLineDash([4, 4]);
            ctx.moveTo(padLeft, y);
            ctx.lineTo(W - padRight, y);
            ctx.stroke();

            // Y label
            ctx.setLineDash([]);
            ctx.fillStyle    = getTextColor();
            ctx.font         = `500 10px -apple-system, BlinkMacSystemFont, Inter, sans-serif`;
            ctx.textAlign    = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(Math.round((g / gridLines) * max), padLeft - 4, y);
        }

        // Animate bars
        let frame = 0;
        const FRAMES = 40;

        function draw(progress) {
            // Clear plot area
            ctx.clearRect(padLeft, padTop, plotW, plotH + 2);

            // Redraw grid
            for (let g = 0; g <= gridLines; g++) {
                const y = padTop + plotH - (g / gridLines) * plotH;
                ctx.beginPath();
                ctx.strokeStyle = getGridColor();
                ctx.lineWidth   = 1;
                ctx.setLineDash([4, 4]);
                ctx.moveTo(padLeft, y);
                ctx.lineTo(W - padRight, y);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            labels.forEach((label, i) => {
                const v        = values[i];
                const barH     = (v / max) * plotH * progress;
                const x        = padLeft + i * barGap + (barGap - barW) / 2;
                const y        = padTop + plotH - barH;
                const radius   = Math.min(6, barW / 2);

                // Bar with rounded top corners
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + barW - radius, y);
                ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
                ctx.lineTo(x + barW, y + barH);
                ctx.lineTo(x, y + barH);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();

                // Gradient fill
                const grad = ctx.createLinearGradient(x, y, x, y + barH);
                grad.addColorStop(0, accentHex);
                grad.addColorStop(1, accentHex + '55');
                ctx.fillStyle = grad;
                ctx.fill();

                // Value label on top
                if (progress === 1 && v > 0) {
                    ctx.fillStyle    = isDark() ? '#ffffff' : '#000000';
                    ctx.font         = `700 10px -apple-system, BlinkMacSystemFont, Inter, sans-serif`;
                    ctx.textAlign    = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(v, x + barW / 2, y - 3);
                }

                // X label
                ctx.fillStyle    = getTextColor();
                ctx.font         = `500 9px -apple-system, BlinkMacSystemFont, Inter, sans-serif`;
                ctx.textAlign    = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(label, x + barW / 2, padTop + plotH + 6);
            });
        }

        function animate() {
            frame++;
            const t = frame / FRAMES;
            // Ease out cubic
            const progress = 1 - Math.pow(1 - Math.min(t, 1), 3);
            draw(progress);
            if (frame < FRAMES) requestAnimationFrame(animate);
        }

        animate();
    }

    return { donut, bar };
})();
