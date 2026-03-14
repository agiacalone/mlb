import { fetchMLB } from '$lib/fetch'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url, fetch }) => {
	const sportId = url.searchParams.get('sportId') ?? '1'
	const gameType = url.searchParams.get('gameType') ?? 'R'

	const standings = await fetchMLB<MLB.StandingsResponse>(
		'/api/v1/standings',
		{
			leagueId:
				sportId === '51'
					? '160'
					: sportId === '1' && gameType === 'S'
						? '114,115'
						: sportId === '1' && gameType === 'R'
							? '103,104'
							: '103,104',
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
