import { fetchMLB } from '$lib/fetch'
import type { Actions } from './$types'

export const actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData()
		const personIds = url.searchParams.get('ids')!

		const allStats = formData.getAll('stats').join(',')

		console.log(formData.get('type'))

		const statsHydration = [
			`group=[${formData.get('group')}]`,
			`type=[${formData.get('type')}]`,
		].join(',')

		const results = await fetchMLB<MLB.PersonResponse>('/api/v1/people', {
			personIds,
			fields: ['people,id,fullName', 'stats,group,displayName,splits,season,stat', allStats],
			hydrate: `stats(${statsHydration})`,
		})

		return {
			entries: {
				...Object.fromEntries(formData.entries()),
				stats: allStats,
			},
			results,
		}
	},
} satisfies Actions
