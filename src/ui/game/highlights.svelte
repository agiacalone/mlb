<script lang="ts">
	import Empty from '$ui/empty.svelte'
	import { CollapseHorizontalIcon, ExpandHorizontalIcon } from '$ui/icons'
	import Video from '$ui/video.svelte'
	import { untrack } from 'svelte'

	let {
		game: _game,
		content,
		theater = true,
	}: {
		game: MLB.Game
		content: MLB.GameContent
		theater?: boolean
	} = $props()

	$inspect(content)

	let highlights = $derived(content.highlights.highlights.items.filter((h) => h.type === 'video'))

	let selectedIndex = $state(
		untrack(() =>
			Math.max(
				0,
				content.highlights.highlights.items.findIndex((h) => h.type === 'video'),
			),
		),
	)

	let theaterMode = $state(false)
</script>

<svelte:window
	onkeydown={({ key }) => {
		if (key === 't') theaterMode = !theaterMode
	}}
/>

<article class="relative grid gap-ch text-center sm:px-ch">
	{#if highlights.length}
		<div class="flex items-center gap-ch">
			<select
				class="order-first button w-full"
				bind:value={selectedIndex}
				onchange={() => document.querySelectorAll('video')?.forEach((v) => v.pause())}
			>
				{#each highlights as { title }, i (title)}
					<option value={i}>{title}</option>
				{/each}
			</select>

			{#if theater}
				<label
					class="group/theater grid h-lh shrink-0 place-content-center not-hover:text-current/50 not-hover:transition-colors max-md:hidden"
					hidden={!content?.media?.epgAlternate}
					title="Theater mode (t)"
				>
					<input class="sr-only" id="theater-mode" type="checkbox" bind:checked={theaterMode} />
					<ExpandHorizontalIcon class="group-has-checked/theater:hidden" />
					<CollapseHorizontalIcon class="group-not-has-checked/theater:hidden" />
				</label>
			{/if}
		</div>

		{#each highlights as { playbacks, image }, i (i)}
			{#if selectedIndex === i}
				{@const poster = image?.cuts.find((cut) => cut.width <= 1280)?.src}

				<figure class="w-full space-y-ch text-balance italic transition-opacity starting:opacity-0">
					<Video
						class="aspect-video w-full bg-current/10"
						id={`highlights-${i}`}
						{playbacks}
						{poster}
					/>
				</figure>
			{/if}
		{/each}
	{:else}
		<Empty class="grow">No highlights</Empty>
	{/if}
</article>
