<script lang="ts">
	import { colorSchemeStore } from '$ui/store.svelte'
</script>

<aside
	class="group/banner relative flex items-center gap-lh p-ch text-center leading-tight text-balance before:bg-accent/25 dark:text-accent"
>
	<p class="grow">
		<em>CSS Design Awards</em> Nominee —
		<a
			class="decoration-dashed group-hover/banner:underline"
			href="https://www.cssdesignawards.com/sites/mlb-live-scorebug/48948/"
		>
			Vote now!
			<span class="absolute inset-0"></span>
		</a>
	</p>

	<picture class="shrink-0">
		<source
			srcset="https://www.cssdesignawards.com/images/2024/monogram/cssda-nominee-white-vote.png"
			media={colorSchemeStore.colorScheme === 'dark' ? undefined : '()'}
		/>
		<img
			class="size-[3lh]"
			src="https://www.cssdesignawards.com/images/2024/monogram/cssda-nominee-dark-vote.png"
			alt=""
			width="220"
			height="220"
			draggable="false"
		/>
	</picture>
</aside>

<style>
	aside::before {
		position: absolute;
		inset: 1lh 0;
		z-index: -1;
	}
</style>
