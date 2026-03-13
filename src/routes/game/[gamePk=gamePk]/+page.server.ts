import { error } from '@sveltejs/kit'
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

	const [feedLive, boxscore, content] = await Promise.all([
		fetchfeedLive(params.gamePk),
		fetchBoxscore(params.gamePk),
		fetchMLB<MLB.GameContent>(`/api/v1/game/${params.gamePk}/content`),
	]).catch(() => error(503, 'Game data unavailable'))

	const winProbability = await fetchWinProbability(params.gamePk).catch(() => null)

	return {
		schedule,
		game,
		feedLive,
		boxscore,
		winProbability,
		content,
	}
}
