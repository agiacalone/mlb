<script lang="ts">
	import { cn } from '$lib/utils'

	let { liveGame }: { liveGame?: MLB.LiveGameFeed } = $props()

	const { description, eventType, rbi } = $derived(
		(liveGame?.liveData?.plays?.currentPlay?.result as unknown as MLB.PlayResult) ?? {},
	)

	const { isScoringPlay } = $derived(
		(liveGame?.liveData?.plays?.currentPlay?.about as unknown as MLB.PlayAbout) ?? {},
	)

	const hr = {
		1: 'Solo Home Run',
		2: '2-Run Home Run',
		3: '3-Run Home Run',
		4: 'Grand Slam',
	}
</script>

<div class="my-auto text-sm" style:grid-area="plays">
	{#if description}
		<!-- svelte-ignore a11y_distracting_elements -->
		<marquee class={cn('play', !isScoringPlay && 'positive dark:text-accent')}>
			{description}
		</marquee>

		{#if eventType === 'home_run'}
			<!-- svelte-ignore a11y_distracting_elements -->
			<div class="h-rlh bg-accent text-dark">
				<marquee
					class="animate-pulse font-pixel text-2xl leading-none font-semibold uppercase"
					direction="right"
				>
					{hr[rbi as keyof typeof hr]}
				</marquee>
			</div>
		{/if}
	{/if}
</div>

<style>
	.play {
		mask-image: linear-gradient(
			to right,
			transparent,
			black 1lh,
			black calc(100% - 1lh),
			transparent
		);
	}
</style>
