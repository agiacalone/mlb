<script lang="ts">
	import Headshot from '$ui/player/headshot.svelte'

	let { liveGame }: { liveGame?: MLB.LiveGameFeed } = $props()

	const { linescore, boxscore } = $derived((liveGame?.liveData as MLB.LiveData) ?? {})
	const isMiddleOrEnd = $derived(['Middle', 'End'].includes(linescore?.inningState ?? ''))

	const { pitcher, batter } = $derived(
		(liveGame?.liveData?.plays.currentPlay?.matchup as MLB.Matchup) ?? {},
	)

	const { players } = $derived((liveGame?.gameData as MLB.GameData) ?? {})
</script>

<div class="grid px-[.25ch]" style:grid-area="matchup">
	{#if isMiddleOrEnd}
		{@const { batter, onDeck, inHole } = linescore?.offense ?? {}}
		{#if batter && onDeck && inHole}
			{@render player(batter, 'Next up')}
			{@render player(onDeck, 'On deck')}
			{@render player(inHole, 'In the hole')}
		{/if}
	{:else}
		{@const { pitching } =
			(boxscore?.teams[linescore.inningHalf === 'Top' ? 'home' : 'away'].players[`ID${pitcher?.id}`]
				.stats as unknown as MLB.TeamStats) ?? {}}
		{@render player(pitcher, `P:${pitching?.numberOfPitches ?? 0}`)}

		{@const { batting } =
			(boxscore?.teams[linescore.inningHalf === 'Top' ? 'away' : 'home'].players[`ID${batter?.id}`]
				.stats as unknown as MLB.TeamStats) ?? {}}
		{@render player(batter, batting?.summary)}
	{/if}
</div>

{#snippet player(person: MLB.Person, after?: string)}
	<div class="group/player relative flex h-lh items-center gap-x-[.5ch]">
		{#if person}
			{@const player = players[`ID${person.id}`] as unknown as MLB.Person}

			<Headshot {person} class="size-lh shrink-0" />

			<a
				href="/player/{person.id}"
				class="line-clamp-1 grow break-all decoration-dashed group-hover/player:underline"
			>
				{player.lastInitName || person.fullName}
				<span class="absolute inset-0"></span>
			</a>

			{#if after}
				<span class="text-xs text-current/50">{after}</span>
			{/if}
		{/if}
	</div>
{/snippet}
