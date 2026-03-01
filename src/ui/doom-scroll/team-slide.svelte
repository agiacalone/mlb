<script lang="ts">
	import TeamCalendar from '$ui/team/team-calendar.svelte'
	import Slide from './slide.svelte'

	let {
		entity,
		index,
		total,
		fetchBackward,
		fetchForward,
	}: {
		entity: Extract<App.RandomEntity, { type: 'team' }>
		index: number
		total: number
		fetchBackward?: () => void
		fetchForward?: () => void
	} = $props()
</script>

<Slide {entity} title={entity.name} {index} {total} {fetchBackward} {fetchForward}>
	<TeamCalendar class="my-auto" team={entity as MLB.TeamDetailed} />

	{#snippet content()}
		<p>
			{[entity.franchiseName, entity.franchiseName !== entity.locationName && entity.locationName]
				.filter(Boolean)
				.join(', ')}
		</p>
		{#if !entity.active}<p>(Inactive)</p>{/if}
	{/snippet}
</Slide>
