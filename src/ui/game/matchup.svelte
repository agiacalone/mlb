<script lang="ts">
	import Headshot from '$ui/player/headshot.svelte'

	let { liveGame }: { liveGame?: MLB.LiveGameFeed } = $props()

	const { pitcher, batter } = $derived(
		(liveGame?.liveData?.plays.currentPlay?.matchup as MLB.Matchup) ?? {},
	)

	const { players } = $derived((liveGame?.gameData as MLB.GameData) ?? {})
</script>

<div class="mb-auto" style:grid-area="matchup">
	{@render player({ person: pitcher })}
	{@render player({ person: batter })}
</div>

{#snippet player({ person }: { person: MLB.Person })}
	<div class="group/player relative flex h-lh items-center gap-ch">
		{#if person}
			{@const player = players[`ID${person.id}`] as unknown as MLB.Person}

			<Headshot {person} class="size-lh shrink-0" />
			<a
				href="/player/{person.id}"
				class="line-clamp-1 break-all decoration-dashed group-hover/player:underline"
			>
				{player.lastInitName || person.fullName}
				<span class="absolute inset-0"></span>
			</a>
		{/if}
	</div>
{/snippet}
