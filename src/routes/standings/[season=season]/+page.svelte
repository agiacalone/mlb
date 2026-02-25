<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { cn } from '$lib/utils'
	import Empty from '$ui/empty.svelte'
	import GameTypePicker from '$ui/game-type-picker.svelte'
	import Header from '$ui/header.svelte'
	import Metadata from '$ui/metadata.svelte'
	import SeasonPicker from '$ui/stats/season-picker.svelte'
	import StyledTeam from '$ui/team/styled-team.svelte'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	const leagueGroups = $derived(
		data.standings.records.reduce((acc, record) => {
			const id = record.league?.id ?? 0
			if (!acc.has(id)) acc.set(id, { name: record.league?.name ?? '', records: [] })
			acc.get(id)!.records.push(record)
			return acc
		}, new Map<number, { name: string; records: typeof data.standings.records }>()),
	)

	function sortOrder(
		a: (typeof data.standings.records)[number],
		b: (typeof data.standings.records)[number],
	) {
		return (a.division?.sortOrder ?? 0) - (b.division?.sortOrder ?? 0)
	}
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: `${page.params.season} MLB Standings`,
		url: `https://mlb.theohtani.com/standings/${page.params.season}`,
		itemListElement: data.standings.records.flatMap(({ division, teamRecords }) =>
			teamRecords.map(({ team, wins, losses, winningPercentage, leagueRank }) => ({
				'@type': 'ListItem',
				position: Number(leagueRank),
				name: `${team.name} (${wins}-${losses}, ${winningPercentage})`,
				item: {
					'@type': 'SportsTeam',
					name: team.name,
					url: `https://mlb.theohtani.com/teams/${team.id}`,
					description: `${division?.nameShort ?? 'MLB'} | ${wins}-${losses} | ${winningPercentage}`,
				},
			})),
		),
	})}<\/script>`}
</svelte:head>

<Metadata
	title="{page.params.season} MLB Standings | MLB.TheOhtani.com"
	description="MLB standings for the {page.params.season} season"
/>

<Header title="Standings" crumbs={[{ name: 'Standings' }]}>
	{#snippet after()}
		<div class="mx-auto flex flex-wrap items-center gap-ch text-center">
			<GameTypePicker class="button text-center" />
			<SeasonPicker
				onchange={(e) =>
					goto(`/standings/${(e.currentTarget as HTMLSelectElement).value}${page.url.search}`)}
			/>
		</div>
	{/snippet}
</Header>

<section class="grid gap-lh p-ch">
	{#each [...leagueGroups.entries()] as [leagueId, { name, records }] (leagueId)}
		<div class="flex flex-col gap-ch">
			<h2 class="px-ch text-sm text-current/50">{name}</h2>
			<div
				class={cn('grid items-start gap-[2lh]', {
					'sm:grid-cols-2 lg:grid-cols-3': records.length > 2,
					'sm:grid-cols-2': records.length === 2,
				})}
			>
				{#each records.sort(sortOrder) as { division, teamRecords }, i (division?.id ?? i)}
					<table class="w-full text-center">
						<thead>
							<tr class="text-sm text-current/50 *:font-normal">
								<th class="line-clamp-1 break-all text-foreground">
									{division?.nameShort}
								</th>
								<th class="w-[8ch]">W-L</th>
								<th class="w-[5ch]">%</th>
								<th class="w-[5ch]">GB</th>
								<th class="w-[5ch]">Strk</th>
								<th class="w-[5ch]">#</th>
							</tr>
						</thead>
						<tbody>
							{#each teamRecords as { team, wins, losses, winningPercentage, sportGamesBack, streak, leagueRank } (team.id)}
								<tr class="hover:[&>td]:bg-foreground/10">
									<td class="sticky left-0 min-w-lh @min-[8ch]:min-w-[3.5ch]">
										<StyledTeam class="text-left" {team} linked />
									</td>
									<td class="flex justify-center tabular-nums">
										<span class="positive">{wins}</span>
										-
										<span class="negative">{losses}</span>
									</td>
									<td
										class={cn(
											'tabular-nums',
											Number(winningPercentage) >= 0.5 ? 'positive' : 'negative',
										)}
									>
										{winningPercentage}
									</td>
									<td class={cn('tabular-nums', sportGamesBack === '-' && 'text-current/50')}>
										{sportGamesBack}
									</td>
									<td
										class="tabular-nums"
										class:positive={streak?.streakCode?.startsWith('W')}
										class:negative={streak?.streakCode?.startsWith('L')}
									>
										{streak?.streakCode}
									</td>
									<td class="tabular-nums">{leagueRank}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/each}
			</div>
		</div>
	{:else}
		<Empty>No standings</Empty>
	{/each}
</section>
