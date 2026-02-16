<script lang="ts">
	import { enhance } from '$app/forms'
	import { fetchMLB } from '$lib/fetch'
	import { ENABLED_BASEBALL_STATS } from '$lib/stats'
	import { formatDate, getToday } from '$lib/temporal'
	import type { HTMLAttributes } from 'svelte/elements'

	let form = $state<HTMLFormElement | null>(null)

	const PARAMETERS = {
		season: {
			displayName: 'season',
			type: 'number',
			value: getToday().getFullYear().toString(),
			min: 1876,
			max: getToday().getFullYear() + 1,
		},
		date: {
			displayName: 'date',
			type: 'date',
			value: formatDate(getToday(), { locale: 'en-CA' }),
			min: '1901-01-01',
			max: `${getToday().getFullYear() + 1}-12-31`,
		},
	} as Record<string, HTMLAttributes<HTMLInputElement> & { displayName?: string }>

	const TYPES: {
		displayName: string
		label?: string
		parameters?: (typeof PARAMETERS)[keyof typeof PARAMETERS][]
	}[] = [
		{
			displayName: 'season,seasonAdvanced',
			label: 'Season',
			parameters: [PARAMETERS.season],
		},
		{ displayName: 'careerRegularSeason,careerAdvanced', label: 'Career' },
		{
			displayName: 'projected',
			label: 'Projected',
			parameters: [PARAMETERS.season],
		},
		{
			displayName: 'byDateRange',
			label: 'By date range',
			parameters: [
				{ ...PARAMETERS.date, displayName: 'startDate' },
				{ ...PARAMETERS.date, displayName: 'endDate' },
			],
		},
		{ displayName: 'byMonth', label: 'By month' },
		{ displayName: 'vsTeam', label: 'vs Team' },
	]

	let selectedGroup = $state<MLB.StatGroupRef['displayName']>('hitting')
	let selectedType = $state(TYPES[0].displayName)

	$effect(() => {
		form?.requestSubmit()
	})
</script>

<form
	class="px-ch"
	method="POST"
	use:enhance={() => {
		return async ({ update }) => {
			await update({ reset: false })
		}
	}}
	bind:this={form}
	onchange={() => form?.requestSubmit()}
>
	<fieldset>
		<div class="flex items-center gap-x-ch">
			<legend>Group</legend>

			<select name="group" bind:value={selectedGroup}>
				{#each ['hitting', 'pitching', 'fielding'] as displayName (displayName)}
					<option value={displayName}>{displayName}</option>
				{/each}
			</select>
		</div>
	</fieldset>

	<fieldset>
		<div class="flex items-center gap-x-ch">
			<legend>Stats</legend>

			{#await fetchMLB<MLB.BaseballStat[]>('/api/v1/baseballStats') then baseballStats}
				{@const stats = baseballStats.filter(
					(s) =>
						s.statGroups.map((s) => s.displayName).includes(selectedGroup) &&
						ENABLED_BASEBALL_STATS.has(s.name),
				)}

				<div class="flex flex-wrap gap-x-ch">
					{#if stats.length}
						{#each stats as { lookupParam, name, isCounting } (name)}
							<label class="shrink-0 has-checked:text-accent">
								<input
									name="stats"
									type="checkbox"
									value={isCounting ? name || lookupParam : lookupParam || name}
								/>
								{name}
							</label>
						{/each}

						<button
							class="ml-auto link"
							type="button"
							onclick={(e) => {
								const radios =
									(e.target as HTMLElement)
										.closest('fieldset')
										?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? []
								const hasChecked = Array.from(radios).some((radio) => radio.checked)

								radios.forEach((radio) => {
									radio.checked = hasChecked ? false : true
								})

								form?.requestSubmit()
							}}>Toggle all</button
						>
					{/if}
				</div>
			{/await}
		</div>
	</fieldset>

	<fieldset>
		<div class="flex items-center gap-x-ch">
			<legend>Types</legend>
			<select name="type" bind:value={selectedType}>
				{#each TYPES as { displayName, label } (displayName)}
					<option value={displayName}>{label ?? displayName}</option>
				{/each}
			</select>
		</div>
	</fieldset>

	{#if TYPES.find((t) => t.displayName === selectedType)?.parameters}
		{@const { parameters } = TYPES.find((t) => t.displayName === selectedType) ?? {}}
		{#each parameters as { displayName, ...props } (displayName)}
			<fieldset>
				<div class="flex items-center gap-x-ch">
					<legend>{displayName}</legend>
					<label>
						<input name={displayName} {...props} />
					</label>
				</div>
			</fieldset>
		{/each}
	{/if}
</form>

<style>
	legend {
		position: sticky;
		top: var(--header-height);
		align-self: start;
	}

	select {
		height: 1lh;
	}
</style>
