import { HOST } from '$ui/playground/constants'

export async function fetchMLB<T>(
	endpoint: string,
	params?: Partial<Record<Fetch.QueryParamKeys, string | string[]>>,
) {
	const url = new URL(endpoint, HOST)

	for (const [key, value] of Object.entries(params ?? {})) {
		url.searchParams.set(key, typeof value !== 'string' ? value!?.flat().join(',') : value)
	}

	const response = await fetch(url.toString())

	return (await response.json()) as T
}
