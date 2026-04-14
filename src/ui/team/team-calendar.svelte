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

	type ScheduledGame = {
		gamePk: number
		gameDate: string
		teams: MLB.Game['teams']
		pitcher: MLB.Person | null
		pitcherPredicted: boolean
	}

	function extractRotation(confirmedPitchers: MLB.Person[]): MLB.Person[] {
		const rotation: MLB.Person[] = []
		const seen = new Set<number>()

		for (const p of confirmedPitchers) {
			if (seen.has(p.id)) break
			seen.add(p.id)
			rotation.push(p)
		}

		// Fall back to last 7 if we couldn't detect a full cycle
		return rotation.length >= 3 ? rotation : confirmedPitchers.slice(-7)
	}

	async function fetchSchedule(year: number): Promise<Record<string, ScheduledGame[]>> {
		const schedule = await fetchMLB<MLB.ScheduleResponse>(`/api/v1/schedule`, {
			sportId: String(team.sport?.id ?? 1),
			teamId: String(team.id),
			season: String(year),
			fields: [
				'dates,date',
				'games,gamePk,gameDate',
				'games,status,abstractGameState',
				'games,probablePitchers,away,home,id,fullName',
				'teams,home,away,team,id,name,clubName,teamName,abbreviation',
				'sport',
			],
			hydrate: 'team,probablePitchers',
		})

		// Flatten all games, preserving their schedule date
		const allGamesWithDate: { date: string; game: MLB.Game }[] = (schedule?.dates ?? []).flatMap(
			({ date, games }) => games.map((game) => ({ date, game })),
		)

		// Sort chronologically
		allGamesWithDate.sort((a, b) => a.game.gameDate.localeCompare(b.game.gameDate))

		// Collect confirmed probable pitchers for this team in chronological order
		const confirmedPitchers: MLB.Person[] = allGamesWithDate
			.map(({ game }) => {
				const isHome = game.teams.home.team.id === team.id
				return isHome ? game.probablePitchers?.home : game.probablePitchers?.away
			})
			.filter((p): p is MLB.Person => !!p)

		// Build the rotation from confirmed pitchers
		const rotation = extractRotation(confirmedPitchers)
		const lastConfirmed = confirmedPitchers.at(-1)
		const lastPosInRotation =
			lastConfirmed && rotation.length >= 2
				? rotation.findIndex((p) => p.id === lastConfirmed.id)
				: -1

		// Assign confirmed or predicted pitcher to each game
		let predOffset = 0
		const enriched: (ScheduledGame & { date: string })[] = allGamesWithDate.map(({ date, game }) => {
			const isHome = game.teams.home.team.id === team.id
			const confirmed = isHome ? game.probablePitchers?.home : game.probablePitchers?.away

			if (confirmed) {
				return { date, gamePk: game.gamePk, gameDate: game.gameDate, teams: game.teams, pitcher: confirmed, pitcherPredicted: false }
			}

			if (
				game.status.abstractGameState === 'Preview' &&
				lastPosInRotation !== -1 &&
				rotation.length >= 2
			) {
				const predicted = rotation[(lastPosInRotation + 1 + predOffset) % rotation.length]
				predOffset++
				return { date, gamePk: game.gamePk, gameDate: game.gameDate, teams: game.teams, pitcher: predicted, pitcherPredicted: true }
			}

			return { date, gamePk: game.gamePk, gameDate: game.gameDate, teams: game.teams, pitcher: null, pitcherPredicted: false }
		})

		// Group by schedule date
		const byDate: Record<string, ScheduledGame[]> = {}
		for (const { date, ...game } of enriched) {
			if (!byDate[date]) byDate[date] = []
			byDate[date].push(game)
		}

		return byDate
	}
</script>

<Calendar class={className} {cells} />

{#snippet cells({ day, year, month }: { day: number | null; year: number; month: number })}
	{#if day}
		{@const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}

		{#await fetchSchedule(year) then games}
			{#if games[date]}
				<ul class="grid gap-px">
					{#each games[date] as { gamePk, teams, pitcher, pitcherPredicted } (gamePk)}
						{@const opponent = teams.home.team.id === team.id ? teams.away.team : teams.home.team}

						<li>
							<a href="/game/{gamePk}">
								<StyledTeam
									class="justify-center gap-0 overflow-clip text-foreground *:data-name:hidden @max-[10ch]/team:[&:has([src*=silo])_picture>img]:size-[.75lh]"
									team={opponent}
								>
									{#if pitcher}
										<Headshot
											person={pitcher}
											class={cn(
												'order-first -ml-px size-lh shrink-0',
												pitcherPredicted && 'opacity-50',
											)}
											size={48}
											type="silo"
											title={pitcher.fullName}
										/>
									{/if}

									<small
										class={cn(
											'order-first @max-[10ch]/team:text-[xx-small]',
											isDarkOnLightTeam(opponent) && 'dark:text-dark',
											isLightOnDarkTeam(opponent) && 'dark:text-light',
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
