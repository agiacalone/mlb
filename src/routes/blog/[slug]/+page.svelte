<script lang="ts">
	import Breadcrumbs from '$ui/breadcrumbs.svelte'
	import Metadata from '$ui/metadata.svelte'
	import type { PageData } from './$types'

	const { data }: { data: PageData } = $props()

	const Component = $derived(data.post.default)
	const { title, description } = $derived(data.post.metadata)
</script>

<Metadata {title} {description} />

<header class="p-ch">
	<Breadcrumbs crumbs={[{ href: '/blog', name: 'Blog' }, { name: title }]} />
</header>

<article class="grid prose gap-x-ch *:col-[content]">
	<h1 class="col-[bleed]! px-ch text-center h0! text-balance">{title}</h1>

	<Component />
</article>

<style>
	article {
		padding-block: 1lh max(1lh, env(safe-area-inset-bottom));
		grid-template-columns:
			[bleed-start] 1fr [content-start] minmax(0, var(--container-2xl))
			[content-end] 1fr [bleed-end];

		:global(a) {
			text-decoration: underline;

			&:not(:hover) {
				text-decoration-style: dashed;
			}
		}
	}
</style>
