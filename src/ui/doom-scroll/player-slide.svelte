<script lang="ts">
	import Slide from './slide.svelte'

	let {
		entity,
		index,
		total,
		fetchBackward,
		fetchForward,
	}: {
		entity: Extract<App.RandomEntity, { type: 'player' }>
		index: number
		total: number
		fetchBackward?: () => void
		fetchForward?: () => void
	} = $props()
</script>

<Slide
	{entity}
	title={entity.fullName}
	{index}
	{total}
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
		{#if entity.primaryPosition?.abbreviation}<p>{entity.primaryPosition.abbreviation}</p>{/if}
		{#if entity.currentTeam?.name}<p>{entity.currentTeam.name}</p>{/if}
		{#if !entity.active}<p>(Inactive)</p>{/if}
	{/snippet}
</Slide>
