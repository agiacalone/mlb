<script lang="ts">
	import { isDarkOnLightTeam, isLightOnDarkTeam } from '$lib/colors'
	import { fetchMLB } from '$lib/fetch'
	import { cn } from '$lib/utils'
	import Headshot from '$ui/player/headshot.svelte'
	import Calendar from '$ui/schedule/calendar.svelte'
	import StyledTeam from './styled-team.svelte'

	let {
		team,
		class: className,
	}: {
		team: MLB.TeamDetailed
		class?: string
	} = $props()

	async function fetchSchedule(year: number) {
		const schedule = await fetchMLB<MLB.ScheduleResponse>(`/api/v1/schedule`, {
			sportId: String(team.sport?.id ?? 1),
			teamId: String(team.id),
			season: String(year),
			fields: [
				'dates,date',
				'games,gamePk,gameDate',
				'teams,home,away,team,id,name,clubName,teamName,abbreviation',
			],
			hydrate: 'team',
		})

		return (schedule?.dates ?? []).reduce(
			(acc, { date, games }) => {
				acc[date] = games
				return acc
			},
			{} as Record<string, MLB.ScheduleResponse['dates'][number]['games']>,
		)
	}

	async function fetchProbablePitcher(gamePk: number, teamId: number) {
		const feedLive = await fetchMLB<MLB.LiveGameFeed>(`/api/v1.1/game/${gamePk}/feed/live`, {
			fields: ['gameData,probablePitchers', 'away,home,id,fullName', 'teams,name,sport'],
		})

		return feedLive.gameData.probablePitchers?.[
			feedLive.gameData.teams.home.id === teamId ? 'home' : 'away'
		]
	}
</script>

<Calendar class={className} {cells} />

{#snippet cells({ day, year, month }: { day: number | null; year: number; month: number })}
	{#if day}
		{@const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}

		{#await fetchSchedule(year) then games}
			{#if games[date]}
				<ul class="grid gap-px">
					{#each games[date] as { gamePk, teams } (gamePk)}
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

									<small
										class={cn(
											'order-first @max-[10ch]/team:text-[xx-small]',
											isDarkOnLightTeam(team) && 'dark:text-dark',
											isLightOnDarkTeam(team) && 'dark:text-light',
										)}
									>
										{teams.home.team.id === team.id ? 'vs' : '@'}
									</small>
								</StyledTeam>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		{/await}
	{/if}
{/snippet}
