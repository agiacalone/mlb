<script lang="ts">
	import StyledTeam from '$ui/team/styled-team.svelte'

	let {
		game,
		boxscore,
		linescore,
		isSpoilerPrevented,
	}: {
		game: MLB.Game
		boxscore: MLB.Boxscore
		linescore?: MLB.Linescore
		isSpoilerPrevented?: boolean
	} = $props()

	const isLive = $derived(game.status.abstractGameState === 'Live')
</script>

{#if ['Final', 'Live'].includes(game.status.abstractGameState) && !isSpoilerPrevented}
	<div class="grid text-left *:pl-[.25ch]">
		{#each ['away', 'home'] as const as teamKey (teamKey)}
			{@const awayActive = teamKey === 'away' && linescore?.inningState === 'Top'}
			{@const homeActive = teamKey === 'home' && linescore?.inningState === 'Bottom'}

			<StyledTeam
				team={boxscore.teams[teamKey].team}
				record={game.teams[teamKey].leagueRecord}
				linked
			>
				<strong class="ml-auto shrink-0 pr-[.5ch] text-right tabular-nums">
					{#if isLive}
						{linescore?.teams?.[teamKey]?.runs}
					{:else}
						{game.teams[teamKey].score}
					{/if}
				</strong>

				{#if game.status.abstractGameState === 'Live' && (awayActive || homeActive)}
					<span class="absolute inset-y-0 right-full w-[.5ch] animate-pulse bg-accent"></span>
				{/if}
			</StyledTeam>
		{/each}
	</div>
{:else}
	<div class="grid grid-cols-2 text-center">
		<StyledTeam
			class="flex-row-reverse pl-ch *:data-name:order-last [&_picture]:ml-auto"
			team={boxscore.teams.away.team}
			record={game.teams.away.leagueRecord}
			linked
		/>
		<StyledTeam
			class="pr-ch *:data-name:order-last [&_picture]:mr-auto"
			team={boxscore.teams.home.team}
			record={game.teams.home.leagueRecord}
			linked
		/>
	</div>
{/if}
