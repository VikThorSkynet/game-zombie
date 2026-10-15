// Original vector artwork; no textures or external fonts needed by file://.
const hudSvg = (body, viewBox = '0 0 32 38', className = 'hud-emblem') =>
    `<svg class="${className}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

export function roundGlyph(value) {
    const round = Math.max(1, Math.min(9999, Math.trunc(value) || 1));
    if (round > 10) return hudSvg(`<text x="2" y="52" fill="currentColor" font-family="Impact,Arial Narrow,serif" font-size="57" font-style="italic">${round}</text>`, `0 0 ${String(round).length * 32 + 5} 60`, 'round-glyph');
    let marks = '';
    for (let group = 0; group < Math.ceil(round / 5); group++) {
        const count = Math.min(5, round - group * 5), offset = group * 57;
        for (let mark = 0; mark < Math.min(4, count); mark++) {
            const x = offset + 7 + mark * 11;
            marks += `<path d="M${x} 5 ${x+4} 2 ${x+2} 22 ${x+4} 49 ${x} 57 ${x-2} 36 ${x-1} 19Z"/>`;
        }
        if (count === 5) marks += `<path d="m${offset+1} 42 48-28-3 7-45 28Z"/>`;
    }
    return hudSvg(`<g fill="currentColor">${marks}</g>`, `0 0 ${round > 5 ? 110 : 54} 60`, 'round-glyph');
}

export function hudEmblem(kind, color = 'none') {
    const icons = {
        health: '<path d="M13 10h6v6h6v6h-6v6h-6v-6H7v-6h6Z" fill="currentColor" stroke="none"/>',
        speed: '<path d="m7 13 7 6-7 6m10-12 7 6-7 6"/>',
        damage: '<path d="M11 10v17m10-17v17M8 10h6M18 10h6M8 27h6m4 0h6"/>',
        move: '<path d="m9 27 14-16m-11 0h11v11M8 18l5-6"/>',
        insta_kill: '<path d="M8 20v-5a8 8 0 0 1 16 0v5l-4 3v6h-8v-6Z"/><path d="M12 16h1m6 0h1m-5 5h2m-1 3v5"/>',
        double_points: '<text x="16" y="25" text-anchor="middle" fill="currentColor" stroke="none" font-family="Arial,sans-serif" font-size="17" font-weight="800">2×</text>',
        fire_sale: '<path d="M8 11h10l7 8-10 11-9-10Z"/><circle cx="12" cy="16" r="1.2"/><path d="m15 23 5-5"/>'
    };
    return hudSvg(`<path d="M2 3 16 1l14 2v21L16 36 2 24Z" fill="${color}" stroke="currentColor" stroke-width="1.5"/><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${icons[kind] || icons.health}</g>`);
}
