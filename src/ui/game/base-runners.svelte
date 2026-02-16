<script lang="ts">
	import { cn } from '$lib/utils'

	let {
		className,
		linescore,
	}: {
		className?: string
		linescore?: MLB.Linescore
	} = $props()

	const { first, second, third } = $derived(linescore?.offense ?? {})

	const runners = $derived([first, second, third].map((r) => r?.fullName))
	const isTopOrBottom = $derived(['Top', 'Bottom'].includes(linescore?.inningState ?? ''))
</script>

<div class="grid rotate-45 grid-cols-2 gap-[.5ch] {className}">
	{#each Array.from({ length: 3 }) as _, base (runners[base] ?? base)}
		{@const runner = runners[base]}

		<div
			class={cn('aspect-square size-[1.25lh] border border-stroke transition-colors', {
				'order-2': base === 0,
				'order-1': base === 1,
				'order-3': base === 2,
				'border-accent/50': isTopOrBottom,
				'border-accent bg-accent': runner,
			})}
			title={runner
				? `${runner} on ${base === 0 ? '1st' : base === 1 ? '2nd' : '3rd'} base`
				: undefined}
		></div>
	{/each}
</div>
