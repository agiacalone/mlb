import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { fetchMLB } from '../fetch.js'

function today() {
	return new Intl.DateTimeFormat('en-CA').format(new Date())
}

function daysAgo(n: number) {
	const d = new Date()
	d.setDate(d.getDate() - n)
	return new Intl.DateTimeFormat('en-CA').format(d)
}

export function registerTransactionTools(server: McpServer) {
	server.tool(
		'get_transactions',
		'Get MLB roster transactions including trades, signings, DFA designations, IL placements, and call-ups.',
		{
			teamId: z
				.number()
				.optional()
				.describe('Filter to a specific team by MLB team ID.'),
			startDate: z
				.string()
				.optional()
				.describe('Start date YYYY-MM-DD. Defaults to 7 days ago.'),
			endDate: z
				.string()
				.optional()
				.describe('End date YYYY-MM-DD. Defaults to today.'),
			type: z
				.enum(['trade', 'signing', 'dfa', 'il', 'all'])
				.optional()
				.describe('Filter by transaction type. Defaults to all.'),
		},
		async ({ teamId, startDate, endDate, type }) => {
			const data = await fetchMLB<MLB.TransactionsResponse>('/api/v1/transactions', {
				sportId: '1',
				teamId: teamId?.toString(),
				startDate: startDate ?? daysAgo(7),
				endDate: endDate ?? today(),
				fields: ['transactions,date,description,typeDesc,toTeam,fromTeam,id,name,person'],
			})

			let transactions = data?.transactions ?? []
			if (!transactions.length) {
				return { content: [{ type: 'text', text: 'No transactions found for the given period.' }] }
			}

			// Filter by type if specified
			if (type && type !== 'all') {
				const typeMap: Record<string, string[]> = {
					trade: ['Trade'],
					signing: ['Signing', 'Contract', 'Free Agent'],
					dfa: ['Designated for Assignment'],
					il: ['Placed on', 'Transferred to', '60-day', '15-day', '10-day'],
				}
				const keywords = typeMap[type] ?? []
				transactions = transactions.filter((t) =>
					keywords.some((k) => t.typeDesc?.toLowerCase().includes(k.toLowerCase()) ||
						t.description?.toLowerCase().includes(k.toLowerCase()))
				)
			}

			if (!transactions.length) {
				return { content: [{ type: 'text', text: `No ${type} transactions found.` }] }
			}

			// Group by date
			const byDate: Record<string, typeof transactions> = {}
			for (const t of transactions) {
				const d = t.date?.split('T')[0] ?? 'Unknown'
				if (!byDate[d]) byDate[d] = []
				byDate[d].push(t)
			}

			const lines: string[] = []
			for (const [date, txns] of Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0]))) {
				lines.push(`\n### ${date}`)
				for (const t of txns) {
					lines.push(`- **${t.typeDesc ?? 'Transaction'}:** ${t.description}`)
				}
			}

			return {
				content: [
					{
						type: 'text',
						text: `## Transactions (${transactions.length} total)\n${lines.join('\n')}`,
					},
				],
			}
		},
	)
}
