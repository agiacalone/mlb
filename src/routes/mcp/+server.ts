import { createMcpServer } from '$lib/mcp/server.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import type { RequestHandler } from './$types'

export const config = {
	runtime: 'nodejs22.x',
}

const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
	'Access-Control-Max-Age': '86400',
}

function withCors(response: Response): Response {
	const headers = new Headers(response.headers)
	for (const [k, v] of Object.entries(CORS)) headers.set(k, v)
	return new Response(response.body, { status: response.status, headers })
}

export const OPTIONS: RequestHandler = () => new Response(null, { status: 204, headers: CORS })

async function handle(request: Request): Promise<Response> {
	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined, // stateless mode
	})
	const server = createMcpServer()
	await server.connect(transport)
	return withCors(await transport.handleRequest(request))
}

export const POST: RequestHandler = ({ request }) => handle(request)
export const GET: RequestHandler = ({ request }) => handle(request)
