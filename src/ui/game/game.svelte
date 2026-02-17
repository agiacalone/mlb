<script lang="ts">
	import { page } from '$app/state'
	import { fetchLiveMLB } from '$lib/fetch/live.svelte'
	import { fetchBoxscore, fetchLinescore } from '$lib/fetch/presets'
	import { cn } from '$lib/utils'
	import Linescore from '$ui/game/linescore.svelte'
	import ProbablePitchers from '$ui/game/probable-pitchers.svelte'
	import TeamScores from '$ui/game/team-scores.svelte'
	import Loading from '$ui/loading.svelte'
	import { spoilerPreventionStore } from '$ui/spoiler-prevention/store.svelte'
	import BaseRunners from './base-runners.svelte'
	import BSO from './bso.svelte'
	import Plays from './plays.svelte'
	import Status from './status.svelte'

	let {
		game,
		boxscore,
		linescore,
		showDescription,
		class: className = '',
	}: {
		game: MLB.Game
		boxscore?: MLB.Boxscore
		linescore?: MLB.Linescore
		showDescription?: boolean
		class?: string
	} = $props()

	const { flags } = $derived(game as unknown as { flags: MLB.GameFlags })

	const isFinal = $derived(game.status.abstractGameState === 'Final')
	const isLive = $derived(game.status.abstractGameState === 'Live')

	const { data: liveGame } = $derived(
		isLive
			? fetchLiveMLB<MLB.LiveGameFeed>(`/api/v1.1/game/${game.gamePk}/feed/live`, {
					fields: [
						'liveData,linescore',
						'fullName',
						'teams,away,home,runs',
						'balls,strikes,outs',
						'currentInning,currentInningOrdinal,inningState',
						'offense,first,second,third',
						'plays,currentPlay,result,description,eventType,rbi,about,isScoringPlay',
					],
					hydrate: 'flags,linescore',
				})
			: { data: undefined },
	)

	const isGamePage = $derived(page.url.pathname === `/game/${game.gamePk}`)

	const isSpoilerPrevented = $derived(
		spoilerPreventionStore.has(game.teams.away.team.id) ||
			spoilerPreventionStore.has(game.teams.home.team.id),
	)
</script>

<article
	class="group/game @container/game isolate grid items-end {className}"
	data-gamePk={game.gamePk}
	data-spoiler-prevented={isSpoilerPrevented || undefined}
>
	<div
		class={cn(
			'relative z-1 m-auto grid w-full text-center *:leading-none group-has-[[style*=linescore]]/game:h-12',
			(isLive || isFinal) && !isSpoilerPrevented && 'max-md:mt-rlh',
		)}
		style:grid-area="status"
	>
		<div
			class={cn(
				'absolute top-1/2 left-1/2 -z-1 -translate-1/2',
				isGamePage && game.status.abstractGameState !== 'Preview' && 'md:mt-1',
			)}
		>
			<BaseRunners
				className="w-max"
				linescore={!isSpoilerPrevented ? liveGame?.liveData?.linescore : undefined}
			/>
		</div>

		<Status {game} {liveGame} {linescore} {isSpoilerPrevented} />
	</div>

	<span
		class={cn(
			'group/description grid items-end text-center text-xs font-light *:col-span-full *:row-span-full *:line-clamp-1',
			(!isGamePage || (isGamePage && game.status.abstractGameState === 'Preview')) && 'min-h-rlh',
		)}
		style:grid-area="description"
	>
		{#if !isGamePage}
			{#if showDescription}
				{#if game.description}
					<span>{game.description}</span>
				{:else if game.seriesGameNumber && game.gamesInSeries && game.gamesInSeries > 1}
					<span class="text-current/50">
						Series {game.seriesGameNumber} of {game.gamesInSeries}
					</span>
				{/if}
			{/if}

			{#if !isSpoilerPrevented && (flags?.perfectGame || flags?.noHitter)}
				<strong
					class="border bg-background font-bold text-red-500 group-has-hover/description:hidden"
				>
					{#if flags.perfectGame}
						Perfect game
					{:else if flags.noHitter}
						No-hitter
					{/if}
				</strong>
			{/if}
		{/if}
	</span>

	<div class="relative z-1 bg-background has-data-loading:h-full" style:grid-area="boxscore">
		{#if boxscore}
			<TeamScores
				{game}
				{boxscore}
				linescore={liveGame?.liveData?.linescore}
				{isSpoilerPrevented}
			/>
		{:else}
			{#await fetchBoxscore(game.gamePk)}
				<Loading class="h-full justify-center" data-loading>Loading...</Loading>
			{:then data}
				<TeamScores
					{game}
					boxscore={data}
					linescore={liveGame?.liveData?.linescore}
					{isSpoilerPrevented}
				/>
			{/await}
		{/if}
	</div>

	{#if (isFinal || isLive) && !isSpoilerPrevented}
		{#if linescore}
			<Linescore {linescore} {game} />
		{:else}
			{#await fetchLinescore(game.gamePk) then data}
				<Linescore linescore={data} {game} />
			{/await}
		{/if}
	{:else if game.status.abstractGameState === 'Preview'}
		<ProbablePitchers {game} />
	{/if}

	{#if isLive && linescore && !isSpoilerPrevented}
		<BSO linescore={liveGame?.liveData?.linescore} className="mx-auto text-xs mt-ch" />
		<Plays {liveGame} />
	{/if}

	{#if !isGamePage}
		<div
			class="text-center text-xs font-light group-not-hover/game:transition-[translate,opacity] md:group-not-hover/game:-translate-y-full md:group-not-hover/game:opacity-0"
			style:grid-area="link"
		>
			<a
				class="inline-grid h-rlh place-content-center text-current/50 hover:text-current"
				href="/game/{game.gamePk}"
			>
				See details
			</a>
		</div>
	{/if}
</article>

<style>
	article {
		--status-size: 6ch;

		grid-template:
			'. description' auto
			'status boxscore' auto
			'. pregame' auto
			'. link' auto / var(--status-size) 1fr;

		&:global(:has([style*='linescore'])) {
			grid-template:
				'. description linescore' auto
				'status boxscore linescore' auto
				'bso . plays' auto
				'. link link' auto / var(--status-size) 1fr minmax(18ch, 50%);

			@media (width < 32rem) {
				grid-template:
					'. description description' auto
					'status boxscore linescore' auto
					'bso . .' auto
					'bso plays plays' auto
					'. link link' auto / var(--status-size) minmax(5.5ch, 1fr) 50%;
			}
		}
	}

	[style*='boxscore'] {
		clip-path: polygon(
			-1ch 0,
			100% 0,
			100% 100%,
			-1ch 100%,
			-1ch calc(50% + 1.5ch),
			0.4ch 50%,
			-1ch calc(50% - 1.5ch)
		);
	}
</style>
