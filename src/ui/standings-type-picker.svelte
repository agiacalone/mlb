<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	let {
		class: className,
	}: {
		class?: string
	} = $props()

	const STANDINGS_TYPES = [
		{ value: 'regularSeason', label: 'Regular Season' },
		{ value: 'springTraining', label: 'Spring Training' },
	]

	let standingsType = $derived(page.url.searchParams.get('standingsType') ?? 'regularSeason')
</script>

<select
	class={className}
	value={standingsType}
	onchange={(e) => {
		const url = new URL(page.url)
		const value = (e.target as HTMLSelectElement).value

		if (value !== 'regularSeason') {
			url.searchParams.set('standingsType', value)
		} else {
			url.searchParams.delete('standingsType')
		}

		goto(url.toString())
	}}
>
	{#each STANDINGS_TYPES as { value, label } (value)}
		<option {value} selected={value === standingsType}>{label}</option>
	{/each}
</select>
