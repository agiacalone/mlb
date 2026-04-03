import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { fetchMLB } from '../fetch.js'

function currentSeason() {
	const d = new Date()
	return d.getMonth() <= 1 ? d.getFullYear() - 1 : d.getFullYear()
}

export function registerTeamTools(server: McpServer) {
	server.tool(
		'get_team_roster',
		'Get the current roster for an MLB team.',
		{
			teamId: z.number().describe('MLB team ID. Use the mlb://teams resource to find team IDs.'),
			season: z.number().optional().describe('Season year. Defaults to current season.'),
		},
		async ({ teamId, season }) => {
			const data = await fetchMLB<MLB.RosterResponse>(`/api/v1/teams/${teamId}/roster`, {
				season: (season ?? currentSeason()).toString(),
				hydrate: 'person',
				fields: [
					'roster,person,id,fullName,primaryPosition,code,abbreviation,name',
					'jerseyNumber,status,description',
				],
			})

			const roster = data?.roster ?? []
			if (!roster.length) return { content: [{ type: 'text', text: 'No roster data found.' }] }

			// Group by position type
			const pitchers: typeof roster = []
			const catchers: typeof roster = []
			const infielders: typeof roster = []
			const outfielders: typeof roster = []
			const dh: typeof roster = []
			const other: typeof roster = []

			for (const player of roster) {
				const pos = player.position?.abbreviation ?? ''
				if (['SP', 'RP', 'P', 'CP'].includes(pos)) pitchers.push(player)
				else if (pos === 'C') catchers.push(player)
				else if (['1B', '2B', '3B', 'SS'].includes(pos)) infielders.push(player)
				else if (['LF', 'CF', 'RF', 'OF'].includes(pos)) outfielders.push(player)
				else if (pos === 'DH') dh.push(player)
				else other.push(player)
			}

			const fmt = (players: typeof roster) =>
				players.map((p) => {
					const name = p.person?.fullName ?? '?'
					const num = p.jerseyNumber ? `#${p.jerseyNumber}` : ''
					const pos = p.position?.abbreviation ?? '?'
					const status = p.status?.description ? ` [${p.status.description}]` : ''
					return `  - ${num} ${name} (${pos})${status}`
				}).join('\n')

			const sections: string[] = []
			if (pitchers.length) sections.push(`**Pitchers (${pitchers.length})**\n${fmt(pitchers)}`)
			if (catchers.length) sections.push(`**Catchers (${catchers.length})**\n${fmt(catchers)}`)
			if (infielders.length) sections.push(`**Infielders (${infielders.length})**\n${fmt(infielders)}`)
			if (outfielders.length) sections.push(`**Outfielders (${outfielders.length})**\n${fmt(outfielders)}`)
			if (dh.length) sections.push(`**DH (${dh.length})**\n${fmt(dh)}`)
			if (other.length) sections.push(`**Other (${other.length})**\n${fmt(other)}`)

			return {
				content: [
					{
						type: 'text',
						text: `## Roster (${roster.length} players)\n\n${sections.join('\n\n')}`,
					},
				],
			}
		},
	)

	server.tool(
		'get_team_info',
		'Get details about an MLB team including league, division, venue, and recent history.',
		{
			teamId: z.number().describe('MLB team ID.'),
		},
		async ({ teamId }) => {
			const data = await fetchMLB<{ teams: MLB.TeamDetailed[] }>(`/api/v1/teams/${teamId}`, {
				hydrate: 'venue,league,division,sport',
				fields: [
					'teams,id,name,abbreviation,teamName,locationName,firstYearOfPlay,active',
					'league,id,name',
					'division,id,name',
					'venue,id,name,location,city,state,country,capacity',
					'sport,id,name',
				],
			})

			const team = data?.teams?.[0]
			if (!team) return { content: [{ type: 'text', text: 'Team not found.' }] }

			const lines = [
				`## ${team.name}`,
				`**Abbreviation:** ${team.abbreviation ?? '?'}`,
				team.league ? `**League:** ${team.league.name}` : null,
				team.division ? `**Division:** ${team.division.name}` : null,
				team.venue ? `**Ballpark:** ${team.venue.name}` : null,
				team.firstYearOfPlay ? `**Founded:** ${team.firstYearOfPlay}` : null,
				`**Team ID:** ${team.id}`,
			].filter(Boolean)

			return { content: [{ type: 'text', text: lines.join('\n') }] }
		},
	)
}
