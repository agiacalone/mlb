import { generateBatch, type EntityType } from '$lib/server/random'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
	const count = Math.min(Number(url.searchParams.get('count') ?? '10'), 30)
	const typesParam = url.searchParams.get('types')
	const types = (
		typesParam ? typesParam.split(',') : ['team', 'player', 'game']
	).filter((t): t is EntityType => ['team', 'player', 'game'].includes(t))

	const entities = await generateBatch(count, types.length ? types : ['team', 'player', 'game'])
	return json(entities)
}
