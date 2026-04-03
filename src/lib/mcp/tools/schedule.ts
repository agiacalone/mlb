import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { fetchMLB } from '../fetch.js'

function today() {
	return new Intl.DateTimeFormat('en-CA').format(new Date())
}

function currentSeason() {
	const d = new Date()
	return d.getMonth() <= 1 ? d.getFullYear() - 1 : d.getFullYear()
}

export function registerScheduleTools(server: McpServer) {
	server.tool(
		'get_schedule',
		'Get the MLB schedule for a given date. Returns all games with scores, status, and matchups.',
		{
			date: z
				.string()
				.optional()
				.describe('Date in YYYY-MM-DD format. Defaults to today.'),
			teamId: z
				.number()
				.optional()
				.describe('Filter to a specific team by MLB team ID.'),
		},
		async ({ date, teamId }) => {
			const data = await fetchMLB<MLB.ScheduleResponse>('/api/v1/schedule', {
				sportId: '1',
				date: date ?? today(),
				teamId: teamId?.toString(),
				fields: [
					'totalGames,dates,date,venue,description,seriesGameNumber,gamesInSeries',
					'games,gamePk,gameType,gameDate',
					'status,abstractGameState,detailedState,reason',
					'flags,noHitter,perfectGame',
					'teams,away,home,team,id,name,leagueRecord,wins,losses,score',
					'linescore,currentInning,scheduledInnings',
					'innings,num,runs,hits,errors,leftOnBase',
				],
				hydrate: 'teams,flags,linescore',
			})

			const dates = data?.dates ?? []
			if (!dates.length) return { content: [{ type: 'text', text: 'No games found for that date.' }] }

			const lines: string[] = []
			for (const d of dates) {
				lines.push(`## ${d.date} (${d.totalGames ?? d.games?.length ?? 0} games)`)
				for (const game of d.games ?? []) {
					const away = game.teams?.away
					const home = game.teams?.home
					const status = game.status?.detailedState ?? game.status?.abstractGameState
					const awayName = away?.team?.name ?? '?'
					const homeName = home?.team?.name ?? '?'
					const awayScore = away?.score != null ? ` ${away.score}` : ''
					const homeScore = home?.score != null ? ` ${home.score}` : ''
					const gameAny = game as unknown as { flags?: { noHitter?: boolean; perfectGame?: boolean } }
					const flags = [
						gameAny.flags?.noHitter && 'No-Hitter',
						gameAny.flags?.perfectGame && 'Perfect Game',
					].filter(Boolean).join(', ')

					lines.push(
						`- **${awayName}${awayScore}** @ **${homeName}${homeScore}** — ${status}${flags ? ` [${flags}]` : ''} (gamePk: ${game.gamePk})`,
					)
				}
			}

			return { content: [{ type: 'text', text: lines.join('\n') }] }
		},
	)

	server.tool(
		'get_game_recap',
		'Get a detailed recap of a specific MLB game including scoring plays, box score summary, decisions, and game info.',
		{
			gamePk: z.number().describe('The MLB game ID (gamePk).'),
		},
		async ({ gamePk }) => {
			const data = await fetchMLB<MLB.LiveGameFeed>(`/api/v1.1/game/${gamePk}/feed/live`, {
				fields: [
					'gamePk,gameData,liveData',
					'players,fullName,lastName',
					'gameInfo,firstPitch,attendance,gameDurationMinutes',
					'weather,condition,temp,wind',
					'teams,home,away',
					'status,detailedState,abstractGameState',
					'linescore,currentInning,scheduledInnings,innings,num,runs,hits,errors,leftOnBase',
					'boxscore,position,abbreviation,topPerformers,type,player,boxscoreName,stats,batting,pitching,summary',
					'decisions,winner,loser,save,id',
					'plays,allPlays,result,description,about,inning,isTopInning,atBatIndex,isScoringPlay,runnerIndex,count,balls,strikes,outs,awayScore,homeScore',
				],
			})

			if (!data?.gameData) {
				return { content: [{ type: 'text', text: 'Game data not found.' }] }
			}

			const gd = data.gameData
			const ld = data.liveData
			const away = gd.teams?.away
			const home = gd.teams?.home
			const info = gd.gameInfo
			const weather = gd.weather
			const status = gd.status?.detailedState

			const lines: string[] = [
				`## ${away?.name} @ ${home?.name} (gamePk: ${gamePk})`,
				`**Status:** ${status}`,
			]

			// Linescore
			const ls = ld?.linescore
			if (ls) {
				const awayRuns = ls.teams?.away?.runs ?? 0
				const homeRuns = ls.teams?.home?.runs ?? 0
				const awayHits = ls.teams?.away?.hits ?? 0
				const homeHits = ls.teams?.home?.hits ?? 0
				const awayErrors = ls.teams?.away?.errors ?? 0
				const homeErrors = ls.teams?.home?.errors ?? 0
				lines.push(`\n**Score:** ${away?.abbreviation ?? away?.name} ${awayRuns}, ${home?.abbreviation ?? home?.name} ${homeRuns}`)
				lines.push(`**Line:** ${away?.abbreviation} — R:${awayRuns} H:${awayHits} E:${awayErrors} | ${home?.abbreviation} — R:${homeRuns} H:${homeHits} E:${homeErrors}`)
			}

			// Decisions
			const decisions = ld?.decisions
			if (decisions) {
				const players = (gd.players ?? {}) as Record<string, { fullName?: string }>
				const getPlayer = (id?: number) => id ? (players[`ID${id}`]?.fullName ?? `Player ${id}`) : null
				if (decisions.winner) lines.push(`**W:** ${getPlayer(decisions.winner.id)}`)
				if (decisions.loser) lines.push(`**L:** ${getPlayer(decisions.loser.id)}`)
				if (decisions.save) lines.push(`**S:** ${getPlayer(decisions.save.id)}`)
			}

			// Game info
			if (info) {
				if (info.attendance) lines.push(`**Attendance:** ${info.attendance.toLocaleString()}`)
				if (info.gameDurationMinutes) lines.push(`**Duration:** ${Math.floor(info.gameDurationMinutes / 60)}h ${info.gameDurationMinutes % 60}m`)
			}
			if (weather?.condition) lines.push(`**Weather:** ${weather.condition}, ${weather.temp}°F, ${weather.wind}`)

			// Scoring plays
			const scoringPlays = ld?.plays?.allPlays?.filter((p) => p.about?.isScoringPlay)
			if (scoringPlays?.length) {
				lines.push('\n### Scoring Plays')
				for (const play of scoringPlays) {
					const inning = `${play.about?.isTopInning ? 'Top' : 'Bot'} ${play.about?.inning}`
					const score = `${play.result?.awayScore ?? 0}-${play.result?.homeScore ?? 0}`
					lines.push(`- **${inning}** (${score}): ${play.result?.description}`)
				}
			}

			return { content: [{ type: 'text', text: lines.join('\n') }] }
		},
	)

	server.tool(
		'get_team_schedule',
		'Get a team\'s upcoming or recent schedule for the current season.',
		{
			teamId: z.number().describe('MLB team ID.'),
			startDate: z.string().optional().describe('Start date YYYY-MM-DD. Defaults to today.'),
			endDate: z.string().optional().describe('End date YYYY-MM-DD. Defaults to 7 days from start.'),
		},
		async ({ teamId, startDate, endDate }) => {
			const start = startDate ?? today()
			const end = endDate ?? (() => {
				const d = new Date(start)
				d.setDate(d.getDate() + 7)
				return new Intl.DateTimeFormat('en-CA').format(d)
			})()

			const data = await fetchMLB<MLB.ScheduleResponse>('/api/v1/schedule', {
				sportId: '1',
				teamId: teamId.toString(),
				startDate: start,
				endDate: end,
				season: currentSeason().toString(),
				fields: [
					'dates,date,games,gamePk,gameDate,gameType',
					'status,detailedState,abstractGameState',
					'teams,away,home,team,id,name,score,leagueRecord,wins,losses',
					'venue,name',
				],
			})

			const dates = data?.dates ?? []
			if (!dates.length) return { content: [{ type: 'text', text: 'No games found.' }] }

			const lines: string[] = []
			for (const d of dates) {
				for (const game of d.games ?? []) {
					const away = game.teams?.away?.team
					const home = game.teams?.home?.team
					const status = game.status?.detailedState
					const awayScore = game.teams?.away?.score
					const homeScore = game.teams?.home?.score
					const score = (awayScore != null && homeScore != null) ? ` ${awayScore}-${homeScore}` : ''
					lines.push(`- **${d.date}**: ${away?.name} @ ${home?.name}${score} — ${status} (gamePk: ${game.gamePk})`)
				}
			}

			return { content: [{ type: 'text', text: lines.join('\n') }] }
		},
	)
}
