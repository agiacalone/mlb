<script lang="ts">
	import { formatDate, getToday } from '$lib/temporal'
	import { ChevronRightIcon } from '$ui/icons'
</script>

<aside
	class="items-between relative flex grid-cols-[1fr_auto_1fr] items-center justify-between gap-ch bg-[#006e3c]/25 px-ch text-center font-bold before:m-auto md:grid dark:bg-[#006e3c]/80 not-dark:text-[#006e3c]"
>
	<a
		class="leading-tight text-balance decoration-dashed hover:underline"
		href="/schedule/week/{formatDate(getToday(), { locale: 'en-CA' })}?sportId=51"
	>
		World Baseball Classic Schedule
		<ChevronRightIcon class="inline-block size-lh align-top max-sm:hidden" />
		<span class="absolute inset-0"></span>
	</a>

	<img
		class="-my-ch ml-auto"
		src="https://midfield.mlbstatic.com/v1/league/wbc/spots/72"
		width="72"
		height="72"
		alt="WBC"
	/>
</aside>
