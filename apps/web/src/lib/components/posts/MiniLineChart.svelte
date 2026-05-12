<script lang="ts">
	import type { EngagementPoint } from '@pulsetrack/shared-types';

	interface Props {
		series: EngagementPoint[];
	}

	let { series }: Props = $props();

	const WIDTH = 360;
	const HEIGHT = 100;
	const PADDING = { l: 4, r: 4, t: 8, b: 14 };

	const componentId = $props.id();
	const gradId = `${componentId}-mini`;

	let hoverIdx = $state<number | null>(null);

	const projection = $derived.by(() => {
		if (series.length === 0) {
			return { points: [] as { x: number; y: number; raw: EngagementPoint }[], xStep: 0 };
		}
		const ys = series.map((p) => p.value);
		let yMin = Math.min(...ys);
		let yMax = Math.max(...ys);
		const range = yMax - yMin || 1;
		yMin = yMin - range * 0.15;
		yMax = yMax + range * 0.2;
		const plotW = WIDTH - PADDING.l - PADDING.r;
		const plotH = HEIGHT - PADDING.t - PADDING.b;
		const xStep = series.length > 1 ? plotW / (series.length - 1) : 0;
		const points = series.map((p, i) => ({
			x: PADDING.l + i * xStep,
			y: PADDING.t + plotH - ((p.value - yMin) / (yMax - yMin)) * plotH,
			raw: p
		}));
		return { points, xStep };
	});

	const linePath = $derived(
		projection.points
			.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
			.join(' ')
	);
	const fillPath = $derived.by(() => {
		const pts = projection.points;
		if (pts.length === 0) return '';
		return `${linePath} L${pts[pts.length - 1].x},${HEIGHT - PADDING.b} L${PADDING.l},${HEIGHT - PADDING.b} Z`;
	});

	function handleMove(e: MouseEvent & { currentTarget: SVGSVGElement }) {
		if (series.length === 0 || projection.xStep === 0) {
			hoverIdx = null;
			return;
		}
		const rect = e.currentTarget.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * WIDTH - PADDING.l;
		const idx = Math.round(x / Math.max(1, projection.xStep));
		hoverIdx = Math.max(0, Math.min(series.length - 1, idx));
	}
</script>

<svg
	viewBox="0 0 {WIDTH} {HEIGHT}"
	preserveAspectRatio="none"
	class="block h-[100px] w-full"
	onmousemove={handleMove}
	onmouseleave={() => (hoverIdx = null)}
	role="img"
	aria-label="Engagement over the first 7 days"
>
	<defs>
		<linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="#7C3AED" stop-opacity="0.4" />
			<stop offset="100%" stop-color="#7C3AED" stop-opacity="0" />
		</linearGradient>
	</defs>

	{#if fillPath}
		<path d={fillPath} fill="url(#{gradId})" />
	{/if}
	{#if linePath}
		<path
			d={linePath}
			fill="none"
			stroke="#7C3AED"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
			style="filter: drop-shadow(0 0 6px rgba(124,58,237,0.5))"
		/>
	{/if}

	{#each projection.points as p, i (i)}
		<text
			x={p.x}
			y={HEIGHT - 3}
			text-anchor="middle"
			font-size="8"
			fill="rgba(148,163,184,0.55)"
			font-family="ui-monospace, SFMono-Regular, monospace"
		>
			d{i + 1}
		</text>
	{/each}

	{#if hoverIdx != null && projection.points[hoverIdx]}
		{@const pt = projection.points[hoverIdx]}
		<g>
			<line
				x1={pt.x}
				x2={pt.x}
				y1={PADDING.t}
				y2={HEIGHT - PADDING.b}
				stroke="rgba(241,245,249,0.18)"
				stroke-width="1"
				stroke-dasharray="2 2"
			/>
			<circle cx={pt.x} cy={pt.y} r="3.5" fill="#7C3AED" stroke="#0F0F18" stroke-width="1.5" />
			<text
				x={pt.x}
				y={pt.y - 8}
				text-anchor="middle"
				font-size="10"
				fill="#F1F5F9"
				font-family="ui-monospace, SFMono-Regular, monospace"
				font-weight="600"
			>
				{pt.raw.value.toFixed(2)}%
			</text>
		</g>
	{/if}
</svg>
