import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event)
	response.headers.set('X-Source', 'mlb.theohtani.com')
	response.headers.set('X-Attribution', 'https://mlb.theohtani.com')
	return response
}
