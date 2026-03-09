<script lang="ts">
	import { formatDate, getToday } from '$lib/temporal'
	import { ChevronRightIcon } from '$ui/icons'
</script>

<aside
	class="items-between relative flex grid-cols-[1fr_auto_1fr] items-center justify-between gap-ch bg-[#006e3c]/25 px-ch py-[.25ch] text-center before:m-auto md:grid dark:bg-[#006e3c]/80 not-dark:text-[#006e3c]"
>
	<div class="flex flex-wrap items-center justify-center gap-x-ch gap-y-[.25ch]">
		<span>World Baseball Classic</span>

		<a
			class="leading-tight font-bold text-balance decoration-dashed hover:underline"
			href="/schedule/week/{formatDate(getToday(), { locale: 'en-CA' })}?sportId=51"
		>
			Schedule
			<ChevronRightIcon class="inline-block size-lh align-top" />
		</a>

		<a
			class="leading-tight font-bold text-balance decoration-dashed hover:underline"
			href="/standings/2026?sportId=51&gameType=P"
		>
			Standings
			<ChevronRightIcon class="inline-block size-lh align-top" />
		</a>
	</div>

	<img
		class="-my-ch ml-auto"
		src="https://midfield.mlbstatic.com/v1/league/wbc/spots/72"
		width="72"
		height="72"
		alt="WBC"
	/>
</aside>
