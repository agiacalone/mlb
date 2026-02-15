import type { Actions } from './$types'

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData()

		return {
			entries: {
				...Object.fromEntries(formData.entries()),
				stats: formData.getAll('stats').join(','),
			},
		}
	},
} satisfies Actions
