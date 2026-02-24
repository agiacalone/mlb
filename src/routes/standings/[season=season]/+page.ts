import { fetchMLB } from '$lib/fetch'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url }) => {
	const gameType = url.searchParams.get('gameType') ?? 'R'
	const standingsType = gameType === 'S' ? 'springTraining' : 'regularSeason'

	const leagueId = gameType === 'S' ? '114,115' : '103,104'

	const standings = await fetchMLB<MLB.StandingsResponse>('/api/v1/standings', {
		leagueId,
		season: params.season,
		hydrate: 'division,team',
		fields: [
			'records,division,nameShort,league,id,name',
			'teamRecords,wins,losses,winningPercentage,sportGamesBack,magicNumber,streak,streakCode,leagueRank',
			'team,id,name,clubName,teamName,abbreviation',
		],
		standingsType,
	})

	return {
		standings,
	}
}
