<script lang="ts">
	import { cn } from '$lib/utils'

	let {
		plays,
		winProbability,
		onPlayHover,
	}: {
		plays?: MLB.Plays
		winProbability?: MLB.PlayWinProbability[]
		onPlayHover?: (atBatIndex: number | null) => void
	} = $props()

	const wpByAtBatIndex = $derived(
		new Map((winProbability ?? []).map((wp) => [wp.about.atBatIndex, wp])),
	)
</script>

<div
	class="group/plays mx-ch h-[12lh] overflow-y-auto border border-stroke text-sm"
	role="group"
	onmouseleave={() => onPlayHover?.(null)}
>
	<fieldset
		class="sticky top-0 z-1 flex flex-wrap gap-x-ch border-b border-stroke px-ch py-[.5ch] backdrop-blur-xs"
	>
		<label>
			<input name="plays" type="radio" checked />
			All plays
		</label>

		<label>
			<input name="plays" value="scoring" type="radio" />
			Scoring
		</label>
	</fieldset>

	<ul class="px-ch py-[.5ch]">
		{#each plays?.allPlays as { about, result }}
			{@const wp = wpByAtBatIndex.get(about.atBatIndex)}
			<li
				class="flex anim-fade items-center gap-ch border-dashed border-stroke py-[.5ch] leading-tight not-first:border-t group-has-[[value='scoring']:checked]/plays:not-data-scoring:hidden group-not-has-[[value='scoring']:checked]/plays:data-scoring:positive group-not-has-[[value='scoring']:checked]/plays:data-scoring:dark:text-accent"
				data-scoring={about.isScoringPlay ? '' : undefined}
				onmouseenter={() => about.isScoringPlay && onPlayHover?.(about.atBatIndex)}
			>
				<p class="grow">{result.description}</p>

				{#if about.isScoringPlay && wp}
					{@const added = wp.homeTeamWinProbabilityAdded}
					<span
						class={cn(
							'ml-1 inline-block shrink-0 px-[.5ch] text-xs font-medium tabular-nums',
							added >= 0
								? 'bg-accent/15 positive dark:bg-accent/25'
								: 'bg-red-500/15 negative dark:bg-red-500/25',
						)}
					>
						{added >= 0 ? '+' : ''}{added.toFixed(1)}%
					</span>
				{/if}
			</li>
		{/each}
	</ul>
</div>
