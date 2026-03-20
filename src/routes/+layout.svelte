<script lang="ts">
	import { browser } from '$app/environment'
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	import Offline from '$ui/offline.svelte'
	import Sidebar from '$ui/sidebar/nav.svelte'
	import posthog from 'posthog-js'
	import './app.css'

	let { children } = $props()

	if (browser) {
		beforeNavigate(() => posthog.capture('$pageleave'))
		afterNavigate(() => posthog.capture('$pageview'))

		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
		document.cookie = `tz=${tz};path=/;max-age=31536000;SameSite=Lax`
	}
</script>

<svelte:head>
	<link rel="icon" type="image/png" sizes="48x48" href="/favicons/favicon-48x48.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />

	<link rel="manifest" href="/manifest.json" />
	<link rel="sitemap" type="application/xml" href="/sitemap.xml" />
	<meta name="theme-color" content="#000000" />

	<link rel="preconnect" href="https://statsapi.mlb.com" />
	<link rel="preconnect" href="https://www.mlbstatic.com" />
	<link rel="preconnect" href="https://midfield.mlbstatic.com" />
	<link rel="preconnect" href="https://img.mlbstatic.com" />

	<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'MLB.TheOhtani.com',
		url: 'https://mlb.theohtani.com',
		description: 'A custom MLB scorebug, standings, stats, and player profiles.',
		applicationCategory: 'SportsApplication',
		operatingSystem: 'Web',
		inLanguage: 'en',
		author: { '@type': 'Person', name: 'nuotsu', url: 'https://mlb.theohtani.com' },
	})}<\/script>`}
</svelte:head>

<Sidebar />

<main
	class="
		isolate no-scrollbar max-h-dvh overflow-x-clip overflow-y-auto bg-background transition-[margin,border-radius,max-height]
		sm:sidebar-open:m-[.5ch] sm:sidebar-open:ml-0 sm:sidebar-open:max-h-[calc(100dvh-1ch)] sm:sidebar-open:rounded-md
	"
>
	<Offline />

	{@render children()}
</main>

<style>
	:global(body) {
		display: grid;
		grid-template: 'nav main' / auto 1fr;
		min-height: 100dvh;
	}

	main {
		grid-area: main;
	}
</style>
