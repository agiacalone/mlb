import { getAllBlogs } from '$ui/blog/get-blog'
import type { PageLoad } from './$types'

export const load: PageLoad = async () => {
	const posts = getAllBlogs()

	return {
		posts,
	}
}
