import { fetchWeekTransactions } from '$lib/fetch/presets'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url }) => {
	const searchParams = Object.fromEntries(url.searchParams.entries())

	const transactions = await fetchWeekTransactions({
		date: params.date,
		...searchParams,
	})

	return {
		transactions,
	}
}
