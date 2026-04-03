import { getPostHogClient } from '$lib/server/posthog.js'
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
	const body = request.method === 'POST' ? await request.clone().json().catch(() => null) : null
	const method = body?.method as string | undefined

	if (method) {
		getPostHogClient().capture({
			distinctId: request.headers.get('x-forwarded-for') ?? 'anonymous',
			event: 'mcp_request',
			properties: {
				method,
				tool: method === 'tools/call' ? body?.params?.name : undefined,
				client: request.headers.get('user-agent'),
			},
		})
	}

	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined, // stateless mode
	})
	const server = createMcpServer()
	await server.connect(transport)
	return withCors(await transport.handleRequest(request))
}

export const POST: RequestHandler = ({ request }) => handle(request)
export const GET: RequestHandler = ({ request }) => handle(request)
