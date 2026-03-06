<script lang="ts">
	import Logo from '$ui/team/logo.svelte'

	let {
		person,
	}: {
		person: MLB.Person & {
			drafts: MLB.DraftPick[]
		}
	} = $props()

	const draft = $derived(person.drafts?.[0])

	const { format } = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		notation: 'compact',
	})
</script>

{#if draft}
	<div class="relative flex shrink-0 flex-col items-center border-l border-stroke px-ch">
		<small class="absolute bottom-full left-1/2 -translate-x-1/2 text-xs text-current/50">
			Draft
		</small>

		<Logo class="size-[2lh] object-contain" team={draft.team as MLB.Team} />

		<span>
			<abbr class="text-xs" title="Round">Rd.</abbr>
			{draft.pickRound}

			<span class="text-current/50">/</span>

			#{draft.pickNumber}
		</span>

		<time class="text-xs text-current/50" datetime={draft.year}>
			{draft.year}
		</time>

		{#if draft.signingBonus}
			<span class="text-xs text-current/50" title="Signing Bonus">
				({format(Number(draft.signingBonus))})
			</span>
		{/if}
	</div>
{/if}
