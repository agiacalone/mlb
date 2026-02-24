<script lang="ts">
	import { fetchMLB } from '$lib/fetch'
	import Headshot from '$ui/player/headshot.svelte'
	import Calendar from '$ui/schedule/calendar.svelte'
	import StyledTeam from './styled-team.svelte'

	let {
		schedule,
		team,
	}: {
		schedule: MLB.ScheduleResponse
		team: MLB.TeamDetailed
	} = $props()

	const gamesByDate = $derived(
		(schedule?.dates ?? []).reduce(
			(acc, { date, games }) => {
				acc[date] = games
				return acc
			},
			{} as Record<string, (typeof schedule.dates)[number]['games']>,
		),
	)

	async function fetchProbablePitcher(gamePk: number, teamId: number) {
		const feedLive = await fetchMLB<MLB.LiveGameFeed>(`/api/v1.1/game/${gamePk}/feed/live`, {
			fields: ['gameData,probablePitchers', 'away,home,id,fullName', 'teams,name,sport'],
		})

		return feedLive.gameData.probablePitchers?.[
			feedLive.gameData.teams.home.id === teamId ? 'home' : 'away'
		]
	}
</script>

<Calendar class="[&_td:not(:has(a))]:text-current/40" {cell} />

{#snippet cell({ day, year, month }: { day: number | null; year: number; month: number })}
	{#if day}
		{@const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
		{@const games = gamesByDate[date]}

		{#if games}
			<ul class="grid gap-px">
				{#each games as { gamePk, teams } (gamePk)}
					{@const opponent = teams.home.team.id === team.id ? teams.away.team : teams.home.team}
					<li>
						<a href="/game/{gamePk}">
							<StyledTeam
								class="justify-center gap-0 overflow-clip text-foreground *:data-name:hidden @max-[10ch]/team:[&:has([src*=silo])_picture>img]:size-[.75lh]"
								team={opponent}
							>
								{#await fetchProbablePitcher(gamePk, team.id) then person}
									{#if person}
										<Headshot
											{person}
											class="order-first -ml-px size-lh shrink-0"
											type="silo"
											title={person.fullName}
										/>
									{/if}
								{/await}

								<small class="order-first @max-[10ch]/team:text-[xx-small]">
									{teams.home.team.id === team.id ? '@' : 'vs'}
								</small>
							</StyledTeam>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
{/snippet}
