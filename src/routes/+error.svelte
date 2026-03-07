<script lang="ts">
	import { page } from '$app/state'
	import Empty from '$ui/empty.svelte'
</script>

<section class="grid h-full place-content-center">
	<Empty>
		<p class="tabular-nums">{page.status}</p>

		{#if page.error?.message}
			<h1>{page.error?.message}</h1>
		{:else}
			<h1>An error occurred.</h1>
		{/if}

		<div class="flex items-center justify-center gap-ch text-foreground">
			<a class="link" href="/" data-sveltekit-reload>Return home</a>

			{#if page.status !== 404}
				<a class="link" href={page.url.toString()} data-sveltekit-reload>Try again</a>
			{/if}
		</div>
	</Empty>
</section>
