<script lang="ts">
	import type { WorkoutConfig, RoundGroup } from './types';
	import { saveConfig, loadConfigs, deleteConfig, loadConfigById } from './persistence';

	interface Props {
		config: WorkoutConfig;
		isRunning: boolean;
		onUpdate: (config: WorkoutConfig) => void;
		onStart: () => void;
	}

	let { config, isRunning, onUpdate, onStart }: Props = $props();

	let savedConfigs = $state(loadConfigs());
	let configName = $state('');
	let showSaved = $state(false);

	function addGroup() {
		if (isRunning) return;
		
		const newGroup: RoundGroup = {
			id: Date.now().toString(),
			rounds: 1,
			workSeconds: 30,
			pauseSeconds: 10
		};
		
		onUpdate({
			...config,
			groups: [...config.groups, newGroup]
		});
	}

	function updateGroup(id: string, field: keyof RoundGroup, value: number) {
		if (isRunning) return;
		
		const updated = config.groups.map(g => {
			if (g.id === id) {
				return { ...g, [field]: Math.max(1, value) };
			}
			return g;
		});
		
		onUpdate({ ...config, groups: updated });
	}

	function handleInput(id: string, field: keyof RoundGroup, e: Event) {
		const target = e.target as HTMLInputElement;
		updateGroup(id, field, parseInt(target.value));
	}

	function removeGroup(id: string) {
		if (isRunning) return;
		
		const filtered = config.groups.filter(g => g.id !== id);
		onUpdate({ ...config, groups: filtered });
	}

	function handleSave() {
		if (!configName.trim() || config.groups.length === 0) return;
		
		saveConfig(configName.trim(), config);
		savedConfigs = loadConfigs();
		configName = '';
		showSaved = true;
	}

	function handleLoad(id: string) {
		const loaded = loadConfigById(id);
		if (loaded) {
			onUpdate(loaded);
			showSaved = false;
		}
	}

	function handleDelete(id: string) {
		deleteConfig(id);
		savedConfigs = loadConfigs();
	}

	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		if (mins > 0) {
			return `${mins}m ${secs}s`;
		}
		return `${secs}s`;
	}

	function getTotalWorkoutDuration(): number {
		return config.groups.reduce((total, group) => {
			const groupDuration = group.rounds * (group.workSeconds + (group.rounds > 1 ? group.pauseSeconds : 0));
			return total + groupDuration;
		}, 0);
	}
</script>

<div class="flex flex-col gap-4 w-full max-w-xl">
	{#if config.groups.length === 0}
		<div class="text-center p-8 text-gray-500 dark:text-gray-400">
			<p class="font-semibold">No rounds configured</p>
			<p class="text-sm mt-2 opacity-80">Click the "+" button to add your first round group</p>
		</div>
	{/if}

	{#if config.groups.length > 0}
		<div class="flex justify-between items-center p-3 bg-gray-100 dark:bg-slate-700 rounded-md text-sm">
			<strong>Total: {config.groups.length} group{config.groups.length > 1 ? 's' : ''}</strong>
			<span class="text-sm">{formatDuration(getTotalWorkoutDuration())}</span>
		</div>

		<div class="flex flex-col gap-3 w-full">
			{#each config.groups as group, index (group.id)}
				<div class="bg-gray-100 dark:bg-slate-700 rounded-md p-4 border border-gray-200 dark:border-slate-600" class:opacity-60={isRunning}>
					<div class="flex justify-between items-center mb-3">
						<span class="font-semibold">Group {index + 1}</span>
						<button class="text-red-600 hover:bg-red-600 hover:text-white rounded px-2" onclick={() => removeGroup(group.id)} disabled={isRunning} aria-label="Remove group">×</button>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
						<label class="flex flex-col text-xs text-gray-500 gap-1">
							<span>Rounds</span>
							<input type="number" min="1" max="99" value={group.rounds} oninput={(e) => handleInput(group.id, 'rounds', e)} disabled={isRunning} class="p-2 border rounded text-center bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600" />
						</label>

						<label class="flex flex-col text-xs text-gray-500 gap-1">
							<span>Work (s)</span>
							<input type="number" min="1" max="3600" value={group.workSeconds} oninput={(e) => handleInput(group.id, 'workSeconds', e)} disabled={isRunning} class="p-2 border rounded text-center bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600" />
						</label>

						<label class="flex flex-col text-xs text-gray-500 gap-1">
							<span>Pause (s)</span>
							<input type="number" min="0" max="3600" value={group.pauseSeconds} oninput={(e) => handleInput(group.id, 'pauseSeconds', e)} disabled={isRunning} class="p-2 border rounded text-center bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600" />
						</label>
					</div>

					{#if group.pauseSeconds > 0}
						<div class="mt-2 text-sm text-right text-gray-500">Per round: {formatDuration(group.workSeconds + group.pauseSeconds)}</div>
					{:else}
						<div class="mt-2 text-sm text-right text-gray-500">Per round: {formatDuration(group.workSeconds)}</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex gap-2 justify-center">
		<button class="px-4 py-2 rounded-md font-semibold bg-gray-200 dark:bg-slate-700" onclick={addGroup} disabled={isRunning} aria-label="Add group">+ Add Group</button>

		{#if config.groups.length > 0}
			<button class="px-4 py-2 rounded-md font-semibold bg-blue-600 text-white" onclick={onStart} disabled={isRunning}>Start Workout</button>
		{/if}
	</div>

	{#if config.groups.length > 0}
		<div class="save-section border-t border-gray-200 dark:border-slate-700 pt-3 mt-3">
			<div class="flex gap-2 mb-2">
				<input type="text" placeholder="Configuration name" bind:value={configName} disabled={isRunning} class="flex-1 p-2 border rounded bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600" />
				<button onclick={handleSave} disabled={isRunning || !configName.trim()} class="px-3 py-2 rounded bg-gray-200 dark:bg-slate-700 font-semibold">Save</button>
			</div>

				{#if savedConfigs.length > 0}
					<button class="px-3 py-1 rounded bg-gray-100 dark:bg-slate-800" onclick={() => showSaved = !showSaved}>{showSaved ? 'Hide' : 'Show'} Saved ({savedConfigs.length})</button>

				{#if showSaved}
					<div class="flex flex-col gap-2 mt-3">
						{#each savedConfigs as saved (saved.id)}
							<div class="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-600">
								<div class="flex flex-col">
									<strong>{saved.name}</strong>
									<span class="text-sm text-gray-500">{new Date(saved.createdAt).toLocaleDateString()}</span>
								</div>
								<div class="flex gap-2">
									<button class="px-2 py-1 rounded bg-gray-200 dark:bg-slate-700" onclick={() => handleLoad(saved.id)}>Load</button>
									<button class="px-2 py-1 rounded bg-red-600 text-white" onclick={() => handleDelete(saved.id)}>Delete</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{/if}

</div>
