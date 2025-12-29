<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import { appState } from "$lib/state.svelte";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { audio } from "$lib/audio";
	import Volume2Icon from "@lucide/svelte/icons/volume-2";
	import VolumeXIcon from "@lucide/svelte/icons/volume-x";
	import VibrationIcon from "@lucide/svelte/icons/vibrate";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import TimerIcon from "@lucide/svelte/icons/timer";
	import LogInIcon from "@lucide/svelte/icons/log-in";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import User2Icon from "@lucide/svelte/icons/user-2";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import MinusIcon from "@lucide/svelte/icons/minus";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();

	function handleLoad(id: string) {
		appState.loadConfigForEdit(id);
	}

	function handleDelete(id: string) {
		appState.deleteSavedConfig(id);
	}
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header class="p-4">
		<button
			class="flex items-center gap-3 w-full cursor-pointer hover:opacity-80 transition-opacity"
			onclick={() => appState.showList()}
		>
			<div
				class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"
			>
				<TimerIcon class="w-5 h-5 text-primary" />
			</div>
			<span class="text-lg font-semibold tracking-tight">Timer</span>
		</button>
	</Sidebar.Header>

	<div class="p-3">
		<Button class="w-full justify-start" onclick={() => appState.createNewTimer()}>
			<PlusIcon class="w-4 h-4 mr-2" />
			Create new timer
		</Button>
	</div>

	<Sidebar.Content class="px-2">
		<!-- Configuration -->
		<Sidebar.Group>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Collapsible.Root open={true} class="group/collapsible">
						<Collapsible.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton {...props}>
									Configuration
									<PlusIcon
										class="ms-auto group-data-[state=open]/collapsible:hidden"
									/>
									<MinusIcon
										class="ms-auto group-data-[state=closed]/collapsible:hidden"
									/>
								</Sidebar.MenuButton>
							{/snippet}
						</Collapsible.Trigger>
						{#if appState.savedConfigs.length === 0}
							<Collapsible.Content>
								<div
									class="px-2 py-3 text-center text-sm text-muted-foreground"
								>
									No saved workouts yet
								</div>
							</Collapsible.Content>
						{:else}
							<Collapsible.Content>
								<Sidebar.MenuSub>
									{#each appState.savedConfigs as config (config.id)}
										<Sidebar.MenuSubItem>
											<div
												class="flex items-center gap-1 pr-1"
											>
												<Sidebar.MenuSubButton
													class="flex-1"
													onclick={() =>
														handleLoad(
															config.id
														)}
												>
													{config.name}
												</Sidebar.MenuSubButton>
												<Button
													variant="ghost"
													size="icon"
													class="size-7 text-muted-foreground hover:text-destructive transition-colors shrink-0"
													onclick={(e) => {
														e.stopPropagation();
														handleDelete(
															config.id
														);
													}}
												>
													<Trash2Icon class="size-3.5" />
												</Button>
											</div>
										</Sidebar.MenuSubItem>
									{/each}
								</Sidebar.MenuSub>
							</Collapsible.Content>
						{/if}
					</Collapsible.Root>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Group>

		<!-- Settings -->
		<Sidebar.Group>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Collapsible.Root open={true} class="group/collapsible">
						<Collapsible.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton {...props}>
									Settings
									<PlusIcon
										class="ms-auto group-data-[state=open]/collapsible:hidden"
									/>
									<MinusIcon
										class="ms-auto group-data-[state=closed]/collapsible:hidden"
									/>
								</Sidebar.MenuButton>
							{/snippet}
						</Collapsible.Trigger>
						<Collapsible.Content>
							<Sidebar.MenuSub class="space-y-1">
								<Sidebar.MenuSubItem>
									<div
										class="flex items-center justify-between gap-1 pr-1"
									>
										{#if appState.settings.sound}
											<Volume2Icon
												class="size-4 text-primary"
											/>
										{:else}
											<VolumeXIcon
												class="size-4 text-muted-foreground"
											/>
										{/if}
										<Sidebar.MenuSubButton class="flex-1">
											Sound
										</Sidebar.MenuSubButton>
										<Switch
											checked={
												appState.settings.sound
											}
											onCheckedChange={(v) =>
												appState.updateSettings({
													sound: v
												})}
										/>
									</div>
								</Sidebar.MenuSubItem>
								{#if audio.supportsVibration}
									<Sidebar.MenuSubItem>
										<div
											class="flex items-center justify-between gap-1 pr-1"
										>
											<VibrationIcon
												class="size-4 {appState.settings
													.vibration
													? 'text-primary'
													: 'text-muted-foreground'}"
											/>
											<Sidebar.MenuSubButton class="flex-1">
												Vibration
											</Sidebar.MenuSubButton>
											<Switch
												checked={
													appState.settings.vibration
												}
												onCheckedChange={(v) =>
													appState.updateSettings({
														vibration: v
													})}
											/>
										</div>
									</Sidebar.MenuSubItem>
								{/if}
							</Sidebar.MenuSub>
						</Collapsible.Content>
					</Collapsible.Root>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Group>
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
										<div class="flex items-center gap-1.5">
											<span class="truncate font-semibold"
												>{appState.userName || 'User'}</span
											>
											{#if appState.syncState.loading}
												<div
													class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
													title="Syncing..."
												></div>
											{:else if appState.syncState.error}
												<div
													class="w-1.5 h-1.5 rounded-full bg-destructive"
													title={appState.syncState.error}
												></div>
											{:else if appState.syncState.lastSynced}
												<div
													class="w-1.5 h-1.5 rounded-full bg-green-500"
													title={`Synced ${new Date(appState.syncState.lastSynced).toLocaleTimeString()}`}
												></div>
											{/if}
										</div>
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
