<script lang="ts">
	import { appState } from "$lib/state.svelte";
	import { formatDuration, calculateTotalDuration } from "$lib/utils";
	import { Button } from "$lib/components/ui/button/index.js";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import PlayIcon from "@lucide/svelte/icons/play";
	import EditIcon from "@lucide/svelte/icons/edit-2";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import ClockIcon from "@lucide/svelte/icons/clock";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

	function handleCreateNew() {
		appState.createNewTimer();
	}

	function handleLoad(id: string) {
		appState.loadConfigForEdit(id);
	}

	function handleDelete(id: string) {
		appState.deleteSavedConfig(id);
	}

	function handleQuickStart(id: string) {
		appState.loadConfigForEdit(id);
	}
</script>

<div class="flex flex-col gap-6 animate-in fade-in duration-500">
	<button
		class="w-full flex justify-between items-center p-4 bg-primary hover:bg-primary/90 rounded-xl border border-primary/30 text-primary-foreground transition-all group active:scale-[0.99]"
		onclick={handleCreateNew}
	>
		<div class="flex items-center gap-3">
			<div class="w-7 h-7 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
				<PlusIcon class="w-4 h-4" />
			</div>
			<span class="font-medium">Create new timer</span>
		</div>
		<ChevronRightIcon class="w-4 h-4 opacity-80" />
	</button>

	<div class="flex items-center gap-2">
		<h2 class="text-sm text-muted-foreground whitespace-nowrap">Saved timers</h2>
		<hr class="flex-1 border-border" />
	</div>

	{#if appState.savedConfigs.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<div class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
				<ClockIcon class="w-8 h-8 text-muted-foreground" />
			</div>
			<h3 class="text-lg font-semibold text-foreground mb-1">No timers yet</h3>
			<p class="text-sm text-muted-foreground mb-6">Create your first workout timer to get started</p>
		</div>
	{/if}

	{#if appState.savedConfigs.length > 0}
		<div class="flex flex-col gap-2">
			{#each appState.savedConfigs as config, index (config.id)}
				<div class="flex justify-between items-center p-4 bg-card hover:bg-accent/50 rounded-xl border border-border transition-all group">
					<div class="flex items-center gap-3 flex-1 cursor-pointer" onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleLoad(config.id);
						}
					}} role="button" tabindex="0" onclick={() => handleLoad(config.id)}>
						<div class="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
							{index + 1}
						</div>
						<div class="flex flex-col items-start flex-1">
							<span class="font-medium text-foreground">{config.name}</span>
							<span class="text-xs text-muted-foreground">
								{config.config.groups.length} group{config.config.groups.length > 1 ? "s" : ""} · {formatDuration(calculateTotalDuration(config.config.groups))}
							</span>
						</div>
					</div>

					<div class="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							class="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
							onclick={(e) => {
								e.stopPropagation();
								handleQuickStart(config.id);
							}}
							aria-label="Edit and start"
						>
							<EditIcon class="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							class="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
							onclick={(e) => {
								e.stopPropagation();
								handleDelete(config.id);
							}}
							aria-label="Delete timer"
						>
							<Trash2Icon class="w-4 h-4" />
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
