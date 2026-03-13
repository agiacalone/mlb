<script lang="ts">
	import { page } from '$app/state'
</script>

<section class="grid h-full place-content-center p-ch text-center">
	<div
		class="m-auto flex flex-col place-content-center gap-ch border border-dashed border-stroke p-lh"
	>
		<span class="text-current/40">{':('}</span>

		<p class="text-current/40 tabular-nums">{page.status}</p>

		{#if page.error?.message}
			<h1>{page.error?.message}</h1>
		{:else}
			<h1>An error occurred.</h1>
		{/if}

		<hr class="border-dashed border-stroke" />

		<div class="flex items-center justify-center gap-lh text-foreground">
			<a class="link" href="/">Return home</a>

			{#if page.status !== 404}
				<a class="link" href={page.url.toString()}>Try again</a>
			{/if}
		</div>
	</div>
</section>
