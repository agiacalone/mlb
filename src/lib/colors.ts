export function isDarkOnLightTeam(team?: MLB.Team, sport?: MLB.Sport) {
	if (!team) return false

	return (
		[
			'Asheville Tourists',
			'Minnesota Golden Gophers',
			'Sugar Land Space Cowboys',
			'Sultanes de Monterrey',
		].includes(team.name) ||
		[16, 17, 22, 23, 51].includes(sport?.id ?? (team as MLB.TeamDetailed).sport?.id ?? 1)
	)
}

export function isLightOnDarkTeam(team?: MLB.Team) {
	if (!team) return false

	return ['Hanshin Tigers', 'Tokyo Yomiuri Giants'].includes(team.name)
}
