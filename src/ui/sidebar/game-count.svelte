<script lang="ts">
	import { fetchMLB } from '$lib/fetch'
	import { formatDate, getToday } from '$lib/temporal'

	const date = formatDate(getToday(), { locale: 'en-CA' })

	async function fetchGameCount() {
		return await fetchMLB<MLB.ScheduleResponse>('/api/v1/schedule', {
			sportId: '1',
			date,
			fields: ['totalGames,dates,games,status,abstractGameState'],
			hydrate: 'teams,flags,linescore',
		})
	}
</script>

{#await fetchGameCount() then { totalGames, dates }}
	{@const liveGames =
		dates[0]?.games.filter((g) => g.status.abstractGameState === 'Live').length ?? 0}

	{#if totalGames > 0}
		<small class="flex items-center">
			{#if liveGames > 0}
				<span class="mr-[2px] animate-pulse rounded-full text-base positive dark:text-accent">
					•
				</span>
				<b class="positive dark:text-accent">{liveGames}</b>
				<span class="text-current/50">/</span>
			{/if}
			<span class="text-current/50">{totalGames}</span>
		</small>
	{/if}
{/await}
