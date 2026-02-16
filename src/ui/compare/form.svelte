<script lang="ts">
	import { enhance } from '$app/forms'
	import { fetchMLB } from '$lib/fetch'
	import { ENABLED_BASEBALL_STATS } from '$lib/stats'

	let form = $state<HTMLFormElement | null>(null)

	const TYPES: {
		displayName: string
		label?: string
		parameters?: {
			displayName: string
			type: string
		}[]
	}[] = [
		{
			displayName: 'season,seasonAdvanced',
			label: 'Season',
			parameters: [{ displayName: 'season', type: 'number' }],
		},
		{ displayName: 'careerRegularSeason,careerAdvanced', label: 'Career' },
		{
			displayName: 'projected',
			label: 'Projected',
			parameters: [{ displayName: 'season', type: 'number' }],
		},
		{
			displayName: 'byDateRange',
			label: 'By date range',
			parameters: [
				{ displayName: 'startDate', type: 'date' },
				{ displayName: 'endDate', type: 'date' },
			],
		},
		{ displayName: 'byMonth', label: 'By month' },
		{ displayName: 'byDayOfWeek', label: 'By day of week' },
		{ displayName: 'vsTeam', label: 'vs Team' },
	]

	let selectedGroup = $state<MLB.StatGroupRef['displayName']>('hitting')
	let selectedType = $state(TYPES[0].displayName)

	$effect(() => {
		form?.requestSubmit()
	})
</script>

<form
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
		{#each parameters as param (param.displayName)}
			<fieldset>
				<div class="flex items-center gap-x-ch">
					<legend>{param.displayName}</legend>
					<label>
						{param.displayName}
						<input name={param.displayName} type={param.type} />
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
