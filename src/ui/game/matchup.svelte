<script lang="ts">
	import { cn } from '$lib/utils'
	import { BallIcon, BatIcon } from '$ui/icons'
	import Headshot from '$ui/player/headshot.svelte'
	import CurrentPitch from './current-pitch.svelte'

	let { liveGame }: { liveGame?: MLB.LiveGameFeed } = $props()

	const { linescore, boxscore } = $derived((liveGame?.liveData as MLB.LiveData) ?? {})
	const isMiddleOrEnd = $derived(['Middle', 'End'].includes(linescore?.inningState ?? ''))

	const { pitcher, pitchHand, batter, batSide } = $derived(
		(liveGame?.liveData?.plays.currentPlay?.matchup as MLB.Matchup) ?? {},
	)

	const { players } = $derived((liveGame?.gameData as MLB.GameData) ?? {})

	const [{ pitching }, { batting }, ...lineups] = $derived([
		(boxscore?.teams[linescore.inningHalf === 'Top' ? 'home' : 'away'].players[`ID${pitcher?.id}`]
			.stats as unknown as MLB.TeamStats) ?? {},
		(boxscore?.teams[linescore.inningHalf === 'Top' ? 'away' : 'home'].players[`ID${batter?.id}`]
			.stats as unknown as MLB.TeamStats) ?? {},
		linescore?.offense ?? {},
		linescore?.defense ?? {},
	])
</script>

<div
	class="mb-auto flex snap-x snap-mandatory overflow-x-auto pb-[.25ch] *:min-w-full *:snap-start *:snap-always *:px-[.25ch]"
	style:grid-area="matchup"
>
	{#if !isMiddleOrEnd}
		<div>
			{@render player(
				{ type: 'pitcher', person: pitcher, side: pitchHand },
				`P:${pitching?.numberOfPitches ?? 0}`,
			)}
			{@render player({ type: 'batter', person: batter, side: batSide }, batting?.summary)}
			<CurrentPitch {liveGame} />
		</div>
	{/if}

	{#each lineups as { batter: nextUp, onDeck, inHole }}
		<div>
			{#if nextUp && onDeck && inHole}
				{@render player({ type: 'batter', person: nextUp }, 'Next up')}
				{@render player({ type: 'batter', person: onDeck }, 'On deck')}
				{@render player({ type: 'batter', person: inHole }, 'In the hole')}
			{/if}
		</div>
	{/each}
</div>

{#snippet player(
	{
		type,
		person,
		side,
	}: {
		type: 'pitcher' | 'batter'
		person: MLB.Person
		side?: MLB.PitchHand | MLB.BatSide
	},
	after?: string,
)}
	<div class="group/player relative flex h-lh items-center gap-x-[.5ch]">
		{#if person}
			{@const player = players[`ID${person.id}`] as unknown as MLB.Person}

			<span class="relative shrink-0">
				<Headshot {person} class="size-lh" />

				{#if side?.code}
					<span
						class={cn('absolute bottom-0 drop-shadow-sm drop-shadow-background *:size-[.4lh]', {
							'right-0': side?.code === 'L',
							'left-0': side?.code === 'R',
						})}
					>
						{#if type === 'pitcher'}
							<BallIcon />
						{:else if type === 'batter'}
							<BatIcon />
						{/if}
					</span>
				{/if}
			</span>

			<a
				href="/player/{person.id}"
				class="line-clamp-1 grow break-all decoration-dashed group-hover/player:underline"
			>
				{player.lastInitName || person.fullName}
				<span class="absolute inset-0"></span>
			</a>

			{#if after}
				<span class="line-clamp-1 text-xs break-all text-current/50">{after}</span>
			{/if}
		{/if}
	</div>
{/snippet}
