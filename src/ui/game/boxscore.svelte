<script lang="ts">
	import { cn } from '$lib/utils'
	import Empty from '$ui/empty.svelte'
	import { ArrowDownRightIcon } from '$ui/icons'
	import Headshot from '$ui/player/headshot.svelte'
	import StyledTeam from '$ui/team/styled-team.svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	let {
		boxscore,
		isSpoilerPrevented,
		class: className,
	}: {
		boxscore?: MLB.Boxscore
		isSpoilerPrevented?: boolean
	} & HTMLAttributes<HTMLDivElement> = $props()

	let { away, home } = $derived(
		boxscore?.teams ?? {
			away: undefined,
			home: undefined,
		},
	)
</script>

<article
	class="grid snap-x snap-mandatory auto-cols-[min(var(--container-sm),calc(100vw-2ch))] grid-flow-col overflow-x-auto sm:grid-cols-2 sm:px-ch {className}"
>
	{@render team(away)}
	{@render team(home)}
</article>

{#snippet team(team?: MLB.TeamBoxscore)}
	{#if team}
		<article class="snap-center bg-background">
			<StyledTeam team={team.team} class="z-1" />

			{#if team.batters.length}
				<div class="overflow-x-auto">
					<table class="table-fixed text-center">
						<thead class="text-xs text-current/40">
							<tr class="*:pt-[.5ch]">
								<th class="w-full"></th>
								<th>AB</th>
								<th>H</th>
								<th>R</th>
								<th>RBI</th>
								<th>HR</th>
								<th>BB</th>
								<th>K</th>
								<th>SB</th>
							</tr>
						</thead>
						<tbody>
							{#each team.batters as playerId}
								{@const { stats, ...player } = team.players[`ID${playerId}`]}
								{@const substituted = !isSpoilerPrevented && !team.battingOrder.includes(playerId)}

								{#if player.position.abbreviation !== 'P'}
									<tr
										class="hover:*:bg-foreground/10"
										data-substituted={substituted ? '' : undefined}
									>
										{@render p(player, substituted)}

										{#each ['atBats', 'hits', 'runs', 'rbi', 'homeRuns', 'baseOnBalls', 'strikeOuts', 'stolenBases'] as stat}
											{@const value = stats?.batting?.[stat as keyof MLB.BattingStats]}
											<td
												class={cn(!isSpoilerPrevented && Number(value) === 0 && 'text-current/40')}
											>
												{#if !isSpoilerPrevented}
													{value}
												{/if}
											</td>
										{/each}
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>

				<hr class="my-[.5ch] border-dashed border-current/25" />

				<div class="overflow-x-auto">
					<table class="table-fixed text-center">
						<thead class="text-xs text-current/40">
							<tr>
								<th class="w-full"></th>
								<th>IP</th>
								<th>P</th>
								<th>H</th>
								<th>R</th>
								<th>ER</th>
								<th>HR</th>
								<th>BB</th>
								<th>K</th>
								<th class="relative" style:anchor-name="--hbp">
									<div class="absolute [position-anchor:--hbp] [position-area:center]">HBP</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{#each team.pitchers.slice(0, isSpoilerPrevented ? 1 : team.pitchers.length) as playerId (playerId)}
								{@const { stats, ...player } = team.players[`ID${playerId}`]}
								{#if player.position.abbreviation === 'P'}
									<tr class="hover:*:bg-foreground/10">
										{@render p(player)}

										{#each ['inningsPitched', 'numberOfPitches', 'hits', 'runs', 'earnedRuns', 'homeRuns', 'baseOnBalls', 'strikeOuts', 'hitBatsmen'] as stat}
											{@const value = stats?.pitching?.[stat as keyof MLB.PitchingStats]}
											<td
												class={cn(
													!isSpoilerPrevented &&
														value !== '0.0' &&
														Number(value) === 0 &&
														'text-current/40',
												)}
											>
												{#if !isSpoilerPrevented}
													{value}
												{/if}
											</td>
										{/each}
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<Empty>No boxscore data</Empty>
			{/if}
		</article>
	{/if}
{/snippet}

{#snippet p({ position, person }: MLB.BoxscorePlayer, substituted?: boolean)}
	<th class="relative min-w-[16ch] text-left">
		<a href="/player/{person.id}" class="group/player flex items-center gap-[.5ch]">
			<Headshot {person} class="sticky left-0 z-1 size-lh" />

			<span class="line-clamp-1 grow break-all decoration-dashed group-hover/player:underline">
				{person.boxscoreName}
			</span>

			<small class="w-[3ch] shrink-0 text-center text-xs text-current/40 no-underline">
				{position.abbreviation}
			</small>

			<span class="absolute inset-0"></span>

			{#if substituted}
				<div class="absolute top-full left-ch grid size-lh place-content-center">
					<ArrowDownRightIcon class="size-ch text-current/40" />
				</div>
			{/if}
		</a>
	</th>
{/snippet}

<style>
	table tr {
		> :first-child {
			padding-left: 1rch;
		}
		> :last-child {
			padding-right: 1rch;
		}
	}

	td {
		font-family: var(--font-sans);
		font-variant-numeric: tabular-nums;

		&:not(:has(img)) {
			min-width: 3rch;
		}
	}

	[data-substituted] + tr th:first-child :global(img) {
		margin-left: 1lh;
	}
</style>
