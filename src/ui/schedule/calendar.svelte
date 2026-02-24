<script lang="ts">
	import { formatDate, getToday } from '$lib/temporal'
	import { cn } from '$lib/utils'
	import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements'
	import MonthPickerWithYear from './month-picker-with-year.svelte'

	let {
		class: className,
		buttons = true,
		onchange,
		inputProps,
	}: {
		class?: string
		buttons?: boolean
		onchange?: HTMLAttributes<HTMLInputElement>['onchange']
		inputProps?: HTMLInputAttributes
	} & Omit<HTMLAttributes<HTMLInputElement>, 'onchange'> = $props()

	const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

	const today = getToday()
	const todayYear = today.getFullYear()
	const todayMonth = today.getMonth() + 1

	let selected = $state(`${todayYear}-${String(todayMonth).padStart(2, '0')}`)
	let year = $derived(Number(selected.split('-')[0]))
	let month = $derived(Number(selected.split('-')[1]))

	let weeks = $derived.by(() => {
		const firstDay = new Date(year, month - 1, 1)
		const daysInMonth = new Date(year, month, 0).getDate()
		const startOffset = (firstDay.getDay() + 6) % 7
		const cells: (number | null)[] = [
			...Array(startOffset).fill(null),
			...Array.from({ length: daysInMonth }, (_, i) => i + 1),
		]
		while (cells.length % 7 !== 0) cells.push(null)
		return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))
	})
</script>

<div class={className}>
	<MonthPickerWithYear bind:value={selected} {buttons} {onchange} {...inputProps} />

	<table class="w-full table-fixed text-center">
		<thead>
			<tr>
				{#each DOW as d (d)}
					<th class="px-1 py-0.5 font-normal text-current/40">{d}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each weeks as week, wi (wi)}
				<tr>
					{#each week as day, di (di)}
						<td
							class={cn(
								'px-1 py-0.5 text-sm',
								!day && 'opacity-0',
								formatDate(getToday(), { locale: 'en-CA' }) ===
									`${year}-${String(month).padStart(2, '0')}-${day}` && 'text-accent',
							)}
						>
							{day}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
