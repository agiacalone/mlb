<script lang="ts">
	import { count } from '$lib/utils'

	let {
		linescore,
		className,
	}: {
		linescore?: MLB.Linescore
		className?: string
	} = $props()
</script>

<dl
	class="mx-auto grid grid-cols-[auto_1fr] gap-[.25ch] leading-none {className}"
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
	{@const value = (linescore?.[key as keyof MLB.Linescore] ?? 0) as number}
	<dd class="flex items-center gap-[inherit]" title={count(value, key.slice(0, -1))}>
		{#each Array.from({ length: max }) as _, i (i)}
			<span
				class="inline-block aspect-square size-[.8lh] shrink-0 rounded-full bg-linear-to-b to-foreground/10 transition-colors dark:to-foreground/25"
				style:background={i < value ? color : undefined}
			></span>
		{/each}
	</dd>
{/snippet}
