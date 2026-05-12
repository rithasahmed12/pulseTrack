export function hexAlpha(hex: string, alpha: number): string {
	const m = hex.replace('#', '');
	const r = parseInt(m.substring(0, 2), 16);
	const g = parseInt(m.substring(2, 4), 16);
	const b = parseInt(m.substring(4, 6), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

export function formatCount(n: number): string {
	if (n >= 1_000_000)
		return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '') + 'M';
	if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '') + 'K';
	return n.toFixed(0);
}

export function formatTooltipDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function buildSmoothPath(points: { x: number; y: number }[]): string {
	if (points.length === 0) return '';
	if (points.length === 1) return `M${points[0].x},${points[0].y}`;
	let d = `M${points[0].x},${points[0].y}`;
	for (let i = 0; i < points.length - 1; i += 1) {
		const p0 = points[i - 1] ?? points[i];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = points[i + 2] ?? p2;
		const cp1x = p1.x + (p2.x - p0.x) / 6;
		const cp1y = p1.y + (p2.y - p0.y) / 6;
		const cp2x = p2.x - (p3.x - p1.x) / 6;
		const cp2y = p2.y - (p3.y - p1.y) / 6;
		d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
	}
	return d;
}
