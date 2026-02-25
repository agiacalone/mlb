<script lang="ts">
	import { colorSchemeStore } from '$ui/store.svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	let {
		winProbability,
		boxscore,
		linescore,
		hoveredAtBatIndex,
		class: className,
	}: {
		winProbability: MLB.PlayWinProbability[]
		boxscore?: MLB.Boxscore
		linescore?: MLB.Linescore
		hoveredAtBatIndex?: number | null
	} & HTMLAttributes<HTMLElement> = $props()

	let width = $state(0)
	let height = $state(150)
	const padding = 2

	const maxInningInData = $derived(
		winProbability.reduce((max, d) => Math.max(max, d.about?.inning ?? 0), 0),
	)
	const scheduledInnings = $derived(linescore?.scheduledInnings ?? 9)
	const innings = $derived(Math.max(maxInningInData, scheduledInnings))

	// Compute inning layout with minimum widths
	const inningLayout = $derived(() => {
		// Count data points per inning
		const pointsPerInning = new Array(innings).fill(0) as number[]
		winProbability.forEach((d) => {
			const inning = (d.about?.inning ?? 1) - 1
			if (inning < innings) pointsPerInning[inning]++
		})

		// Assign widths: proportional to data points, but at least 6 plays worth
		const rawWidths = pointsPerInning.map((count) => Math.max(count, 6))
		const totalRaw = rawWidths.reduce((a, b) => a + b, 0)
		const inningWidths = rawWidths.map((w) => (w / totalRaw) * width)

		// Cumulative start positions
		const startXs = [0]
		for (let i = 0; i < innings; i++) {
			startXs.push(startXs[i] + inningWidths[i])
		}

		// Find half-inning start indices
		const halfInningStarts = new Map<string, number>()
		winProbability.forEach((d, i) => {
			const inning = d.about?.inning ?? 1
			const half = d.about?.isTopInning ? 'top' : 'bot'
			const key = `${inning}-${half}`
			if (!halfInningStarts.has(key)) {
				halfInningStarts.set(key, i)
			}
		})

		return { inningWidths, startXs, pointsPerInning, halfInningStarts }
	})

	// Map data point index to x position within its inning's allocated space
	function dataIndexToX(index: number) {
		const { startXs, pointsPerInning, inningWidths } = inningLayout()
		const d = winProbability[index]
		const inning = (d.about?.inning ?? 1) - 1

		// Find index within this inning
		let inningStartIndex = 0
		for (let i = 0; i < index; i++) {
			if ((winProbability[i].about?.inning ?? 1) - 1 === inning) continue
			if ((winProbability[i].about?.inning ?? 1) - 1 < inning) inningStartIndex = i + 1
		}
		// Count from the first point of this inning
		let firstInThisInning = index
		for (let i = index; i >= 0; i--) {
			if ((winProbability[i].about?.inning ?? 1) - 1 === inning) firstInThisInning = i
			else break
		}
		const indexInInning = index - firstInThisInning
		const count = pointsPerInning[inning]
		const t = (indexInInning + 0.5) / Math.max(count, 1)

		return startXs[inning] + t * inningWidths[inning]
	}

	const pathData = $derived(() => {
		const points = winProbability.map((d, i) => ({
			x: dataIndexToX(i),
			y: (d.homeTeamWinProbability / 100) * height,
		}))

		if (points.length < 2) return ''

		// Generate smooth curve using Catmull-Rom to Bezier conversion
		let d = `M ${points[0].x},${points[0].y}`

		for (let i = 0; i < points.length - 1; i++) {
			const p0 = points[i - 1] ?? points[i]
			const p1 = points[i]
			const p2 = points[i + 1]
			const p3 = points[i + 2] ?? p2

			const tension = 6
			const cp1x = p1.x + (p2.x - p0.x) / tension
			const cp1y = p1.y + (p2.y - p0.y) / tension
			const cp2x = p2.x - (p3.x - p1.x) / tension
			const cp2y = p2.y - (p3.y - p1.y) / tension

			d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
		}

		return d
	})

	const hoveredDataIndex = $derived(
		hoveredAtBatIndex != null
			? winProbability.findIndex((d) => d.about.atBatIndex === hoveredAtBatIndex)
			: -1,
	)

	const highlightPathData = $derived(() => {
		if (hoveredDataIndex < 1) return ''

		const points = winProbability.map((d, i) => ({
			x: dataIndexToX(i),
			y: (d.homeTeamWinProbability / 100) * height,
		}))

		const i = hoveredDataIndex
		const p0 = points[i - 2] ?? points[i - 1]
		const p1 = points[i - 1]
		const p2 = points[i]
		const p3 = points[i + 1] ?? points[i]

		const tension = 6
		const cp1x = p1.x + (p2.x - p0.x) / tension
		const cp1y = p1.y + (p2.y - p0.y) / tension
		const cp2x = p2.x - (p3.x - p1.x) / tension
		const cp2y = p2.y - (p3.y - p1.y) / tension

		return `M ${p1.x},${p1.y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
	})

	const inningDividers = $derived(() => {
		const { startXs, halfInningStarts } = inningLayout()
		const result = []

		for (let i = 0; i < innings; i++) {
			const inningNum = i + 1
			const startX = startXs[i]
			const endX = startXs[i + 1]

			const botStartIndex = halfInningStarts.get(`${inningNum}-bot`)
			const midX = botStartIndex !== undefined ? dataIndexToX(botStartIndex) : undefined

			const centerX = (startX + endX) / 2

			result.push({ num: inningNum, startX, midX, endX, centerX })
		}
		return result
	})
</script>

<figure class="grid px-ch *:col-span-full *:row-span-full {className}" bind:clientWidth={width}>
	<figcaption
		class="mr-auto grid grid-cols-2 text-center text-[xx-small] text-current/25 uppercase sm:text-xs"
		style:writing-mode="vertical-rl"
	>
		<span>{boxscore?.teams.away.team.abbreviation ?? 'Away'}</span>
		<span>{boxscore?.teams.home.team.abbreviation ?? 'Home'}</span>
	</figcaption>

	<svg class="w-full grow" viewBox="0 {-padding} {width} {height + padding * 2}">
		{#each inningDividers() as inning, i (inning.num)}
			{#if i > 0}
				<line
					class="stroke-current/25"
					x1={inning.startX}
					y1={0}
					x2={inning.startX}
					y2={height}
					stroke-width="0.5"
				/>
			{/if}

			{#if inning.midX !== undefined}
				<line
					class="stroke-current/15"
					x1={inning.midX}
					y1={height * 0.2}
					x2={inning.midX}
					y2={height}
					stroke-width="1"
					stroke-dasharray="4,4"
				/>
			{/if}

			<text class="fill-current/25" x={inning.centerX} y={12} text-anchor="middle" font-size="16">
				{inning.num}
			</text>
		{/each}

		<line
			class="stroke-current/25"
			x1={0}
			y1={height / 2}
			x2={width}
			y2={height / 2}
			stroke-width="0.5"
			stroke-dasharray="4,4"
		/>

		<path
			d={pathData()}
			fill="none"
			stroke="var(--color-accent,currentColor)"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		{#if highlightPathData()}
			<path
				d={highlightPathData()}
				fill="none"
				stroke={colorSchemeStore.colorScheme === 'dark' ? 'currentColor' : 'var(--color-green-500)'}
				stroke-width="4"
				stroke-linecap="round"
				stroke-linejoin="round"
				opacity="0.85"
			/>
		{/if}
	</svg>
</figure>
