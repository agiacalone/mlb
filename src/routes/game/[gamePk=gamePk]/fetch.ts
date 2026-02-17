import { createPreset } from '$lib/fetch'

export const fetchSchedule = createPreset<[gamePk: string], MLB.ScheduleResponse>((gamePk) => ({
	endpoint: '/api/v1/schedule',
	params: {
		gamePk,
		fields: [
			'dates,date,venue,description,seriesGameNumber,gamesInSeries',
			'games,gamePk,gameType,gameDate,link',
			'flags,noHitter,perfectGame',
			'status,abstractGameState,detailedState,reason',
			'teams,away,home,team,id,name,leagueRecord,wins,losses,score',
		],
		hydrate: 'flags',
	},
}))

export function getGame(schedule?: MLB.ScheduleResponse, gamePk?: string | number) {
	return schedule?.dates?.[0].games.find((game) => game.gamePk === Number(gamePk))!
}
