<script lang="ts">
	import { fetchMLB } from '$lib/fetch'
	import Headshot from '$ui/player/headshot.svelte'

	let { gamePk, teamId }: { gamePk: number; teamId: number } = $props()

	async function fetchProbablePitcher() {
		const feedLive = await fetchMLB<MLB.LiveGameFeed>(`/api/v1.1/game/${gamePk}/feed/live`, {
			fields: ['gameData,probablePitchers', 'away,home,id,fullName', 'teams,name,sport'],
		})

		return feedLive.gameData.probablePitchers?.[
			feedLive.gameData.teams.home.id === teamId ? 'home' : 'away'
		]
	}
</script>

{#await fetchProbablePitcher() then person}
	{#if person}
		<a href="/player/{person.id}" aria-label={person.fullName}>
			<Headshot {person} class="size-lh" type="silo" title={person.fullName} />
		</a>
	{/if}
{/await}
