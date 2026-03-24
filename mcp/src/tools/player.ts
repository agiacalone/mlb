import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { fetchMLB } from '../fetch.js'

function currentSeason() {
	const d = new Date()
	return d.getMonth() <= 1 ? d.getFullYear() - 1 : d.getFullYear()
}

export function registerPlayerTools(server: McpServer) {
	server.tool(
		'search_player',
		'Search for an MLB player by name. Returns a list of matching players with their IDs. Use the personId from results to call get_player_bio or get_player_stats.',
		{
			name: z.string().describe('Player name to search for (first name, last name, or both).'),
		},
		async ({ name }) => {
			const data = await fetchMLB<{ people: MLB.Person[] }>('/api/v1/people/search', {
				names: name,
				sportId: '1',
				fields: ['people,id,fullName,currentTeam,id,name,primaryPosition,code,abbreviation,active'],
			})

			const people = data?.people ?? []
			if (!people.length) {
				return { content: [{ type: 'text', text: `No players found matching "${name}".` }] }
			}

			const lines = people.map((p) => {
				const team = p.currentTeam?.name ?? 'Free Agent'
				const pos = p.primaryPosition?.abbreviation ?? p.primaryPosition?.code ?? '?'
				const active = p.active ? '' : ' (inactive)'
				return `- **${p.fullName}** (ID: ${p.id}) — ${pos}, ${team}${active}`
			})

			return { content: [{ type: 'text', text: `Found ${people.length} player(s):\n${lines.join('\n')}` }] }
		},
	)

	server.tool(
		'get_player_bio',
		'Get biographical information for an MLB player.',
		{
			personId: z.number().describe('MLB player ID (personId). Use search_player to find this.'),
		},
		async ({ personId }) => {
			const data = await fetchMLB<{ people: MLB.Person[] }>(`/api/v1/people/${personId}`, {
				hydrate: 'currentTeam',
				fields: [
					'people,id,fullName,firstName,lastName,birthDate,birthCity,birthStateProvince,birthCountry',
					'height,weight,bats,pitchHand,primaryPosition,code,abbreviation,name',
					'currentTeam,id,name',
					'mlbDebutDate,draftYear,active,nameSlug',
				],
			})

			const p = data?.people?.[0]
			if (!p) return { content: [{ type: 'text', text: 'Player not found.' }] }

			const age = p.birthDate
				? Math.floor((Date.now() - new Date(p.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
				: null

			const lines = [
				`## ${p.fullName}`,
				`**Team:** ${p.currentTeam?.name ?? 'Free Agent'}`,
				`**Position:** ${p.primaryPosition?.name ?? p.primaryPosition?.abbreviation ?? '?'}`,
				p.batSide ? `**Bats/Throws:** ${p.batSide.code} / ${p.pitchHand?.code ?? '?'}` : null,
				p.height && p.weight ? `**Size:** ${p.height}, ${p.weight} lbs` : null,
				p.birthDate ? `**Born:** ${p.birthDate}${age ? ` (age ${age})` : ''}` : null,
				p.birthCity ? `**Birthplace:** ${[p.birthCity, p.birthStateProvince, p.birthCountry].filter(Boolean).join(', ')}` : null,
				p.mlbDebutDate ? `**MLB Debut:** ${p.mlbDebutDate}` : null,
				p.draftYear ? `**Draft Year:** ${p.draftYear}` : null,
				`**Player ID:** ${p.id}`,
			].filter(Boolean)

			return { content: [{ type: 'text', text: lines.join('\n') }] }
		},
	)

	server.tool(
		'get_player_stats',
		'Get hitting, pitching, or fielding statistics for an MLB player.',
		{
			personId: z.number().describe('MLB player ID. Use search_player to find this.'),
			group: z
				.enum(['hitting', 'pitching', 'fielding'])
				.describe('Stat group to retrieve.'),
			type: z
				.enum(['season', 'career'])
				.optional()
				.describe('Season stats or career totals. Defaults to season.'),
			season: z
				.number()
				.optional()
				.describe('Season year. Defaults to current season. Only used for type=season.'),
			gameType: z
				.enum(['R', 'S', 'P'])
				.optional()
				.describe('R = Regular Season, S = Spring Training, P = Playoffs. Defaults to R.'),
		},
		async ({ personId, group, type, season, gameType }) => {
			const statType = type ?? 'season'
			const data = await fetchMLB<{ stats: MLB.StatSplit[] }>(`/api/v1/people/${personId}/stats`, {
				stats: statType,
				group,
				season: statType === 'season' ? (season ?? currentSeason()).toString() : undefined,
				gameType: gameType ?? 'R',
				sportId: '1',
			})

			const stats = (data?.stats ?? []) as unknown as MLB.PlayerStats[]
			if (!stats.length || !stats[0]?.splits?.length) {
				return { content: [{ type: 'text', text: 'No stats found.' }] }
			}

			const lines: string[] = []
			for (const statGroup of stats) {
				const splits = statGroup.splits ?? []
				for (const split of splits) {
					const teamName = split.team?.name ? ` (${split.team.name})` : ''
					const seasonLabel = split.season ? ` ${split.season}` : ''
					lines.push(`## ${statType === 'career' ? 'Career' : seasonLabel}${teamName} ${group} stats`)

					const stat = split.stat ?? {}
					const entries = Object.entries(stat)
						.filter(([, v]) => v != null && v !== '' && v !== 0)
						.map(([k, v]) => `**${k}:** ${v}`)

					lines.push(entries.join('  |  '))
				}
			}

			return { content: [{ type: 'text', text: lines.join('\n\n') || 'No stats available.' }] }
		},
	)
}
