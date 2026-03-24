const TEAMS = [
    { id: 133, name: 'Oakland Athletics', abbreviation: 'ATH', league: 'AL', division: 'AL West' },
    { id: 134, name: 'Pittsburgh Pirates', abbreviation: 'PIT', league: 'NL', division: 'NL Central' },
    { id: 135, name: 'San Diego Padres', abbreviation: 'SD', league: 'NL', division: 'NL West' },
    { id: 136, name: 'Seattle Mariners', abbreviation: 'SEA', league: 'AL', division: 'AL West' },
    { id: 137, name: 'San Francisco Giants', abbreviation: 'SF', league: 'NL', division: 'NL West' },
    { id: 138, name: 'St. Louis Cardinals', abbreviation: 'STL', league: 'NL', division: 'NL Central' },
    { id: 139, name: 'Tampa Bay Rays', abbreviation: 'TB', league: 'AL', division: 'AL East' },
    { id: 140, name: 'Texas Rangers', abbreviation: 'TEX', league: 'AL', division: 'AL West' },
    { id: 141, name: 'Toronto Blue Jays', abbreviation: 'TOR', league: 'AL', division: 'AL East' },
    { id: 142, name: 'Minnesota Twins', abbreviation: 'MIN', league: 'AL', division: 'AL Central' },
    { id: 143, name: 'Philadelphia Phillies', abbreviation: 'PHI', league: 'NL', division: 'NL East' },
    { id: 144, name: 'Atlanta Braves', abbreviation: 'ATL', league: 'NL', division: 'NL East' },
    { id: 145, name: 'Chicago White Sox', abbreviation: 'CWS', league: 'AL', division: 'AL Central' },
    { id: 146, name: 'Miami Marlins', abbreviation: 'MIA', league: 'NL', division: 'NL East' },
    { id: 147, name: 'New York Yankees', abbreviation: 'NYY', league: 'AL', division: 'AL East' },
    { id: 108, name: 'Los Angeles Angels', abbreviation: 'LAA', league: 'AL', division: 'AL West' },
    { id: 109, name: 'Arizona Diamondbacks', abbreviation: 'ARI', league: 'NL', division: 'NL West' },
    { id: 110, name: 'Baltimore Orioles', abbreviation: 'BAL', league: 'AL', division: 'AL East' },
    { id: 111, name: 'Boston Red Sox', abbreviation: 'BOS', league: 'AL', division: 'AL East' },
    { id: 112, name: 'Chicago Cubs', abbreviation: 'CHC', league: 'NL', division: 'NL Central' },
    { id: 113, name: 'Cincinnati Reds', abbreviation: 'CIN', league: 'NL', division: 'NL Central' },
    { id: 114, name: 'Cleveland Guardians', abbreviation: 'CLE', league: 'AL', division: 'AL Central' },
    { id: 115, name: 'Colorado Rockies', abbreviation: 'COL', league: 'NL', division: 'NL West' },
    { id: 116, name: 'Detroit Tigers', abbreviation: 'DET', league: 'AL', division: 'AL Central' },
    { id: 117, name: 'Houston Astros', abbreviation: 'HOU', league: 'AL', division: 'AL West' },
    { id: 118, name: 'Kansas City Royals', abbreviation: 'KC', league: 'AL', division: 'AL Central' },
    { id: 119, name: 'Los Angeles Dodgers', abbreviation: 'LAD', league: 'NL', division: 'NL West' },
    { id: 120, name: 'Washington Nationals', abbreviation: 'WSH', league: 'NL', division: 'NL East' },
    { id: 121, name: 'New York Mets', abbreviation: 'NYM', league: 'NL', division: 'NL East' },
    { id: 158, name: 'Milwaukee Brewers', abbreviation: 'MIL', league: 'NL', division: 'NL Central' },
];
export function registerTeamsResource(server) {
    server.resource('teams', 'mlb://teams', { mimeType: 'application/json' }, async () => ({
        contents: [
            {
                uri: 'mlb://teams',
                mimeType: 'application/json',
                text: JSON.stringify({ teams: TEAMS }, null, 2),
            },
        ],
    }));
}
