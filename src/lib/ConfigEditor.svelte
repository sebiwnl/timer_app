<script lang="ts">
	import type { WorkoutConfig, RoundGroup } from "./types";
	import { appState } from "./state.svelte";
	import { formatDuration } from "./utils";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import PlayIcon from "@lucide/svelte/icons/play";
	import XIcon from "@lucide/svelte/icons/x";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import ClockIcon from "@lucide/svelte/icons/clock";

	interface Props {
		config: WorkoutConfig;
		isRunning: boolean;
		onUpdate: (config: WorkoutConfig) => void;
		onStart: () => void;
	}

	let { config, isRunning, onUpdate, onStart }: Props = $props();

	let configName = $state("");
	let editingGroupId = $state<string | null>(null);
	let initialized = false;

	// Set initial editing group ID only on first render
	$effect(() => {
		if (!initialized) {
			if (config.groups.length > 0) {
				editingGroupId = config.groups[0].id;
			}
			initialized = true;
		}
	});

	function addGroup() {
		if (isRunning) return;

		const newGroup: RoundGroup = {
			id: Date.now().toString(),
			rounds: 1,
			workSeconds: 30,
			pauseSeconds: 10,
		};

		onUpdate({
			...config,
			groups: [...config.groups, newGroup],
		});
		editingGroupId = newGroup.id;
	}

	function updateGroup(id: string, field: keyof RoundGroup, value: number) {
		if (isRunning) return;

		const updated = config.groups.map((g) => {
			if (g.id === id) {
				return { ...g, [field]: Math.max(1, value) };
			}
			return g;
		});

		onUpdate({ ...config, groups: updated });
	}

	function handleInput(id: string, field: keyof RoundGroup, e: Event) {
		const target = e.target as HTMLInputElement;
		const value = parseInt(target.value, 10);
		if (isNaN(value) || value < 0) return;
		updateGroup(id, field, value);
	}

	function removeGroup(id: string) {
		if (isRunning) return;

		const filtered = config.groups.filter((g) => g.id !== id);
		onUpdate({ ...config, groups: filtered });

		if (editingGroupId === id) {
			editingGroupId = null;
		}
	}

	function handleSave() {
		if (!configName.trim() || config.groups.length === 0) return;
		appState.saveCurrentConfig(configName.trim());
		configName = "";
	}

	function getTotalWorkoutDuration(): number {
		return config.groups.reduce((total, group) => {
			const groupDuration = group.rounds * group.workSeconds +
				(group.rounds - 1) * group.pauseSeconds;
			return total + groupDuration;
		}, 0);
	}
</script>

<div class="flex flex-col gap-6 w-full">
	{#if config.groups.length === 0}
		<!-- Empty State -->
		<div
			class="flex flex-col items-center justify-center py-16 text-center"
		>
			<div
				class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"
			>
				<ClockIcon class="w-8 h-8 text-muted-foreground" />
			</div>
			<h3 class="text-lg font-semibold text-foreground mb-1">
				No rounds yet
			</h3>
			<p class="text-sm text-muted-foreground mb-6">
				Add your first round group to get started
			</p>
			<button
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all active:scale-[0.98]"
				onclick={addGroup}
				disabled={isRunning}
			>
				<PlusIcon class="w-4 h-4" />
				Add Group
			</button>
		</div>
	{:else}
		<!-- Summary Bar -->
		<div
			class="flex justify-between items-center px-4 py-3 bg-muted/50 rounded-xl text-sm"
		>
			<span class="text-muted-foreground">
				{config.groups.length} group{config.groups.length > 1
					? "s"
					: ""}
			</span>
			<span class="font-medium tabular-nums">
				{formatDuration(getTotalWorkoutDuration())}
			</span>
		</div>

		<!-- Groups List -->
		<div class="flex flex-col gap-2">
			{#each config.groups as group, index (group.id)}
				{#if editingGroupId === group.id}
					<!-- Expanded/Editing Card -->
					<div
						class="bg-card rounded-xl p-5 border border-primary/30 shadow-sm transition-all"
						class:opacity-60={isRunning}
					>
						<div
							class="flex justify-between items-center mb-5 cursor-pointer active:scale-[0.99] transition-transform"
							role="button"
							tabindex="0"
							onclick={() => editingGroupId = null}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									editingGroupId = null;
								}
							}}
						>
							<span class="text-sm font-medium text-primary">
								Group {index + 1}
							</span>
							<button
								class="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
								onclick={(e) => {
									e.stopPropagation();
									removeGroup(group.id);
								}}
								disabled={isRunning}
								aria-label="Remove group"
							>
								<XIcon class="w-4 h-4" />
							</button>
						</div>

						<div class="grid grid-cols-3 gap-3">
							<label class="flex flex-col gap-1.5">
								<span
									class="text-xs font-medium text-muted-foreground"
									>Rounds</span
								>
								<input
									type="number"
									min="1"
									max="99"
									value={group.rounds}
									oninput={(e) =>
										handleInput(group.id, "rounds", e)}
									disabled={isRunning}
									class="h-10 px-3 rounded-lg text-center bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
								/>
							</label>

							<label class="flex flex-col gap-1.5">
								<span
									class="text-xs font-medium text-muted-foreground"
									>Work (s)</span
								>
								<input
									type="number"
									min="1"
									max="3600"
									value={group.workSeconds}
									oninput={(e) =>
										handleInput(group.id, "workSeconds", e)}
									disabled={isRunning}
									class="h-10 px-3 rounded-lg text-center bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
								/>
							</label>

							<label class="flex flex-col gap-1.5">
								<span
									class="text-xs font-medium text-muted-foreground"
									>Rest (s)</span
								>
								<input
									type="number"
									min="0"
									max="3600"
									value={group.pauseSeconds}
									oninput={(e) =>
										handleInput(
											group.id,
											"pauseSeconds",
											e,
										)}
									disabled={isRunning}
									class="h-10 px-3 rounded-lg text-center bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
								/>
							</label>
						</div>

						<div
							class="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground"
						>
							<span>Duration</span>
							<span
								class="font-medium text-foreground tabular-nums"
							>
								{formatDuration(
									group.rounds *
										(group.workSeconds +
											(group.rounds > 1
												? group.pauseSeconds
												: 0)),
								)}
							</span>
						</div>
					</div>
				{:else}
					<!-- Collapsed Card -->
					<button
						class="flex justify-between items-center p-4 bg-card hover:bg-accent/50 rounded-xl border border-border text-sm transition-all group active:scale-[0.99]"
						onclick={() =>
							!isRunning && (editingGroupId = group.id)}
						disabled={isRunning}
					>
						<div class="flex items-center gap-3">
							<span
								class="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors"
							>
								{index + 1}
							</span>
							<div class="flex flex-col items-start">
								<span class="font-medium text-foreground">
									{group.rounds} Round{group.rounds > 1
										? "s"
										: ""}
								</span>
								<span class="text-xs text-muted-foreground">
									{group.workSeconds}s work · {group.pauseSeconds}s
									rest
								</span>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<span
								class="text-xs font-medium text-muted-foreground tabular-nums"
							>
								{formatDuration(
									group.rounds *
										(group.workSeconds +
											(group.rounds > 1
												? group.pauseSeconds
												: 0)),
								)}
							</span>
							<ChevronRightIcon
								class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
							/>
						</div>
					</button>
				{/if}
			{/each}
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-3 justify-center pt-2">
			<button
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all active:scale-[0.98]"
				onclick={addGroup}
				disabled={isRunning}
			>
				<PlusIcon class="w-4 h-4" />
				Add Group
			</button>

			<button
				class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
				onclick={onStart}
				disabled={isRunning}
			>
				<PlayIcon class="w-4 h-4" />
				Start
			</button>
		</div>

		<!-- Save Section -->
		<div class="border-t border-border pt-6 mt-2">
			<form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="flex gap-2">
				<input
					type="text"
					placeholder="Workout name"
					bind:value={configName}
					disabled={isRunning}
					class="flex-1 h-10 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm"
				/>
				<button
					type="submit"
					disabled={isRunning || !configName.trim()}
					class="px-5 h-10 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30"
				>
					Save
				</button>
			</form>
		</div>
	{/if}
</div>
