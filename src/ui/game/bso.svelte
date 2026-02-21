<script lang="ts">
	import { cn, count } from '$lib/utils'

	let {
		linescore,
		className,
	}: {
		linescore?: MLB.Linescore
		className?: string
	} = $props()

	const isMiddleOrEnd = $derived(['Middle', 'End'].includes(linescore?.inningState ?? ''))
</script>

<dl
	class={cn(
		'mx-auto mb-auto grid grid-cols-[auto_1fr] gap-[.25ch] leading-none',
		isMiddleOrEnd && '[&_dt]:opacity-40',
		className,
	)}
	class:opacity-25={isMiddleOrEnd}
	style:grid-area="bso"
>
	<dt><abbr title="Balls">B</abbr></dt>
	{@render indicators('balls', 3)}

	<dt><abbr title="Strikes">S</abbr></dt>
	{@render indicators('strikes', 2, 'var(--color-yellow-300)')}

	<dt><abbr title="Outs">O</abbr></dt>
	{@render indicators('outs', 2, 'var(--color-red-500)')}
</dl>

{#snippet indicators(key: string, max: number, color: string = 'var(--color-accent)')}
	{@const value = isMiddleOrEnd ? 0 : ((linescore?.[key as keyof MLB.Linescore] ?? 0) as number)}
	<dd class="flex items-center gap-[inherit]">
		{#each Array.from({ length: max }) as _, i (`${value} ${i}`)}
			<span
				class="inline-block aspect-square size-[.8lh] shrink-0 rounded-full bg-linear-to-b to-foreground/10 transition-colors dark:to-foreground/25"
				style:background={i < value ? color : undefined}
			></span>
		{/each}
	</dd>
{/snippet}
