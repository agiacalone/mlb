import { fetchMLB } from '$lib/fetch'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url, fetch }) => {
	const sportId = url.searchParams.get('sportId') ?? '1'
	const gameType = url.searchParams.get('gameType') ?? 'R'

	const { leagues } = await fetchMLB<MLB.LeaguesResponse>(
		'/api/v1/leagues',
		{ sportId, season: params.season, fields: 'leagues,id,divisionsInUse' },
		{ fetch },
	)

	const leagueId = leagues
		.filter((l) => (gameType === 'S' ? !l.divisionsInUse : l.divisionsInUse))
		.map((l) => l.id)
		.join(',')

	const standings = await fetchMLB<MLB.StandingsResponse>(
		'/api/v1/standings',
		{
			leagueId,
			season: params.season,
			standingsType:
				gameType === 'S' ? 'springTraining' : gameType === 'P' ? 'postseason' : 'regularSeason',
			hydrate: 'division,team',
			fields: [
				'records,sport,division,nameShort,league,springLeague,id,name',
				'teamRecords,wins,losses,winningPercentage,sportGamesBack,magicNumber,streak,streakCode,leagueRank',
				'team,id,name,clubName,teamName,abbreviation',
			],
		},
		{ fetch },
	)

	return {
		standings,
	}
}
