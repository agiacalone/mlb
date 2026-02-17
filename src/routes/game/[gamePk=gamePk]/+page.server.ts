import { fetchMLB } from '$lib/fetch'
import { fetchBoxscore, fetchfeedLive, fetchWinProbability } from '$lib/fetch/presets'
import type { PageServerLoad } from './$types'
import { fetchSchedule, getGame } from './fetch'

export const load: PageServerLoad = async ({ params }) => {
	const schedule = await fetchSchedule(params.gamePk)
	const game = getGame(schedule, params.gamePk)

	const [feedLive, boxscore, winProbability, content] = await Promise.all([
		fetchfeedLive(params.gamePk),
		fetchBoxscore(params.gamePk),
		fetchWinProbability(params.gamePk),
		fetchMLB<MLB.GameContent>(`/api/v1/game/${params.gamePk}/content`, {
			highlightLimit: '0',
		}),
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
