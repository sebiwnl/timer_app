<script lang="ts">
	import { createTimerEngine } from "$lib/timer.svelte";
	import { appState } from "$lib/state.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import TimerDisplay from "$lib/TimerDisplay.svelte";
	import Controls from "$lib/Controls.svelte";
	import XIcon from "@lucide/svelte/icons/x";
	import type { TimerState } from "$lib/types";

	let timerEngine = $state<ReturnType<typeof createTimerEngine> | null>(null);

	let timerState = $derived<TimerState>(
		timerEngine?.state || {
			status: "idle",
			currentGroupIndex: 0,
			currentRound: 1,
			remainingSeconds: 0,
			totalElapsed: 0,
		},
	);

	function initializeTimer() {
		if (!timerEngine && appState.config.groups.length > 0) {
			timerEngine = createTimerEngine(appState.config, appState.settings);
			timerEngine.start();
		}
	}

	function handleStart() {
		if (appState.config.groups.length === 0) return;

		if (timerEngine) {
			timerEngine.reset();
			timerEngine.start();
		} else {
			timerEngine = createTimerEngine(appState.config, appState.settings);
			timerEngine.start();
		}
	}

	function handleStop() {
		if (timerEngine) {
			timerEngine.reset();
		}
		appState.showList();
	}

	function handlePause() {
		if (timerEngine) {
			timerEngine.pause();
		}
	}

	function handleResume() {
		if (timerEngine) {
			timerEngine.resume();
		}
	}

	function handleReplay() {
		if (timerEngine) {
			timerEngine.reset();
		}
		timerEngine = createTimerEngine(appState.config, appState.settings);
		timerEngine.start();
	}

	function handleExit() {
		if (timerEngine) {
			timerEngine.reset();
		}
		appState.showList();
	}

	$effect(() => {
		if (appState.view === 'runner' && appState.config.groups.length > 0) {
			initializeTimer();
		}
	});

	$effect(() => {
		if (timerEngine) {
			timerEngine.updateSettings($state.snapshot(appState.settings));
		}
	});

	$effect(() => {
		return () => {
			if (timerEngine) {
				timerEngine.cleanup();
				timerEngine.reset();
			}
		};
	});
</script>

<div class="flex flex-col gap-6 animate-in fade-in duration-500">
	<div class="flex items-center gap-4">
		<Button
			variant="ghost"
			size="icon"
			class="h-9 w-9"
			onclick={handleExit}
		>
			<XIcon class="w-5 h-5" />
		</Button>
		<h1 class="text-xl font-bold text-foreground">Running Timer</h1>
	</div>

	{#if timerState.status !== "idle" && timerState.status !== "complete"}
		<div class="flex flex-col items-center gap-8">
			<TimerDisplay state={timerState} config={appState.config} />
			<Controls
				state={timerState}
				onStart={handleStart}
				onPause={handlePause}
				onResume={handleResume}
				onReplay={handleReplay}
				onStop={handleStop}
			/>
		</div>
	{:else if timerState.status === "complete"}
		<div class="flex flex-col items-center gap-8">
			<TimerDisplay state={timerState} config={appState.config} />
			<Controls
				state={timerState}
				onStart={handleStart}
				onPause={handlePause}
				onResume={handleResume}
				onReplay={handleReplay}
				onStop={handleStop}
			/>
		</div>
	{/if}
</div>
