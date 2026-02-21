<script lang="ts">
	import {
		fetchBoxscore,
		fetchfeedLive,
		fetchLinescore,
		fetchWinProbability,
	} from '$lib/fetch/presets'
	import { formatDate } from '$lib/temporal'
	import Boxscore from '$ui/game/boxscore.svelte'
	import Decision from '$ui/game/decision.svelte'
	import GameData from '$ui/game/game-data.svelte'
	import Game from '$ui/game/game.svelte'
	import Highlights from '$ui/game/highlights.svelte'
	import TopPerformers from '$ui/game/top-performers.svelte'
	import WinProbability from '$ui/game/win-probability.svelte'
	import Header from '$ui/header.svelte'
	import Metadata from '$ui/metadata.svelte'
	import { spoilerPreventionStore } from '$ui/spoiler-prevention/store.svelte'
	import type { PageProps } from './$types'

	let { data, params }: PageProps = $props()

	const game = $derived(data.game)
	const isLive = $derived(data.game?.status?.abstractGameState === 'Live')

	const [{ data: feedLive }, { data: linescore }, { data: boxscore }, { data: winProbability }] =
		$derived(
			isLive
				? [
						fetchfeedLive.live(params.gamePk),
						fetchLinescore.live(params.gamePk),
						fetchBoxscore.live(params.gamePk),
						fetchWinProbability.live(params.gamePk),
					]
				: [
						{ data: data.feedLive },
						{ data: data.feedLive?.liveData.linescore },
						{ data: data.boxscore },
						{ data: data.winProbability },
					],
		)

	const [away, home] = $derived([boxscore?.teams.away.team, boxscore?.teams.home.team])
	const date = $derived(
		formatDate(game?.gameDate, { year: 'numeric', month: 'short', day: 'numeric' }),
	)

	const hasTopPerformers = $derived(feedLive?.liveData.boxscore.topPerformers?.length)
	const hasDecisions = $derived(feedLive?.liveData.decisions)
	const hasBattingOrder = $derived(
		boxscore?.teams.away.battingOrder?.length || boxscore?.teams.home.battingOrder?.length,
	)

	const isSpoilerPrevented = $derived(
		spoilerPreventionStore.has(away?.id!) || spoilerPreventionStore.has(home?.id!),
	)
</script>

<svelte:head>
	<link rel="preconnect" href="https://mlb-cuts-diamond.mlb.com" />
</svelte:head>

<Metadata
	title="{[away?.clubName, home?.clubName].join(' @ ')} ({date}) | MLB.TheOhtani.com"
	description="Game details for {[away?.name, home?.name].join(' at ')} on {date}"
/>

<Header
	class="max-sm:px-0 max-sm:[&_nav]:pl-ch"
	crumbs={[
		{
			href: `/schedule/week/${formatDate(game?.gameDate, { locale: 'en-CA' })}`,
			name: 'Weekly Schedule',
		},
		{
			href: `/schedule/day/${formatDate(game?.gameDate, { locale: 'en-CA' })}`,
			name: formatDate(game?.gameDate, { weekday: 'short', month: 'short', day: 'numeric' }),
		},
		{ name: `${away?.abbreviation} @ ${home?.abbreviation}` },
	]}
>
	{#if game}
		<Game class="w-full" {game} {boxscore} {linescore} showLiveDetails />
	{/if}
</Header>

<section class="space-y-lh py-lh">
	{#if !isSpoilerPrevented}
		{#if hasTopPerformers || hasDecisions}
			<div class="flex flex-wrap items-start gap-ch px-ch *:grow">
				{#if hasTopPerformers && feedLive}
					<TopPerformers {feedLive} />
				{/if}

				{#if hasDecisions && feedLive}
					<Decision {feedLive} />
				{/if}
			</div>
		{/if}

		{#if Array.isArray(winProbability)}
			<WinProbability {winProbability} {boxscore} {linescore} />
		{/if}
	{/if}

	<article
		class="group/details grid items-center gap-y-lh md:has-[#theater-mode:not(:checked)]:grid-cols-2"
	>
		{#if data.game?.status?.abstractGameState === 'Final' && !isSpoilerPrevented}
			<Highlights {game} content={data.content} />
		{/if}

		{#if hasBattingOrder}
			<Boxscore {boxscore} {isSpoilerPrevented} />
		{/if}

		{#if game && feedLive}
			<GameData {game} {feedLive} />
		{/if}
	</article>
</section>

<style>
	section {
		padding-bottom: max(1ch, env(safe-area-inset-bottom));
	}
</style>
