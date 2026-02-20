<script lang="ts">
	import { fetchMLB } from '$lib/fetch'
	import { formatDate } from '$lib/temporal'
	import Game from '$ui/game/game.svelte'
	import Highlights from '$ui/game/highlights.svelte'
	import Slide from './slide.svelte'

	let {
		entity,
		index,
		total,
		fetchBackward,
		fetchForward,
	}: {
		entity: Extract<App.RandomEntity, { type: 'game' }>
		index: number
		total: number
		fetchBackward?: () => void
		fetchForward?: () => void
	} = $props()
</script>

<Slide
	{entity}
	title={`${entity.teams.away.team.name} ${entity.teams.away.score ?? ''} @ ${entity.teams.home.team.name} ${entity.teams.home.score ?? ''}`}
	{index}
	{total}
	{fetchBackward}
	{fetchForward}
>
	<div class="my-auto grid gap-ch">
		<Game game={entity} />

		{#await fetchMLB<MLB.GameContent>( `/api/v1/game/${entity.gamePk}/content`, { highlightLimit: '0' }, ) then content}
			<Highlights game={entity} {content} theater={false} />
		{/await}
	</div>

	{#snippet content()}
		<p class="flex flex-wrap items-center gap-x-ch">
			{entity.status.detailedState ?? entity.status.abstractGameState}
		</p>
		<p>{formatDate(entity.gameDate, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
	{/snippet}
</Slide>
