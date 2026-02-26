<script lang="ts">
	const IMAGES = ['cssda-special-kudos', 'cssda-best-ui', 'cssda-best-ux', 'cssda-best-inn']
</script>

<aside
	class="group/banner relative isolate mt-[1.5lh] flex flex-wrap items-center justify-center gap-x-lh gap-y-ch p-ch text-center leading-tight text-balance text-yellow-700 before:bg-amber-300/25 dark:text-amber-300"
>
	<p>
		<em>CSS Design Awards</em> —
		<a
			class="decoration-dashed group-hover/banner:underline"
			href="https://www.cssdesignawards.com/sites/mlb-live-scorebug/48948/"
		>
			<strong>Special Kudos + Best UI + Best UX + Best Innovation</strong>
			<span class="absolute inset-0 z-10"></span>
		</a>
	</p>

	<figure class="flex items-center *:not-first:-ml-ch">
		{#each IMAGES as image, i}
			<img
				class="size-[3lh]"
				style:z-index={IMAGES.length - i}
				src="/awards/{image}.png"
				alt=""
				width="220"
				height="220"
				draggable="false"
			/>
		{/each}
	</figure>
</aside>

<style>
	aside::before {
		position: absolute;
		inset: 1lh 0;
		z-index: -1;
	}
</style>
