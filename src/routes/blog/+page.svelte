<script lang="ts">
	import { formatDate } from '$lib/temporal'
	import Header from '$ui/header.svelte'
	import Metadata from '$ui/metadata.svelte'
	import type { PageData } from './$types'

	const { data }: { data: PageData } = $props()
</script>

<Metadata title="Blog | MLB.TheOhtani.com" description="" />

<Header title="Blog" crumbs={[{ href: '/blog', name: 'Blog' }]} />

<div class="posts">
	{#each data.posts as post (post.slug)}
		{@const date = formatDate(post.date, { locale: 'en-CA' })}
		{@const href = `/blog/${date}-${post.slug}`}
		<article>
			<h2>
				<a {href}>
					{post.title}
				</a>
			</h2>

			<time>{date}</time>
		</article>
	{/each}
</div>
