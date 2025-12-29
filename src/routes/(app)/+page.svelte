<script lang="ts">
	import { appState } from "$lib/state.svelte";
	import TimerList from "$lib/TimerList.svelte";
	import TimerEditor from "$lib/TimerEditor.svelte";
	import TimerRunner from "$lib/TimerRunner.svelte";
</script>

<svelte:head>
	<title>Workout Timer</title>
	<meta name="description" content="Minimal workout interval timer" />
</svelte:head>

<div
	class="min-h-[calc(100vh-2.5rem)] flex flex-col items-center justify-start sm:justify-center pt-2 sm:pt-0 px-4 sm:px-8 bg-background text-foreground"
>
	<div class="w-full max-w-lg">
		{#if appState.view === "list"}
			<TimerList />
		{:else if appState.view === "editor"}
			<TimerEditor />
		{:else if appState.view === "runner"}
			<TimerRunner />
		{/if}
	</div>
</div>
