import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { fetchMLB } from '../fetch.js'

function currentSeason() {
	const d = new Date()
	return d.getMonth() <= 1 ? d.getFullYear() - 1 : d.getFullYear()
}

const STAT_DESCRIPTIONS: Record<string, string> = {
	homeRuns: 'home runs',
	battingAverage: 'batting average',
	era: 'ERA',
	strikeouts: 'strikeouts',
	wins: 'wins',
	stolenBases: 'stolen bases',
	rbi: 'RBI',
	ops: 'OPS',
	whip: 'WHIP',
	saves: 'saves',
	onBasePlusSlugging: 'OPS',
	sluggingPercentage: 'slugging percentage',
	onBasePercentage: 'on-base percentage',
	hits: 'hits',
	runs: 'runs scored',
	walks: 'walks',
	strikeoutsPer9Inn: 'K/9',
}

export function registerLeadersTools(server: McpServer) {
	server.tool(
		'get_stat_leaders',
		'Get MLB statistical leaders for any batting or pitching category.',
		{
			stat: z
				.string()
				.describe(
					'Stat category. Examples: homeRuns, battingAverage, era, strikeouts, wins, stolenBases, rbi, ops, whip, saves, hits, runs, sluggingPercentage, onBasePercentage',
				),
			league: z
				.enum(['AL', 'NL', 'MLB'])
				.optional()
				.describe('Filter by league. Defaults to MLB (both leagues).'),
			limit: z
				.number()
				.min(1)
				.max(50)
				.optional()
				.describe('Number of leaders to return. Defaults to 10.'),
			season: z
				.number()
				.optional()
				.describe('Season year. Defaults to current season.'),
			gameType: z
				.enum(['R', 'P'])
				.optional()
				.describe('R = Regular Season, P = Playoffs. Defaults to R.'),
		},
		async ({ stat, league, limit, season, gameType }) => {
			const leagueId =
				league === 'AL' ? '103' : league === 'NL' ? '104' : undefined

			const data = await fetchMLB<MLB.StatsLeadersResponse>('/api/v1/stats/leaders', {
				leaderCategories: stat,
				sportId: '1',
				season: (season ?? currentSeason()).toString(),
				leaderGameTypes: gameType ?? 'R',
				leagueId,
				limit: (limit ?? 10).toString(),
				fields: [
					'leagueLeaders,leaderCategory,season,gameType',
					'leaders,rank,value,person,id,fullName,team,id,name,abbreviation',
				],
			})

			const leaderCategories = data?.leagueLeaders ?? []
			if (!leaderCategories.length) {
				return { content: [{ type: 'text', text: `No leaders found for stat: ${stat}` }] }
			}

			const lines: string[] = []
			for (const category of leaderCategories) {
				const statLabel = STAT_DESCRIPTIONS[stat] ?? stat
				const leagueLabel = league ? ` (${league})` : ''
				const seasonLabel = season ?? currentSeason()
				lines.push(`## ${seasonLabel} ${statLabel} Leaders${leagueLabel}`)
				lines.push('')
				for (const leader of category.leaders ?? []) {
					const player = leader.person?.fullName ?? 'Unknown'
					const team = leader.team?.abbreviation ?? leader.team?.name ?? ''
					lines.push(`${leader.rank}. **${player}** (${team}) — ${leader.value}`)
				}
			}

			return { content: [{ type: 'text', text: lines.join('\n') }] }
		},
	)
}
