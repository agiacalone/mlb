import { fetchMLB } from '$lib/fetch'
import { getToday } from '$lib/temporal'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ url }) => {
	const personIds = url.searchParams.get('ids')!
	const season = url.searchParams.get('season') ?? getToday().getFullYear().toString()

	const stats = await fetchMLB<MLB.PersonResponse>('/api/v1/people', {
		personIds,
		fields: ['people,id,fullName', 'stats,group,displayName,splits,season,stat', 'avg'],
		hydrate: `stats(group=[hitting,pitching],type=[season],season=${season})`,
	})

	return {
		stats,
	}
}
