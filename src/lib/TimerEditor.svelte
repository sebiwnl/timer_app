<script lang="ts">
	import { audio } from "$lib/audio";
	import ConfigEditor from "$lib/ConfigEditor.svelte";
	import { appState } from "$lib/state.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import XIcon from "@lucide/svelte/icons/x";

	let isEditing = $derived(appState.editingConfigId !== null);
	let savedConfig = $derived(
		appState.editingConfigId
			? appState.savedConfigs.find((c) => c.id === appState.editingConfigId)
			: null
	);
	let title = $derived(isEditing && savedConfig ? savedConfig.name : "New Timer");

	function updateConfig(newConfig: typeof appState.config) {
		appState.updateConfig(newConfig);
	}

	function handleStart() {
		if (appState.config.groups.length === 0) return;

		audio.init();
		appState.showRunner();
	}

	function handleCancel() {
		appState.showList();
	}
</script>

<div class="flex flex-col gap-6 animate-in fade-in duration-500">
	<div class="flex items-center gap-4">
		<Button
			variant="ghost"
			size="icon"
			class="h-9 w-9"
			onclick={handleCancel}
		>
			<XIcon class="w-5 h-5" />
		</Button>
		<h1 class="text-xl font-bold text-foreground">{title}</h1>
	</div>

	<ConfigEditor
		config={appState.config}
		isRunning={false}
		onUpdate={updateConfig}
		onStart={handleStart}
	/>
</div>
