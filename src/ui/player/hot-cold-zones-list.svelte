<script lang="ts">
	import { fetchMLB } from '$lib/fetch'
	import { getToday } from '$lib/temporal'
	import Empty from '$ui/empty.svelte'
	import Loading from '$ui/loading.svelte'
	import HotColdZones from '$ui/stats/hot-cold-zones.svelte'
	import SeasonPicker from '$ui/stats/season-picker.svelte'

	let { person, baseballStats }: { person: MLB.Person; baseballStats: MLB.BaseballStat[] } =
		$props()

	let season = $derived(getToday().getFullYear().toString())

	async function fetchHotColdZones() {
		const [hittingStats, pitchingStats] = await Promise.all([
			fetchMLB<MLB.PlayerStatsResponse>(`/api/v1/people/${person.id}/stats`, {
				stats: 'hotColdZones',
				group: 'hitting',
				season,
			}),
			fetchMLB<MLB.PlayerStatsResponse>(`/api/v1/people/${person.id}/stats`, {
				stats: 'hotColdZones',
				group: 'pitching',
				season,
			}),
		])

		return {
			hittingHotColdZones: hittingStats.stats?.[0],
			pitchingHotColdZones: pitchingStats.stats?.[0],
		}
	}
</script>

<SeasonPicker
	name="season"
	onchange={(e) => {
		season = e.currentTarget.value
		fetchHotColdZones()
	}}
/>

{#await fetchHotColdZones()}
	<Loading class="justify-center">Loading hot/cold zones...</Loading>
{:then { hittingHotColdZones, pitchingHotColdZones }}
	{#if hittingHotColdZones}
		<HotColdZones hotColdZones={hittingHotColdZones} {baseballStats} data-group="hitting" />
	{/if}
	{#if pitchingHotColdZones}
		<HotColdZones hotColdZones={pitchingHotColdZones} {baseballStats} data-group="pitching" />
	{/if}

	{#if !hittingHotColdZones && !pitchingHotColdZones}
		<Empty>No hot/cold zones data</Empty>
	{/if}
{/await}
