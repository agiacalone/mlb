import { generateBatch } from '$lib/server/random'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const initial = await generateBatch(10, ['team', 'player', 'game'])
	return { initial }
}
