<script lang="ts">
	import { cn } from '$lib/utils'
	import Empty from '$ui/empty.svelte'
	import BaseRunners from './base-runners.svelte'
	import Outs from './outs.svelte'

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

	function ordinal(n: number) {
		const s = ['th', 'st', 'nd', 'rd']
		const v = n % 100
		return n + (s[(v - 20) % 10] || s[v] || s[0])
	}

	const groupedPlays = $derived.by(() => {
		const groups: {
			label: string
			key: string
			hasScoring: boolean
			plays: NonNullable<MLB.Plays['allPlays']>
		}[] = []

		for (const play of plays?.allPlays ?? []) {
			const { inning, isTopInning } = play.about
			const key = `${isTopInning ? 'top' : 'bot'}-${inning}`
			const half = isTopInning ? 'Top' : 'Bottom'
			const label = `${half} ${ordinal(inning)}`

			let group = groups.find((g) => g.key === key)
			if (!group) {
				group = { label, key, hasScoring: false, plays: [] }
				groups.push(group)
			}
			if (play.about.isScoringPlay) group.hasScoring = true
			group.plays.push(play)
		}

		return groups
	})
</script>

<div
	class="group/plays mx-ch border border-stroke text-sm"
	role="group"
	onmouseleave={() => onPlayHover?.(null)}
>
	<fieldset class="flex flex-wrap gap-x-ch border-b border-stroke px-ch py-[.5ch]">
		<label>
			<input name="plays" type="radio" checked />
			All plays
		</label>

		<label>
			<input name="plays" value="scoring" type="radio" />
			Scoring
		</label>
	</fieldset>

	{#if groupedPlays.length}
		<div class="h-[12lh] overflow-y-auto">
			{#each groupedPlays as group (group.key)}
				<div
					data-has-scoring={group.hasScoring ? '' : undefined}
					class="group-has-[[value='scoring']:checked]/plays:not-data-has-scoring:hidden"
				>
					<div
						class="sticky top-0 z-1 px-ch py-[.5ch] text-[10px] font-medium tracking-wide text-current/40 uppercase backdrop-blur-xs"
					>
						{group.label}
					</div>

					<ol class="px-ch">
						{#each group.plays as { about, result, runnerIndex, count } (about.atBatIndex)}
							{@const wp = wpByAtBatIndex.get(about.atBatIndex)}

							<li
								class="flex anim-fade items-center gap-ch border-t border-dashed border-stroke py-[.5ch] leading-tight group-has-[[value='scoring']:checked]/plays:not-data-scoring:hidden group-not-has-[[value='scoring']:checked]/plays:data-scoring:positive group-not-has-[[value='scoring']:checked]/plays:data-scoring:dark:text-accent"
								data-scoring={about.isScoringPlay ? '' : undefined}
								onmouseenter={() => about.isScoringPlay && onPlayHover?.(about.atBatIndex)}
							>
								<div class="shrink-0 py-[.5ch] text-[5px]">
									<BaseRunners {runnerIndex} />
									<Outs {count} class="-mt-px" />
								</div>

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
					</ol>
				</div>
			{/each}
		</div>
	{:else}
		<Empty class="p-ch">No plays</Empty>
	{/if}
</div>
