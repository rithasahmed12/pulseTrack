<script lang="ts">
	import type { TimePoint } from '@pulsetrack/shared-types';
	import { formatTooltipDate, hexAlpha } from './chart-utils';

	interface Props {
		series: TimePoint[];
		unitSuffix?: string;
		accent?: string;
		yTicks?: number;
		ariaLabel?: string;
	}

	let {
		series,
		unitSuffix = '',
		accent = '#7C3AED',
		yTicks = 4,
		ariaLabel = 'Line chart'
	}: Props = $props();

	const WIDTH = 800;
	const HEIGHT = 220;
	const PADDING = { l: 36, r: 12, t: 12, b: 24 };

	const componentId = $props.id();
	const gradId = `${componentId}-grad`;

	let hoverIdx = $state<number | null>(null);

	const projection = $derived.by(() => {
		if (series.length === 0) {
			return {
				points: [] as { x: number; y: number; raw: TimePoint }[],
				yMin: 0,
				yMax: 1,
				xStep: 0
			};
		}
		const ys = series.map((p) => p.value);
		let yMin = Math.min(...ys);
		let yMax = Math.max(...ys);
		const range = yMax - yMin || 1;
		yMin = yMin - range * 0.15;
		yMax = yMax + range * 0.15;
		const plotW = WIDTH - PADDING.l - PADDING.r;
		const plotH = HEIGHT - PADDING.t - PADDING.b;
		const xStep = series.length > 1 ? plotW / (series.length - 1) : 0;
		const points = series.map((p, i) => ({
			x: PADDING.l + i * xStep,
			y: PADDING.t + plotH - ((p.value - yMin) / (yMax - yMin)) * plotH,
			raw: p
		}));
		return { points, yMin, yMax, xStep };
	});

	const linePath = $derived(
		projection.points
			.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
			.join(' ')
	);

	const fillPath = $derived.by(() => {
		const pts = projection.points;
		if (pts.length === 0) return '';
		return (
			linePath +
			` L${pts[pts.length - 1].x},${HEIGHT - PADDING.b} L${PADDING.l},${HEIGHT - PADDING.b} Z`
		);
	});

	const tickValues = $derived(
		Array.from({ length: yTicks + 1 }, (_, i) => {
			const t = i / yTicks;
			return projection.yMin + (projection.yMax - projection.yMin) * (1 - t);
		})
	);

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

	const tooltipBox = $derived.by(() => {
		if (hoverIdx == null) return null;
		const pt = projection.points[hoverIdx];
		if (!pt) return null;
		const w = 132;
		const h = 36;
		const flip = pt.x > WIDTH - w - 12;
		const tx = flip ? pt.x - w - 10 : pt.x + 10;
		const ty = Math.max(8, pt.y - h - 8);
		return { tx, ty, w, h, pt };
	});
</script>

<div class="relative w-full">
	<svg
		viewBox="0 0 {WIDTH} {HEIGHT}"
		preserveAspectRatio="none"
		role="img"
		aria-label={ariaLabel}
		class="block h-[220px] w-full"
		onmousemove={handleMove}
		onmouseleave={() => (hoverIdx = null)}
	>
		<defs>
			<linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color={accent} stop-opacity="0.35" />
				<stop offset="100%" stop-color={accent} stop-opacity="0" />
			</linearGradient>
		</defs>

		{#each tickValues as v, i (i)}
			{@const y = PADDING.t + (i / yTicks) * (HEIGHT - PADDING.t - PADDING.b)}
			<line x1={PADDING.l} x2={WIDTH - PADDING.r} y1={y} y2={y} stroke="#1A1A24" stroke-width="1" />
			<text
				x={PADDING.l - 6}
				y={y + 3}
				text-anchor="end"
				font-size="9"
				fill="rgba(148,163,184,0.6)"
				font-family="ui-monospace, SFMono-Regular, monospace"
			>
				{v.toFixed(1)}{unitSuffix}
			</text>
		{/each}

		{#if fillPath}
			<path d={fillPath} fill="url(#{gradId})" />
		{/if}
		{#if linePath}
			<path
				d={linePath}
				fill="none"
				stroke={accent}
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
				style="filter: drop-shadow(0 0 6px {hexAlpha(accent, 0.55)})"
			/>
		{/if}

		{#if tooltipBox}
			{@const pt = tooltipBox.pt}
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
				<circle
					cx={pt.x}
					cy={pt.y}
					r="4"
					fill={accent}
					stroke="#0F0F18"
					stroke-width="1.5"
					style="filter: drop-shadow(0 0 6px {hexAlpha(accent, 0.7)})"
				/>
				<g pointer-events="none">
					<rect
						x={tooltipBox.tx}
						y={tooltipBox.ty}
						width={tooltipBox.w}
						height={tooltipBox.h}
						rx="6"
						ry="6"
						fill="rgba(15,15,24,0.95)"
						stroke="#252535"
						stroke-width="1"
					/>
					<circle cx={tooltipBox.tx + 10} cy={tooltipBox.ty + 14} r="3" fill={accent} />
					<text
						x={tooltipBox.tx + 18}
						y={tooltipBox.ty + 17}
						font-size="11"
						fill="#F1F5F9"
						font-family="ui-monospace, SFMono-Regular, monospace"
						font-weight="600"
					>
						{pt.raw.value.toFixed(2)}{unitSuffix}
					</text>
					<text
						x={tooltipBox.tx + 10}
						y={tooltipBox.ty + 28}
						font-size="9"
						fill="rgba(148,163,184,0.7)"
						font-family="ui-monospace, SFMono-Regular, monospace"
					>
						{formatTooltipDate(pt.raw.date)}
					</text>
				</g>
			</g>
		{/if}
	</svg>
</div>
