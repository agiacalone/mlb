<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	let {
		class: className,
		children,
	}: {
		children: Snippet
	} & HTMLAttributes<HTMLHeadingElement> = $props()
</script>

<h2 class="relative my-lh text-center text-sm {className}">
	<span class="relative bg-background px-ch text-current/50">
		{@render children()}
	</span>
</h2>

<style>
	h2::before {
		content: '';
		position: absolute;
		inset: 50% 0 auto;
		translate: auto -50%;
		margin-block: auto;
		border-bottom: 1px dashed var(--color-stroke);
	}
</style>
