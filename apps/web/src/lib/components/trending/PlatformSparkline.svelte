<script lang="ts">
	import type { PlatformSeriesPoint } from '@pulsetrack/shared-types';

	interface Props {
		series: PlatformSeriesPoint[];
		accent: string;
		accentSecondary: string;
	}

	let { series, accent, accentSecondary }: Props = $props();

	const WIDTH = 320;
	const HEIGHT = 56;
	const PADDING = { l: 0, r: 0, t: 4, b: 12 };

	const componentId = $props.id();
	const gradId = `${componentId}-fill`;
	const lineGradId = `${componentId}-line`;

	const points = $derived.by(() => {
		if (series.length === 0) return [] as { x: number; y: number; raw: PlatformSeriesPoint }[];
		const ys = series.map((p) => p.value);
		let yMin = Math.min(...ys);
		let yMax = Math.max(...ys);
		const range = yMax - yMin || 1;
		yMin = yMin - range * 0.1;
		yMax = yMax + range * 0.25;
		const plotW = WIDTH - PADDING.l - PADDING.r;
		const plotH = HEIGHT - PADDING.t - PADDING.b;
		const xStep = series.length > 1 ? plotW / (series.length - 1) : 0;
		return series.map((p, i) => ({
			x: PADDING.l + i * xStep,
			y: PADDING.t + plotH - ((p.value - yMin) / (yMax - yMin)) * plotH,
			raw: p
		}));
	});

	const linePath = $derived(
		points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')
	);
	const fillPath = $derived.by(() => {
		if (points.length === 0) return '';
		const last = points[points.length - 1];
		return `${linePath} L${last.x},${HEIGHT - PADDING.b} L${PADDING.l},${HEIGHT - PADDING.b} Z`;
	});
</script>

<svg viewBox="0 0 {WIDTH} {HEIGHT}" preserveAspectRatio="none" class="block h-[56px] w-full">
	<defs>
		<linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color={accent} stop-opacity="0.35" />
			<stop offset="100%" stop-color={accent} stop-opacity="0" />
		</linearGradient>
		<linearGradient id={lineGradId} x1="0" y1="0" x2="1" y2="0">
			<stop offset="0%" stop-color={accent} />
			<stop offset="100%" stop-color={accentSecondary} />
		</linearGradient>
	</defs>

	{#if fillPath}
		<path d={fillPath} fill="url(#{gradId})" />
	{/if}
	{#if linePath}
		<path
			d={linePath}
			fill="none"
			stroke="url(#{lineGradId})"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
			style="filter: drop-shadow(0 0 6px {accent}88)"
		/>
	{/if}

	{#if points.length > 0}
		{@const last = points[points.length - 1]}
		<circle
			cx={last.x - 1}
			cy={last.y}
			r="3"
			fill={accent}
			stroke="#0F0F18"
			stroke-width="1.5"
			style="filter: drop-shadow(0 0 6px {accent})"
		/>
	{/if}

	{#each points as p, i (i)}
		<text
			x={p.x}
			y={HEIGHT - 2}
			text-anchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
			font-size="8"
			fill="rgba(148,163,184,0.5)"
			font-family="ui-monospace, SFMono-Regular, monospace"
		>
			{p.raw.day.slice(5)}
		</text>
	{/each}
</svg>
