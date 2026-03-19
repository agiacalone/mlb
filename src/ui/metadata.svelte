<script lang="ts">
	import { page } from '$app/state'

	let {
		title,
		description,
	}: {
		title: string
		description: string
	} = $props()

	const url = $derived(page.url.href)
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<link rel="canonical" href={url} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="MLB.TheOhtani.com" />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
</svelte:head>
