<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { appState } from "$lib/state.svelte";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import Volume2Icon from "@lucide/svelte/icons/volume-2";
	import VolumeXIcon from "@lucide/svelte/icons/volume-x";
	import VibrationIcon from "@lucide/svelte/icons/vibrate";
	import FolderIcon from "@lucide/svelte/icons/folder";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import TimerIcon from "@lucide/svelte/icons/timer";
	import LogInIcon from "@lucide/svelte/icons/log-in";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import User2Icon from "@lucide/svelte/icons/user-2";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();

	function handleLoad(id: string) {
		appState.loadSavedConfig(id);
	}

	function handleDelete(id: string) {
		appState.deleteSavedConfig(id);
	}
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header class="p-4">
		<div class="flex items-center gap-3">
			<div
				class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"
			>
				<TimerIcon class="w-5 h-5 text-primary" />
			</div>
			<span class="text-lg font-semibold tracking-tight">Timer</span>
		</div>
	</Sidebar.Header>

	<Sidebar.Content class="px-2">
		<!-- Saved Workouts -->
		<Sidebar.Group>
			<Sidebar.GroupLabel
				class="text-xs font-medium text-muted-foreground px-2 mb-1"
				>Saved</Sidebar.GroupLabel
			>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger class="w-full">
								{#snippet child({ props })}
									<Sidebar.MenuButton
										{...props}
										class="w-full justify-between rounded-lg"
									>
										<div class="flex items-center gap-2.5">
											<FolderIcon
												class="size-4 text-muted-foreground"
											/>
											<span class="font-medium"
												>Workouts</span
											>
										</div>
										<ChevronDownIcon
											class="size-4 text-muted-foreground"
										/>
									</Sidebar.MenuButton>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-56" align="start">
								{#if appState.savedConfigs.length === 0}
									<div
										class="p-4 text-center text-sm text-muted-foreground"
									>
										No saved workouts yet
									</div>
								{:else}
									{#each appState.savedConfigs as config (config.id)}
										<div
											class="flex items-center justify-between p-1"
										>
											<DropdownMenu.Item
												class="flex-1 font-medium cursor-pointer"
												onclick={() =>
													handleLoad(config.id)}
											>
												{config.name}
											</DropdownMenu.Item>
											<Button
												variant="ghost"
												size="icon"
												class="size-8 text-muted-foreground hover:text-destructive transition-colors"
												onclick={(e) => {
													e.stopPropagation();
													handleDelete(config.id);
												}}
											>
												<Trash2Icon class="size-4" />
											</Button>
										</div>
									{/each}
								{/if}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<!-- Settings -->
		<Sidebar.Group class="mt-4">
			<Sidebar.GroupLabel
				class="text-xs font-medium text-muted-foreground px-2 mb-1"
				>Settings</Sidebar.GroupLabel
			>
			<Sidebar.GroupContent class="space-y-1 px-2">
				<div
					class="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/50 transition-colors"
				>
					<div class="flex items-center gap-2.5">
						{#if appState.settings.sound}
							<Volume2Icon class="size-4 text-primary" />
						{:else}
							<VolumeXIcon class="size-4 text-muted-foreground" />
						{/if}
						<Label class="text-sm font-medium cursor-pointer"
							>Sound</Label
						>
					</div>
					<Switch
						checked={appState.settings.sound}
						onCheckedChange={(v) =>
							appState.updateSettings({ sound: v })}
					/>
				</div>

				<div
					class="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/50 transition-colors"
				>
					<div class="flex items-center gap-2.5">
						<VibrationIcon
							class="size-4 {appState.settings.vibration
								? 'text-primary'
								: 'text-muted-foreground'}"
						/>
						<Label class="text-sm font-medium cursor-pointer"
							>Vibration</Label
						>
					</div>
					<Switch
						checked={appState.settings.vibration}
						onCheckedChange={(v) =>
							appState.updateSettings({ vibration: v })}
					/>
				</div>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<!-- Sync Status -->
		{#if appState.user}
			<Sidebar.Group class="mt-4">
				<Sidebar.GroupLabel
					class="text-xs font-medium text-muted-foreground px-2 mb-1"
					>Sync</Sidebar.GroupLabel
				>
				<Sidebar.GroupContent class="space-y-1 px-2">
					{#if appState.syncState.loading}
						<div
							class="flex items-center gap-2 py-2 px-2 rounded-lg bg-accent/50"
						>
							<div
								class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
							></div>
							<span class="text-sm text-muted-foreground"
								>Syncing...</span
							>
						</div>
					{:else if appState.syncState.error}
						<div
							class="flex items-center gap-2 py-2 px-2 rounded-lg bg-destructive/10"
						>
							<div
								class="w-2 h-2 rounded-full bg-destructive"
							></div>
							<span
								class="text-sm text-destructive {appState.syncState.error.length > 30 ? 'text-xs' : ''}"
							>
								{appState.syncState.error}
							</span>
						</div>
					{:else if appState.syncState.lastSynced}
						<div
							class="flex items-center gap-2 py-2 px-2 rounded-lg"
						>
							<div
								class="w-2 h-2 rounded-full bg-green-500"
							></div>
							<span class="text-sm text-muted-foreground">
								Synced
								{new Date(appState.syncState.lastSynced).toLocaleTimeString()}
							</span>
						</div>
					{/if}
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>

	<Sidebar.Footer class="p-4">
		{#if appState.user}
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="w-full">
								{#snippet child({ props })}
								<Sidebar.MenuButton
									size="lg"
									class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									{...props}
								>
									<div
										class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
									>
										<User2Icon class="size-4" />
									</div>
									<div
										class="grid flex-1 text-left text-sm leading-tight"
									>
										<span class="truncate font-semibold"
											>{appState.userName || 'User'}</span
										>
										<span class="truncate text-xs"
											>{appState.userEmail}</span
										>
									</div>
									<ChevronsUpDownIcon
										class="ml-auto size-4"
									/>
								</Sidebar.MenuButton>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
							align="start"
							side="bottom"
							sideOffset={4}
						>
							<DropdownMenu.Label class="p-0 font-normal">
								<div
									class="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
								>
									<div
										class="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
									>
										<User2Icon class="size-4" />
									</div>
									<div
										class="grid flex-1 text-left text-sm leading-tight"
									>
										<span class="truncate font-semibold"
											>{appState.userName || 'User'}</span
										>
										<span class="truncate text-xs"
											>{appState.userEmail}</span
										>
									</div>
								</div>
							</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onclick={() => appState.logout()}
							>
								<LogOutIcon class="mr-2 size-4" />
								Log out
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		{:else}
			<div class="flex flex-col gap-2">
				<Button href="/login" variant="outline" class="w-full">
					<LogInIcon class="w-4 h-4 mr-2" />
					Login
				</Button>
				<p class="text-[10px] text-muted-foreground text-center px-1">
					Log in to save and sync your workout configurations.
				</p>
			</div>
		{/if}
	</Sidebar.Footer>
</Sidebar.Root>
