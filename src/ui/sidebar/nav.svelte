<script lang="ts">
	import { dev } from '$app/environment'
	import { page } from '$app/state'
	import { formatDate, getToday } from '$lib/temporal'
	import { version } from '$pkg'
	import {
		ArrowsDiffIcon,
		CalendarIcon,
		CalendarTodayIcon,
		CodeIcon,
		FlagIcon,
		GithubIcon,
		HelmetIcon,
		JerseyIcon,
		JsonIcon,
		RankIcon,
		WBCIcon,
	} from '$ui/icons'
	import type { Component } from 'svelte'
	import CompareList from './compare-list.svelte'
	import Drawer from './drawer.svelte'
	import FavoritesList from './favorites-list.svelte'
	import GameCount from './game-count.svelte'
	import SpoilerPreventionList from './spoiler-prevention-list.svelte'
	import ToggleColorScheme from './toggle-color-scheme.svelte'

	const internalLinks: {
		href: string
		label: string
		icon: Component
		disabled?: boolean
	}[] = [
		{
			href: '/schedule/day',
			label: 'Daily Schedule',
			icon: CalendarTodayIcon,
		},
		{
			href: '/schedule/week',
			label: 'Weekly Schedule',
			icon: CalendarIcon,
		},
		{
			href: '/standings',
			label: 'Standings',
			icon: FlagIcon,
		},
		{
			href: '/stats',
			label: 'Stat Leaders',
			icon: RankIcon,
		},
		{
			href: '/teams',
			label: 'Teams',
			icon: JerseyIcon,
		},
		{
			href: '/player',
			label: 'Players',
			icon: HelmetIcon,
		},
		{
			href: '/transactions',
			label: 'Transactions',
			icon: ArrowsDiffIcon,
		},
		{
			href: '/api/v1',
			label: 'Stats API Playground',
			icon: JsonIcon,
			disabled: !dev,
		},
	]

	const externalLinks: {
		href: string
		label: string
		icon: Component
	}[] = [
		{
			href: 'https://github.com/nuotsu/mlb',
			label: 'View on GitHub',
			icon: GithubIcon,
		},
		{
			href: 'https://nuotsu.dev',
			label: 'Built by nuotsu',
			icon: CodeIcon,
		},
	]
</script>

<Drawer>
	<div class="flex h-full flex-col gap-ch">
		<div class="sm:sidebar-closed-hidden">
			<a class="flex items-center gap-ch" href="/">
				<figure class="relative size-4">
					<img
						class="absolute top-1/2 left-1/2 size-lh min-w-max -translate-1/2 rounded object-cover"
						src="/favicons/favicon-48x48.png"
						alt=""
						width={48}
						height={48}
						loading="eager"
						draggable="false"
					/>
				</figure>
				<div>
					<strong>MLB</strong><small>.TheOhtani.com</small>
				</div>
			</a>
		</div>

		<ul class="sidebar-not-open:landscape:max-lg:overflow-clip">
			{@render navLink({
				class: '[&_img]:size-4 positive',
				href: `/schedule/day/${formatDate(getToday(), { locale: 'en-CA' })}?sportId=51`,
				label: 'WBC Schedule',
				icon: WBCIcon,
			})}

			{#each internalLinks.filter(({ disabled }) => !disabled) as link (link.href)}
				{@render navLink(link)}
			{/each}
		</ul>

		<ul class="mt-auto text-sm *:py-[2px] sidebar-not-open:landscape:max-lg:overflow-clip">
			<li><CompareList /></li>
			<li><FavoritesList /></li>
			<li><SpoilerPreventionList /></li>
			<li><ToggleColorScheme /></li>
			{#each externalLinks as { href, label, icon: Icon } (href)}
				<li class="sm:sidebar-not-open:hidden">
					<a class="flex items-center gap-ch hover-link" {href}>
						<Icon />
						<span>{label}</span>
					</a>
				</li>
			{/each}
		</ul>

		<small
			class="font-semilight text-center text-[xx-small] text-current/50 sm:sidebar-not-open:hidden"
		>
			@ {new Date().getFullYear()} MLB.TheOhtani.com.
			<span class="tabular-nums">v{version}</span>
		</small>
	</div>
</Drawer>

{#snippet navLink({
	class: className,
	href,
	label,
	icon: Icon,
}: (typeof internalLinks)[number] & { class?: string })}
	<li class={className}>
		<a
			{href}
			class="group/link relative flex items-center gap-ch py-px"
			class:active={page.route.id?.startsWith(href)}
		>
			<Icon />

			<span class="grow decoration-dashed group-hover/link:underline sm:sidebar-closed-hidden">
				{label}
			</span>

			{#if href === '/schedule/day'}
				<GameCount />
			{:else if label.includes('WBC')}
				<GameCount sportId="51" />
			{/if}
		</a>
	</li>
{/snippet}

<style>
	div :global(svg) {
		flex-shrink: 0;
		width: 1em;
		height: 1em;
	}

	a,
	li > :global(*) {
		padding-inline: max(1ch, env(safe-area-inset-left)) 1ch;
	}

	.active::before {
		content: '';
		position: absolute;
		inset: 50% auto auto 0;
		translate: -50% -50%;
		width: 0.5ch;
		aspect-ratio: 1;
		border-radius: 100%;
		background-color: var(--color-accent);
	}
</style>
