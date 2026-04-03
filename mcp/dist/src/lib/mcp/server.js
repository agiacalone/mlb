import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerConstantsResource } from './resources/constants.js';
import { registerTeamsResource } from './resources/teams.js';
import { registerLeadersTools } from './tools/leaders.js';
import { registerPlayerTools } from './tools/player.js';
import { registerScheduleTools } from './tools/schedule.js';
import { registerStandingsTools } from './tools/standings.js';
import { registerTeamTools } from './tools/team.js';
import { registerTransactionTools } from './tools/transactions.js';
export function createMcpServer() {
    const server = new McpServer({ name: 'mlb-stats', version: '1.0.0' });
    registerTeamsResource(server);
    registerConstantsResource(server);
    registerScheduleTools(server);
    registerStandingsTools(server);
    registerLeadersTools(server);
    registerPlayerTools(server);
    registerTeamTools(server);
    registerTransactionTools(server);
    return server;
}
