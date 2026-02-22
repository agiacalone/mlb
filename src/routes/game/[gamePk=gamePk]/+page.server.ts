import { fetchMLB } from '$lib/fetch'
import { fetchBoxscore, fetchfeedLive, fetchWinProbability } from '$lib/fetch/presets'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const schedule = await fetchMLB<MLB.ScheduleResponse>(`/api/v1/schedule`, {
		gamePk: params.gamePk,
		fields: [
			'dates,date,venue,description,seriesGameNumber,gamesInSeries',
			'games,gamePk,gameType,gameDate,link',
			'flags,noHitter,perfectGame',
			'status,abstractGameState,detailedState,reason',
			'teams,away,home,team,id,name,leagueRecord,wins,losses,score',
		],
		hydrate: 'flags',
	})
	const game = schedule?.dates?.[0].games.find((game) => game.gamePk === Number(params.gamePk))!

	const [feedLive, boxscore, winProbability, content] = await Promise.all([
		fetchfeedLive(params.gamePk),
		fetchBoxscore(params.gamePk),
		fetchWinProbability(params.gamePk),
		fetchMLB<MLB.GameContent>(`/api/v1/game/${params.gamePk}/content`),
	])

	return {
		schedule,
		game,
		feedLive,
		boxscore,
		winProbability,
		content,
	}
}
