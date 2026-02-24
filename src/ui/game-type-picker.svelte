<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	let {
		class: className,
	}: {
		class?: string
	} = $props()

	const GAME_TYPES = [
		{ value: 'R', label: 'Regular Season' },
		{ value: 'S', label: 'Spring Training' },
	]

	let gameType = $derived(page.url.searchParams.get('gameType') ?? 'R')
</script>

<select
	class={className}
	value={gameType}
	onchange={(e) => {
		const url = new URL(page.url)
		const value = (e.target as HTMLSelectElement).value

		if (value !== 'R') {
			url.searchParams.set('gameType', value)
		} else {
			url.searchParams.delete('gameType')
		}

		goto(url.toString())
	}}
>
	{#each GAME_TYPES as { value, label } (value)}
		<option {value} selected={value === gameType}>{label}</option>
	{/each}
</select>
