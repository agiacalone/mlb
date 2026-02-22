<script lang="ts">
	import { enhance } from '$app/forms'
	import { fetchMLB } from '$lib/fetch'
	import { ENABLED_BASEBALL_STATS } from '$lib/stats'
	import { formatDate, getToday } from '$lib/temporal'
	import { compareStore } from '$ui/compare/store.svelte'
	import SeasonPicker from '$ui/stats/season-picker.svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	let form = $state<HTMLFormElement | null>(null)

	const PARAMETERS = {
		season: { displayName: 'season' },
		month: { displayName: 'month' },
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
		{
			displayName: 'byMonth',
			label: 'By month',
			parameters: [PARAMETERS.month],
		},
		{ displayName: 'vsTeam', label: 'vs Team' },
	]

	let selectedGroup = $state<MLB.StatGroupRef['displayName']>('hitting')
	let selectedType = $state(TYPES[0].displayName)

	$effect(() => {
		form?.requestSubmit()
	})
</script>

<form
	class="grid grid-cols-[auto_1fr] gap-x-ch gap-y-[.5ch] px-ch"
	method="POST"
	use:enhance={() => {
		return async ({ update }) => {
			await update({ reset: false })
		}
	}}
	bind:this={form}
	onchange={() => form?.requestSubmit()}
>
	<input type="hidden" name="ids" value={compareStore.ids.join(',')} />

	<fieldset class="contents">
		<div class="contents">
			<legend>Group</legend>

			<div>
				<select class="button" name="group" bind:value={selectedGroup}>
					{#each ['hitting', 'pitching', 'fielding'] as displayName (displayName)}
						<option value={displayName}>{displayName}</option>
					{/each}
				</select>
			</div>
		</div>
	</fieldset>

	<fieldset class="contents">
		<div class="contents">
			<legend>Stats</legend>

			{#await fetchMLB<MLB.BaseballStat[]>('/api/v1/baseballStats') then baseballStats}
				{@const stats = baseballStats.filter(
					(s) =>
						s.statGroups.map((s) => s.displayName).includes(selectedGroup) &&
						ENABLED_BASEBALL_STATS.has(s.name),
				)}

				<div class="overflow-y-auto border border-stroke max-sm:max-h-[7.5lh]">
					<div class="sticky top-0 w-full border-b border-stroke px-ch text-right backdrop-blur-xs">
						<button
							class="link"
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
					</div>

					{#if stats.length}
						<div class="px-ch py-[.5ch] *:break-inside-avoid sm:columns-[12ch]">
							{#each stats as { lookupParam, name, isCounting } (name)}
								<label
									class="mb-px flex items-baseline gap-ch p-[.5ch] leading-tight hover:bg-accent/15 has-checked:bg-accent/15 has-checked:text-accent"
								>
									<input
										class="shrink-0"
										name="stats"
										type="checkbox"
										value={isCounting ? name || lookupParam : lookupParam || name}
									/>

									<span>
										{#each name.split(/(?=[A-Z])/g) as word (word)}
											<span class="inline-block lowercase first:capitalize">{word}&nbsp;</span>
										{/each}
									</span>
								</label>
							{/each}
						</div>
					{/if}
				</div>
			{/await}
		</div>
	</fieldset>

	<fieldset class="contents">
		<div class="contents">
			<legend>Types</legend>
			<div>
				<select class="button" name="type" bind:value={selectedType}>
					{#each TYPES as { displayName, label } (displayName)}
						<option value={displayName}>{label ?? displayName}</option>
					{/each}
				</select>
			</div>
		</div>
	</fieldset>

	{#if TYPES.find((t) => t.displayName === selectedType)?.parameters}
		{@const { parameters } = TYPES.find((t) => t.displayName === selectedType) ?? {}}
		{#each parameters as { displayName, ...props } (displayName)}
			<fieldset class="contents">
				<div class="contents">
					<legend>{displayName}</legend>

					{#if displayName === 'season'}
						<SeasonPicker
							class="justify-start"
							name={displayName}
							onchange={() => form?.requestSubmit()}
						/>
					{:else if displayName === 'month'}
						<!-- <MonthPicker class="justify-start" name={displayName} buttons onNext={() => form?.requestSubmit()} onPrev={() => form?.requestSubmit()} /> -->
					{:else}
						<label>
							<input class="button" name={displayName} {...props} />
						</label>
					{/if}
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
