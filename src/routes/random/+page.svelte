<script lang="ts">
	import GameSlide from '$ui/doom-scroll/game-slide.svelte'
	import Slide from '$ui/doom-scroll/slide.svelte'
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
			<Slide
				{entity}
				title={entity.name}
				{index}
				total={items.length}
				{fetchBackward}
				{fetchForward}
			>
				{#snippet content()}
					<p>
						{[
							entity.franchiseName,
							entity.franchiseName !== entity.locationName && entity.locationName,
						]
							.filter(Boolean)
							.join(', ')}
					</p>
					{#if !entity.active}<p>(Inactive)</p>{/if}
				{/snippet}
			</Slide>
		{:else if entity.type === 'player'}
			<Slide
				{entity}
				title={entity.fullName}
				{index}
				total={items.length}
				{fetchBackward}
				{fetchForward}
			>
				<img
					class="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-600"
					src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:action:hero:current.jpg/w_1600,q_auto:best/v1/people/{entity.id}/action/hero/current"
					width={1600}
					height={533}
					alt=""
					draggable="false"
					loading="eager"
					fetchpriority="high"
					onload={(e) => {
						e.currentTarget.classList.remove('opacity-0')
						e.currentTarget.classList.add('opacity-50')
					}}
				/>

				{#snippet content()}
					{#if entity.primaryPosition?.abbreviation}<p>
							{entity.primaryPosition.abbreviation}
						</p>{/if}
					{#if entity.currentTeam?.name}<p>{entity.currentTeam.name}</p>{/if}
					{#if !entity.active}<p>(Inactive)</p>{/if}
				{/snippet}
			</Slide>
		{:else if entity.type === 'game'}
			<GameSlide {entity} {index} total={items.length} {fetchBackward} {fetchForward} />
		{/if}

		<hr class="my-lh border-dashed border-stroke" />
	{/each}

	{#if loadingForward}
		<Loading class="justify-center p-ch text-current/50" />
	{/if}
</div>
