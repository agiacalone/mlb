<script lang="ts">
	import { formatDate } from '$lib/temporal'
	import type { HTMLAttributes } from 'svelte/elements'

	let {
		posts,
		class: className,
	}: {
		posts: Blog.Post[]
	} & HTMLAttributes<HTMLUListElement> = $props()
</script>

<ul class="flex flex-col gap-ch leading-tight {className}">
	{#each posts as post (post.slug)}
		{@const date = formatDate(post.date, { locale: 'en-CA' })}
		{@const href = `/blog/${date}-${post.slug}`}

		<li
			class="group/post relative grid grid-cols-[auto_1fr] items-start gap-ch border-dashed border-stroke [&+&]:border-t [&+&]:pt-ch"
		>
			<img
				class="aspect-square w-[4lh] object-cover transition-[filter] group-hover/post:brightness-110"
				width={1200}
				height={640}
				src={post.image}
				alt={post.title}
				loading="lazy"
			/>

			<div class="grid gap-[.5ch] self-center">
				<a class="line-clamp-3 decoration-dashed group-hover/post:underline" {href}>
					{post.title}
					<span class="absolute inset-0"></span>
				</a>

				<time class="text-current/50">
					{formatDate(post.date, { month: 'short', day: 'numeric', year: 'numeric' })}
				</time>
			</div>
		</li>
	{/each}
</ul>
