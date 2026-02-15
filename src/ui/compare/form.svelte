<script lang="ts">
	import { enhance } from '$app/forms'
	import { fetchMLB } from '$lib/fetch'

	let form = $state<HTMLFormElement | null>(null)

	async function fetchStatGroups() {
		return fetchMLB<{ displayName: string }[]>('/api/v1/statGroups')
	}

	const TYPES: {
		displayName: string
		parameters?: {
			displayName: string
			type: 'date'
		}[]
	}[] = [
		{ displayName: 'projected' },
		{ displayName: 'season', parameters: [{ displayName: 'season', type: 'date' }] },
		{ displayName: 'careerRegularSeason' },
		{ displayName: 'expectedStatistics' },
		{ displayName: 'vsTeam' },
		{
			displayName: 'byDateRange',
			parameters: [
				{ displayName: 'startDate', type: 'date' },
				{ displayName: 'endDate', type: 'date' },
			],
		},
		{ displayName: 'byMonth' },
		{ displayName: 'byDayOfWeek' },
	]

	let selectedGroup = $state<MLB.StatGroupRef['displayName']>('hitting')
	let selectedType = $state(TYPES[0])
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

			{#await fetchStatGroups() then statGroups}
				<select name="group" bind:value={selectedGroup}>
					{#each statGroups as { displayName } (displayName)}
						<option value={displayName}>{displayName}</option>
					{/each}
				</select>
			{/await}
		</div>
	</fieldset>

	<fieldset>
		<div class="flex items-center gap-x-ch">
			<legend>Stats</legend>

			{#await fetchMLB<MLB.BaseballStat[]>('/api/v1/baseballStats') then baseballStats}
				<div class="flex flex-wrap gap-x-ch">
					{#each baseballStats.filter((s) => s.statGroups
							.map((s) => s.displayName)
							.includes(selectedGroup)) as { name } (name)}
						<label class="shrink-0 has-checked:text-accent">
							<input name="stats" type="checkbox" value={name} />
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
				{#each TYPES as { displayName } (displayName)}
					<option value={displayName}>{displayName}</option>
				{/each}
			</select>
		</div>
	</fieldset>

	{#if selectedType.parameters}
		{#each selectedType.parameters as param (param.displayName)}
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
