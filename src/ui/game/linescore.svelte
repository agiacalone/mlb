<script lang="ts">
	import { fetchLiveMLB } from '$lib/fetch/live.svelte'
	import { cn } from '$lib/utils'

	let { linescore, game }: { linescore?: MLB.Linescore; game: MLB.Game } = $props()

	const isLive = $derived(game?.status.abstractGameState === 'Live')

	let { data } = $derived(
		isLive
			? fetchLiveMLB<MLB.Linescore>(`/api/v1/game/${game.gamePk}/linescore`, {
					fields: [
						'currentInning,scheduledInnings,inningState',
						'innings,num,runs,hits,errors,leftOnBase',
						'teams,away,home',
					],
				})
			: { data: linescore },
	)

	let innings = $derived(data?.innings ?? [])
	let currentInning = $derived(data?.currentInning)

	const remainingInnings = $derived.by(() =>
		Array.from(
			{ length: (data?.scheduledInnings ?? 0) - innings.length },
			(_, i) => i + innings.length + 1,
		),
	)
</script>

<div class="no-scrollbar overflow-x-auto" style:grid-area="linescore">
	<table class="min-w-full table-fixed text-center">
		<thead>
			<tr class="align-bottom text-xs opacity-40">
				{#each innings as { num } (num)}
					<th class="tabular-nums">{num}</th>
				{/each}

				{#each remainingInnings as num (num)}
					<th class="tabular-nums">{num}</th>
				{/each}

				<th class="w-[4ch]"><abbr title="Hits">R</abbr></th>
				<th class="w-[4ch]"><abbr title="Hits">H</abbr></th>
				<th class="w-[4ch]"><abbr title="Errors">E</abbr></th>
				<th class="w-[4ch]"><abbr title="Left on base">LOB</abbr></th>
			</tr>
		</thead>

		<tbody class="tabular-nums">
			{#each ['away', 'home'] as const as teamKey}
				{@const { runs, hits, errors, leftOnBase } =
					(data?.teams?.[teamKey] as MLB.LinescoreTeam) ?? {}}

				<tr>
					{#each innings as inning (inning.num)}
						{@const bye =
							inning.num === currentInning &&
							teamKey === 'home' &&
							inning[teamKey]?.runs === undefined}

						<td
							class={cn(
								'border-foreground/10 nth-[3n+4]:border-l',
								(inning[teamKey]?.runs === 0 || bye) && 'text-current/40',
								isLive &&
									inning.num === currentInning &&
									((teamKey === 'away' && data?.inningState === 'Top') ||
										(teamKey === 'home' && data?.inningState === 'Bottom')) &&
									'bg-foreground/10',
							)}
						>
							{#if game?.status.abstractGameState === 'Final' && inning.num === currentInning && teamKey === 'home' && inning[teamKey]?.runs === undefined}
								X
							{:else}
								{inning[teamKey]?.runs}
							{/if}
						</td>
					{/each}

					{#each remainingInnings as num (num)}
						<td class={cn('border-foreground/10 nth-[3n+4]:border-l')}></td>
					{/each}

					<td class="border-l border-foreground/25 font-bold">{runs}</td>
					<td>{hits}</td>
					<td>{errors}</td>
					<td>{leftOnBase}</td>
					<td></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	th {
		font-weight: normal;
		min-width: 3ch;
	}

	th,
	td {
		height: 1lh;
	}

	@property --left {
		inherits: false;
		initial-value: 0;
		syntax: '<number>';
	}
	@property --right {
		inherits: false;
		initial-value: 0;
		syntax: '<number>';
	}

	div {
		--max: 2ch;
		scroll-timeline: --linescore x;
		animation: scroll var(--default-transition-duration) ease-in-out;
		animation-timeline: --linescore;
		mask-image: linear-gradient(
			to right,
			transparent,
			currentColor calc(var(--left) * var(--max)),
			currentColor calc(100% - var(--right) * var(--max)),
			transparent
		);
	}

	@keyframes scroll {
		15% {
			--left: 1;
			--right: 1;
		}
		85% {
			--right: 1;
		}
		100% {
			--left: 1;
			--right: 0;
		}
	}
</style>
