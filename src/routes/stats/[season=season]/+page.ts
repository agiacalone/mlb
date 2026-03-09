import { fetchMLB } from '$lib/fetch'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url }) => {
	const hittingSortStat = url.searchParams.get('hittingSortStat') ?? 'homeRuns'
	const pitchingSortStat = url.searchParams.get('pitchingSortStat') ?? 'era'
	const gameType = url.searchParams.get('gameType') ?? 'R'
	const sportId = url.searchParams.get('sportId') ?? '1'
	const position = url.searchParams.get('position')

	const [baseballStats, hittingLeaders, pitchingLeaders, positions] = await Promise.all([
		fetchMLB<MLB.BaseballStat[]>('/api/v1/baseballStats'),
		fetchMLB<MLB.PlayerStatsResponse>('/api/v1/stats', {
			stats: 'season',
			group: 'hitting',
			sortStat: hittingSortStat,
			season: params.season,
			limit: '20',
			fields: [
				'stats,splits,rank',
				'player,id,lastName,position,abbreviation',
				'stat,avg,homeRuns,rbi,hits,doubles,triples,stolenBases,obp,slg,ops',
				'team,league,name,sport',
			],
			gameType,
			sportId,
			...(position ? { position } : {}),
		}),
		fetchMLB<MLB.PlayerStatsResponse>('/api/v1/stats', {
			stats: 'season',
			group: 'pitching',
			sortStat: pitchingSortStat,
			season: params.season,
			limit: '20',
			fields: [
				'stats,splits,rank',
				'player,id,lastName,position,abbreviation',
				'stat,era,wins,losses,strikeOuts,saves,whip,inningsPitched',
				'team,league,name,sport',
			],
			gameType,
			sportId,
			...(position ? { position } : {}),
		}),
		fetchMLB<MLB.PositionMeta[]>('/api/v1/positions'),
	])

	return {
		baseballStats,
		hittingLeaders: {
			sortStat: hittingSortStat,
			...hittingLeaders,
		},
		pitchingLeaders: {
			sortStat: pitchingSortStat,
			...pitchingLeaders,
		},
		positions,
	}
}
