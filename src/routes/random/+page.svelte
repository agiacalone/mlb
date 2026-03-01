<script lang="ts">
	import GameSlide from '$ui/doom-scroll/game-slide.svelte'
	import PlayerSlide from '$ui/doom-scroll/player-slide.svelte'
	import TeamSlide from '$ui/doom-scroll/team-slide.svelte'
	import Loading from '$ui/loading.svelte'
	import { tick, untrack } from 'svelte'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	let items: App.RandomEntity[] = $state(untrack(() => [...data.initial]))
	let loadingForward = $state(false)
	let loadingBackward = $state(false)
	let scrollEl: HTMLElement | null = $state(null)

	function attachScrollEl(el: HTMLElement) {
		scrollEl = el
		return () => {
			scrollEl = null
		}
	}

	async function fetchForward() {
		if (loadingForward) return
		loadingForward = true
		try {
			const res = await fetch('/random/batch?count=10')
			const batch: App.RandomEntity[] = await res.json()
			items.push(...batch)
		} finally {
			loadingForward = false
		}
	}

	async function fetchBackward() {
		if (loadingBackward || !scrollEl) return
		loadingBackward = true
		try {
			const res = await fetch('/random/batch?count=10')
			const batch: App.RandomEntity[] = await res.json()
			const prevHeight = scrollEl.scrollHeight
			items.unshift(...batch)
			await tick()
			scrollEl.scrollTop += scrollEl.scrollHeight - prevHeight
		} finally {
			loadingBackward = false
		}
	}
</script>

<div
	class="no-scrollbar h-svh snap-y snap-mandatory overflow-y-scroll overscroll-contain"
	{@attach attachScrollEl}
>
	{#if loadingBackward}
		<Loading class="justify-center p-ch text-current/50" />
	{/if}

	{#each items as entity, index (entity.type === 'game' ? `game-${entity.gamePk}` : `${entity.type}-${entity.id}`)}
		{#if entity.type === 'team'}
			<TeamSlide {entity} {index} total={items.length} {fetchBackward} {fetchForward} />
		{:else if entity.type === 'player'}
			<PlayerSlide {entity} {index} total={items.length} {fetchBackward} {fetchForward} />
		{:else if entity.type === 'game'}
			<GameSlide {entity} {index} total={items.length} {fetchBackward} {fetchForward} />
		{/if}

		<hr class="my-lh border-dashed border-stroke" />
	{/each}

	{#if loadingForward}
		<Loading class="justify-center p-ch text-current/50" />
	{/if}
</div>
