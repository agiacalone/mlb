<script lang="ts">
	import { cn } from '$lib/utils'

	let { linescore }: { linescore?: MLB.Linescore } = $props()

	const isMiddleOrEnd = $derived(['Middle', 'End'].includes(linescore?.inningState ?? ''))
	const title = $derived(`${linescore?.inningState} ${linescore?.currentInningOrdinal}`)
</script>

{#key title}
	<b
		class={cn('flex anim-fade-to-r items-center gap-[.5ch]', !isMiddleOrEnd && 'mt-auto pt-lh')}
		{title}
	>
		{#if isMiddleOrEnd}
			<small class="text-xs">{linescore?.inningState?.slice(0, 3)}</small>
		{/if}

		{linescore?.currentInning}
	</b>
{/key}
