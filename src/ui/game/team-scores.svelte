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
</script>

{#if ['Final', 'Live'].includes(game.status.abstractGameState) && !isSpoilerPrevented}
	<div class="grid text-left *:pl-[.25ch]">
		{#each ['away', 'home'] as const as teamKey (teamKey)}
			<StyledTeam
				team={boxscore.teams[teamKey].team}
				record={game.teams[teamKey].leagueRecord}
				linked
			>
				<strong class="ml-auto shrink-0 pr-[.5ch] text-right tabular-nums">
					{game.teams[teamKey].score}
				</strong>

				{#if game.status.abstractGameState === 'Live' && ((teamKey === 'away' && linescore?.inningState === 'Top') || (teamKey === 'home' && linescore?.inningState === 'Bottom'))}
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
