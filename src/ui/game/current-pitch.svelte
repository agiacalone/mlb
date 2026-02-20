<script lang="ts">
	import { cn } from '$lib/utils'

	let { liveGame }: { liveGame?: MLB.LiveGameFeed } = $props()

	const pitch = $derived(
		liveGame?.liveData.plays.currentPlay?.playEvents?.filter((event) => event.isPitch).at(-1),
	)
</script>

{#key pitch?.index}
	<div class="border-dashed border-stroke text-xs" class:border-t={!!pitch}>
		{#if pitch}
			<p class="flex h-rlh anim-fade-to-r items-center justify-center gap-x-ch">
				<span
					class={cn(
						'inline-grid size-lh shrink-0 place-items-center rounded-full bg-foreground text-[10px] text-background',
						{
							'bg-accent text-dark': pitch.details?.isBall,
							'bg-yellow-300 text-dark': pitch.details?.isStrike,
							'bg-blue-500 text-light': pitch.details?.isInPlay,
						},
					)}
				>
					{(pitch.index ?? 0) + 1}
				</span>

				{#if pitch.details?.type?.description}
					<span class="line-clamp-1 break-all">{pitch.details?.type?.description}</span>
				{/if}

				{#if pitch.pitchData?.endSpeed}
					<span class="relative leading-none">
						{pitch.pitchData?.endSpeed}
						<small class="absolute top-full left-1/2 -translate-x-1/2 text-[7px]">mph</small>
					</span>
				{/if}

				<span
					class={cn('line-clamp-1 break-all', {
						positive: pitch.details?.isBall,
						'text-yellow-500 dark:text-yellow-200': pitch.details?.isStrike,
						'text-blue-500 dark:text-blue-300': pitch.details?.isInPlay,
						'text-red-500 dark:text-red-300':
							pitch.details?.isInPlay && pitch.details?.description.includes('out'),
					})}>{pitch.details?.call?.description}</span
				>
			</p>
		{/if}
	</div>
{/key}
