<script lang="ts">
	import { fetchMLB } from '$lib/fetch'
	import Loading from '$ui/loading.svelte'

	let {
		gamePk,
		alt,
	}: {
		gamePk: string
		alt?: string
	} = $props()

	async function fetchRecapImage() {
		const data = await fetchMLB<MLB.GameContent>(`/api/v1/game/${gamePk}/content`, {
			fields: 'editorial,recap,mlb,slug,photo,cuts,width,height,src,title,altText',
		})

		const { slug, photo } = data.editorial.recap.mlb

		const cuts = photo?.cuts

		return {
			slug,
			photo,
			cuts: cuts?.filter((cut) => cut.aspectRatio === '16:9'),
		}
	}
</script>

<figure class="grid gap-ch max-md:full-bleed">
	{#await fetchRecapImage()}
		<Loading class="mb-lh aspect-video justify-center bg-current/10 text-current/50">
			Loading image...
		</Loading>
	{:then { slug, photo, cuts }}
		<a href="/game/{gamePk}" class="transition-[filter] hover:brightness-110">
			<picture>
				{#each cuts as cut}
					<source srcset={cut.src} width={cut.width} height={cut.height} />
				{/each}
				<img
					class="aspect-video w-full"
					src={photo?.cuts[0].src}
					width={photo?.cuts[0].width}
					height={photo?.cuts[0].height}
					alt={alt || photo?.altText || photo?.title}
				/>
			</picture>
		</a>

		<figcaption class="text-center text-sm text-current/50">
			<cite>Source: <a href="https://www.mlb.com/news/{slug}">MLB</a></cite>
		</figcaption>
	{/await}
</figure>
