import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
	const modules = import.meta.glob<any>('../posts/*.md', { eager: true })

	const entry = Object.entries(modules).find(([path]) => {
		const filename = path.split('/').at(-1)?.replace('.md', '')
		return filename === params.slug
	})

	if (!entry) {
		throw new Error(`Post not found: ${params.slug}`)
	}

	const [path, post] = entry

	return {
		post,
	}
}
