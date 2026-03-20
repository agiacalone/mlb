import { formatDate, slash } from '$lib/temporal'

export function getAllBlogs() {
	const modules = import.meta.glob<any>('./posts/*.md', { eager: true })

	const posts = Object.entries(modules).map(([path, module]) => {
		const slug = path.split('/').at(-1)?.replace('.md', '')
		return {
			slug,
			...module.metadata,
			date: formatDate(module.metadata?.date.split('T')[0], { locale: 'en-CA' }),
		}
	})

	posts.sort((a, b) => new Date(slash(b.date)).getTime() - new Date(slash(a.date)).getTime())

	return posts
}

export function getPostEntry(slug: string) {
	const modules = import.meta.glob<any>('./posts/*.md', { eager: true })

	return Object.entries(modules).find(([path]) => {
		const filename = path.split('/').at(-1)?.replace('.md', '')
		return filename === slug
	})
}
