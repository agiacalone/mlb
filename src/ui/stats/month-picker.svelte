<script lang="ts">
	import { getToday } from '$lib/temporal'
	import { cn } from '$lib/utils'
	import { ChevronLeftIcon, ChevronRightIcon } from '$ui/icons'
	import type { HTMLAttributes } from 'svelte/elements'

	let {
		class: className,
		buttons = true,
		onPrev,
		onNext,
		onchange,
		...props
	}: {
		name?: string
		class?: string
		buttons?: boolean
		onPrev?: () => void
		onNext?: () => void
		onchange?: HTMLAttributes<HTMLSelectElement>['onchange']
	} & Omit<HTMLAttributes<HTMLSelectElement>, 'onchange'> = $props()

	const MONTHS = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	]

	let select = $state<HTMLSelectElement | null>(null)
	let month = $state(getToday().getMonth() + 1)
</script>

<fieldset class="flex justify-center gap-px text-center {className}">
	<select
		class="button text-center"
		id="month"
		bind:value={month}
		bind:this={select}
		{onchange}
		{...props}
	>
		{#each MONTHS as name, i (i)}
			<option value={i + 1}>{name}</option>
		{/each}
	</select>

	{#if buttons}
		<button
			type="button"
			class={cn(
				'order-first button border-b-0 border-l',
				month <= 1 && 'pointer-events-none opacity-50',
			)}
			onclick={() => {
				if (!select) return
				month--
				select.value = month.toString()
				onchange?.({ currentTarget: select } as Event & {
					currentTarget: HTMLSelectElement & EventTarget
				})
			}}
		>
			<ChevronLeftIcon />
		</button>

		<button
			type="button"
			class={cn(
				'order-last button border-r border-b-0',
				month >= 12 && 'pointer-events-none opacity-50',
			)}
			onclick={() => {
				if (!select) return
				month++
				select.value = month.toString()
				onchange?.({ currentTarget: select } as Event & {
					currentTarget: HTMLSelectElement & EventTarget
				})
			}}
		>
			<ChevronRightIcon />
		</button>
	{/if}
</fieldset>
