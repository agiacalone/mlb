import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerScheduleTools } from './tools/schedule.js';
import { registerStandingsTools } from './tools/standings.js';
import { registerLeadersTools } from './tools/leaders.js';
import { registerPlayerTools } from './tools/player.js';
import { registerTeamTools } from './tools/team.js';
import { registerTransactionTools } from './tools/transactions.js';
import { registerTeamsResource } from './resources/teams.js';
import { registerConstantsResource } from './resources/constants.js';
const server = new McpServer({
    name: 'mlb-stats',
    version: '1.0.0',
});
registerTeamsResource(server);
registerConstantsResource(server);
registerScheduleTools(server);
registerStandingsTools(server);
registerLeadersTools(server);
registerPlayerTools(server);
registerTeamTools(server);
registerTransactionTools(server);
const transport = new StdioServerTransport();
await server.connect(transport);
