<script lang="ts">
	import Countdown from './countdown.svelte'

	let { season }: { season: MLB.SeasonDateInfo } = $props()

	const wbcDate = '2026-03-04'
</script>

<article class="flex flex-wrap justify-center gap-x-[2lh] gap-y-lh">
	<Countdown date={season.springStartDate} until="🌻 Spring Training" />

	<Countdown
		date={wbcDate}
		until="🌎 World Baseball Classic"
		href="/schedule/week/{wbcDate}?sportId=51"
	/>

	<Countdown date={season.regularSeasonStartDate} until="🏟️ Opening Day" />
</article>
