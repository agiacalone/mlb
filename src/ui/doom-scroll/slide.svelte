<script lang="ts">
	import { intersectionObserver } from '$lib/attachments/intersection-observer'
	import ToggleFavorite from '$ui/favorites/toggle-favorite.svelte'
	import Headshot from '$ui/player/headshot.svelte'
	import Logo from '$ui/team/logo.svelte'
	import type { Snippet } from 'svelte'

	let {
		entity,
		title,
		index,
		total,
		fetchBackward,
		fetchForward,
		content,
		children,
	}: {
		entity: App.RandomEntity
		title: string
		index: number
		total: number
		fetchBackward?: () => void
		fetchForward?: () => void
		content?: Snippet
		children?: Snippet
	} = $props()

	$inspect(entity)

	const href = $derived(
		entity.type === 'team'
			? `/teams/${entity.id}`
			: entity.type === 'player'
				? `/player/${entity.id}`
				: `/game/${entity.gamePk}`,
	)
</script>

<article
	class="relative grid h-svh snap-start snap-always gap-ch p-ch md:sidebar-open:h-[calc(100svh-1ch)]"
	data-type={entity.type}
	{@attach index === 2 && fetchBackward
		? intersectionObserver((e) => e.isIntersecting && fetchBackward!())
		: null}
	{@attach index === total - 3 && fetchForward
		? intersectionObserver((e) => e.isIntersecting && fetchForward!())
		: null}
>
	{#if children}
		{@render children()}
	{/if}

	<header class="relative mt-auto" style:grid-area="header">
		<h2 class="h1">
			<a {href}>{title}</a>
		</h2>

		{#if content}
			<div>
				{@render content()}
			</div>
		{/if}
	</header>

	<nav class="relative flex flex-col items-center justify-center gap-ch" style:grid-area="nav">
		<a class="block overflow-clip rounded-full bg-current/25" {href}>
			{#if entity.type === 'team'}
				{@const src = `https://midfield.mlbstatic.com/v1/team/${entity.id}/spots`}
				<Logo class="size-[1.5lh]" srcset="{src}/72" team={entity} />
			{:else if entity.type === 'player'}
				<Headshot class="size-[1.5lh]" person={entity} />
			{:else if entity.type === 'game'}
				<span class="grid size-[1.5lh] place-items-center">VS</span>
			{/if}
		</a>

		<ToggleFavorite
			target={{ href, label: entity.type === 'team' ? entity.abbreviation! : title }}
		/>
	</nav>
</article>

<style>
	article {
		grid-template:
			'. nav' 1fr
			'header nav' auto / 1fr auto;
	}

	header {
		padding-bottom: max(1ch, env(safe-area-inset-bottom));
	}
</style>
