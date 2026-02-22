<script lang="ts">
	import { formatDate, formatWeekRange, getToday, slash } from '$lib/temporal'
	import { maintainSearchParams } from '$lib/url.svelte'
	import { ChevronLeftIcon, ChevronRightIcon } from '$ui/icons'

	let {
		date,
		onDateChange,
		href = '/schedule/week',
		class: className,
	}: {
		date: string
		onDateChange?: (date: string) => void
		href?: string
		class?: string
	} = $props()

	function addWeek(weeks: number = 1) {
		return formatDate(
			new Date(new Date(slash(date)).setDate(new Date(slash(date)).getDate() + weeks * 7)),
			{ locale: 'en-CA' },
		)
	}
</script>

<fieldset class="flex justify-center gap-px {className}">
	<label class="button min-w-[14ch] grow">
		{formatWeekRange(date)}

		<input
			id="week"
			class="sr-only"
			type="date"
			min="1901-01-01"
			max={`${getToday().getFullYear()}-12-31`}
			value={date}
			onclick={(e) => (e.target as HTMLInputElement)?.showPicker()}
			onchange={(e) => onDateChange?.(e.currentTarget.value)}
		/>
	</label>

	<a
		class="order-first button border-b-0 border-l"
		href={maintainSearchParams(`${href}/${addWeek(-1)}`)}
	>
		<ChevronLeftIcon />
	</a>

	<a
		class="order-last button border-r border-b-0"
		href={maintainSearchParams(`${href}/${addWeek()}`)}
	>
		<ChevronRightIcon />
	</a>
</fieldset>
