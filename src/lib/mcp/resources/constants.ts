import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

function getCurrentSeason() {
	const today = new Date()
	// Before March, report the previous year's season
	return today.getMonth() <= 1 ? today.getFullYear() - 1 : today.getFullYear()
}

const CONSTANTS = {
	currentSeason: getCurrentSeason(),
	sportIds: { MLB: '1', AAA: '11', International: '51' },
	leagueIds: { AL: '103', NL: '104' },
	gameTypes: {
		R: 'Regular Season',
		S: 'Spring Training',
		P: 'Playoffs',
		W: 'World Series',
	},
	statCategories: {
		hitting: [
			'gamesPlayed', 'atBats', 'runs', 'hits', 'doubles', 'triples',
			'homeRuns', 'rbi', 'stolenBases', 'caughtStealing', 'baseOnBalls',
			'strikeOuts', 'avg', 'obp', 'slg', 'ops', 'babip',
		],
		pitching: [
			'gamesPlayed', 'gamesStarted', 'wins', 'losses', 'saves', 'holds',
			'inningsPitched', 'strikeOuts', 'baseOnBalls', 'hits', 'homeRuns',
			'earnedRuns', 'era', 'whip', 'strikeoutsPer9Inn', 'walksPer9Inn',
		],
		fielding: ['gamesPlayed', 'assists', 'putOuts', 'errors', 'fielding'],
	},
	leaderCategories: [
		'homeRuns', 'battingAverage', 'era', 'strikeouts', 'wins',
		'stolenBases', 'rbi', 'ops', 'whip', 'saves', 'onBasePlusSlugging',
		'sluggingPercentage', 'onBasePercentage', 'hits', 'runs',
	],
}

export function registerConstantsResource(server: McpServer) {
	server.resource('constants', 'mlb://constants', { mimeType: 'application/json' }, async () => ({
		contents: [
			{
				uri: 'mlb://constants',
				mimeType: 'application/json',
				text: JSON.stringify(CONSTANTS, null, 2),
			},
		],
	}))
}
