import { HOST } from '$ui/playground/constants'
import { fetchLiveMLB } from './live.svelte'

export async function fetchMLB<T>(endpoint: string, params?: Fetch.Params) {
	const url = new URL(endpoint, HOST)

	for (const [key, value] of Object.entries(params ?? {})) {
		url.searchParams.set(key, typeof value !== 'string' ? value!?.flat().join(',') : value)
	}

	const response = await fetch(url.toString())

	return (await response.json()) as T
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
