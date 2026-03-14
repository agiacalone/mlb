import { HOST } from '$ui/playground/constants'
import { fetchLiveMLB } from './live.svelte'

export async function fetchMLB<T>(
	endpoint: string,
	params?: Fetch.Params,
	{ host = HOST, fetch: _fetch = fetch }: { host?: string; fetch?: typeof fetch } = {},
) {
	const url = new URL(endpoint, host)

	for (const [key, value] of Object.entries(params ?? {})) {
		url.searchParams.set(key, typeof value !== 'string' ? value!?.flat().join(',') : value)
	}

	try {
		const response = await _fetch(url.toString(), { signal: AbortSignal.timeout(10_000) })

		if (!response.ok) {
			const body = await response.text().catch(() => '(unreadable body)')
			const error = new Error(`MLB API ${response.status}: ${url.pathname}`)
			console.error('[fetchMLB] HTTP error', {
				status: response.status,
				url: decodeURIComponent(url.toString()),
				body,
			})
			throw error
		}

		return (await response.json()) as T
	} catch (error) {
		if (error instanceof Error && error.message.startsWith('MLB API')) throw error
		console.error('[fetchMLB] Unexpected error', {
			url: decodeURIComponent(url.toString()),
			error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
		})
		throw error
	}
}

export function createPreset<TArgs extends unknown[], T>(
	build: (...args: TArgs) => { endpoint: string; params?: Fetch.Params },
) {
	const fn = async (...args: TArgs): Promise<T> => {
		const { endpoint, params } = build(...args)
		return fetchMLB<T>(endpoint, params)
	}

	fn.live = (...args: TArgs) => {
		const { endpoint, params } = build(...args)
		return fetchLiveMLB<T>(endpoint, params)
	}

	return fn as ((...args: TArgs) => Promise<T>) & {
		live: (...args: TArgs) => ReturnType<typeof fetchLiveMLB<T>>
	}
}
