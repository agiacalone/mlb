import { fetchMLB } from '$lib/fetch'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url }) => {
	const gameType = url.searchParams.get('gameType') ?? 'R'

	const standingsType = gameType === 'S' ? 'springTraining' : 'regularSeason'
	const leagueId = gameType === 'wbc' ? '160' : gameType === 'S' ? '114,115' : '103,104'

	const standings = await fetchMLB<MLB.StandingsResponse>('/api/v1/standings', {
		leagueId,
		// season: params.season,
		standingsType,
		hydrate: 'division,team',
		fields: [
			'records,sport,division,nameShort,league,springLeague,id,name',
			'teamRecords,wins,losses,winningPercentage,sportGamesBack,magicNumber,streak,streakCode,leagueRank',
			'team,id,name,clubName,teamName,abbreviation',
		],
	})

	return {
		standings,
	}
}
