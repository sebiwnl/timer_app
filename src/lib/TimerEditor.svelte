<script lang="ts">
	import { audio } from "$lib/audio";
	import ConfigEditor from "$lib/ConfigEditor.svelte";
	import { appState } from "$lib/state.svelte";

	function updateConfig(newConfig: typeof appState.config) {
		appState.updateConfig(newConfig);
	}

	function handleStart() {
		if (appState.config.groups.length === 0) return;

		audio.init();
		appState.showRunner();
	}
</script>

<div class="flex flex-col gap-6 animate-in fade-in duration-500">
	<ConfigEditor
		config={appState.config}
		isRunning={false}
		onUpdate={updateConfig}
		onStart={handleStart}
	/>
</div>
