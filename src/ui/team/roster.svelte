<script lang="ts">
	import Headshot from '$ui/player/headshot.svelte'

	let { roster, coaches }: { roster: MLB.Roster[]; coaches: MLB.Coach[] } = $props()

	const batters = $derived(roster.filter(({ position }) => position.abbreviation !== 'P'))
	const pitchers = $derived(roster.filter(({ position }) => position.abbreviation === 'P'))

	function sort(arr: (MLB.Roster & { person: MLB.Person })[]) {
		return arr.sort(
			(a, b) => a.person.lastInitName?.localeCompare(b.person.lastInitName ?? '') ?? 0,
		)
	}
</script>

{@render list(batters, 'Batters')}
{@render list(pitchers, 'Pitchers')}

<dl class="accordion">
	<dt class="sticky-below-header z-1 mb-ch px-ch text-sm text-current/50 backdrop-blur-xs">
		Coaches
	</dt>

	<div class="grid px-rch max-sm:px-ch">
		{#each coaches as { person, jerseyNumber, job }}
			<dd class="col-span-full grid grid-cols-subgrid gap-x-ch">
				<a
					class="group/person col-span-full grid grid-cols-subgrid items-center gap-x-ch"
					href="/player/{person.id}"
				>
					<span class="inline-block text-center text-sm not-empty:before:content-['#']">
						{jerseyNumber}
					</span>

					<Headshot {person} size={36} class="size-lh shrink-0" />

					<span class="line-clamp-1 break-all decoration-dashed group-hover/person:underline">
						{(person as MLB.Person).lastInitName}
					</span>

					<span class="line-clamp-1 break-all">{job}</span>
				</a>
			</dd>
		{/each}
	</div>
</dl>

{#snippet list(arr: MLB.Roster[], label: string)}
	<dl>
		<dt class="sticky-below-header z-1 mb-ch px-ch text-sm text-current/50 backdrop-blur-xs">
			{label}
		</dt>

		<div class="grid px-rch max-sm:px-ch">
			{#each sort(arr) as { person, jerseyNumber, position }}
				<dd class="col-span-full grid grid-cols-subgrid gap-x-ch">
					<a
						class="group/person col-span-full grid grid-cols-subgrid items-center gap-x-ch"
						href="/player/{person.id}"
					>
						<span class="inline-block text-center text-sm not-empty:before:content-['#']">
							{jerseyNumber}
						</span>

						<span class="w-[3rch] text-center text-sm">{position.abbreviation}</span>

						<Headshot {person} size={36} class="size-lh shrink-0" />

						<span class="line-clamp-1 break-all decoration-dashed group-hover/person:underline">
							{(person as MLB.Person).lastInitName}
						</span>
					</a>
				</dd>
			{/each}
		</div>
	</dl>
{/snippet}

<style>
	dl > div {
		grid-template-columns: auto auto auto 1fr;
	}
</style>
