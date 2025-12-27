<script lang="ts">
	import type { WorkoutConfig, AudioSettings, TimerState } from "$lib/types";
	import { createTimerEngine } from "$lib/timer.svelte";
	import { audio } from "$lib/audio";
	import ConfigEditor from "$lib/ConfigEditor.svelte";
	import TimerDisplay from "$lib/TimerDisplay.svelte";
	import Controls from "$lib/Controls.svelte";
	import SettingsToggle from "$lib/SettingsToggle.svelte";

	// Configuration state
	let config = $state<WorkoutConfig>({
		groups: [],
	});

	// Audio settings
	let settings = $state<AudioSettings>({
		sound: true,
		vibration: false,
	});

	// Timer engine instance
	let timerEngine = $state<ReturnType<typeof createTimerEngine> | null>(null);

	// Derived timer state
	let timerState = $derived<TimerState>(
		timerEngine?.state || {
			status: "idle",
			currentGroupIndex: 0,
			currentRound: 1,
			remainingSeconds: 0,
			totalElapsed: 0,
		},
	);

	// UI state
	let isRunning = $derived(
		timerState.status !== "idle" && timerState.status !== "complete",
	);

	// Update config handler
	function updateConfig(newConfig: WorkoutConfig) {
		config = newConfig;
		// Reset timer engine if it exists
		if (timerEngine) {
			timerEngine.reset();
			timerEngine = null;
		}
	}

	// Update settings handler
	function updateSettings(newSettings: AudioSettings) {
		settings = newSettings;
		// Update existing engine if it exists (use provided API if available)
		if (timerEngine) {
			if (typeof (timerEngine as any).updateSettings === "function") {
				(timerEngine as any).updateSettings(newSettings);
			} else {
				(timerEngine as any).settings = newSettings;
			}
		}
	}

	// Start handler
	// Start handler
	function handleStart() {
		if (config.groups.length === 0) return;

		// Initialize audio context on user gesture
		audio.init();

		// Always reset and start fresh if requested
		if (timerEngine) {
			timerEngine.reset();
			timerEngine.start();
		} else {
			// Create new timer
			timerEngine = createTimerEngine(config, settings);
			timerEngine.start();
		}
	}

	// Stop/Exit handler
	function handleStop() {
		if (timerEngine) {
			timerEngine.reset();
			// Ensure we are truly idle
			// status should already be idle from reset(), but let's be safe
		}
	}

	// Pause handler
	function handlePause() {
		if (timerEngine) {
			timerEngine.pause();
		}
	}

	// Resume handler
	function handleResume() {
		if (timerEngine) {
			timerEngine.resume();
		}
	}

	// Replay handler
	function handleReplay() {
		if (timerEngine) {
			timerEngine.reset();
		}
		timerEngine = createTimerEngine(config, settings);
		timerEngine.start();
	}

	// Cleanup on destroy
	$effect(() => {
		return () => {
			if (timerEngine) {
				timerEngine.cleanup();
				timerEngine.reset();
			}
		};
	});
</script>

<svelte:head>
	<title>Workout Timer</title>
	<meta
		name="description"
		content="Minimal workout interval timer with Svelte 5"
	/>
</svelte:head>

<div
	class="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300"
>
	<header
		class="flex justify-between items-center px-6 py-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/50 dark:border-slate-800/50 supports-[backdrop-filter]:bg-white/50"
	>
		<div class="flex items-center gap-2">
			<!-- Simple Logo/Icon if needed -->
			<div
				class="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-sm"
			>
				T
			</div>
			<h1
				class="text-xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent"
			>
				Workout Timer
			</h1>
		</div>
		<SettingsToggle {settings} onChange={updateSettings} />
	</header>

	<main
		class="flex-1 flex flex-col items-center p-4 sm:p-8 gap-8 w-full max-w-2xl mx-auto animate-in fade-in duration-700"
	>
		<!-- Config Editor View -->
		{#if timerState.status === "idle"}
			<div class="w-full flex flex-col items-center gap-6">
				<ConfigEditor
					{config}
					{isRunning}
					onUpdate={updateConfig}
					onStart={handleStart}
				/>
			</div>
		{/if}

		<!-- Active Timer View -->
		{#if timerState.status !== "idle" && timerState.status !== "complete"}
			<div class="w-full flex flex-col items-center gap-8 py-4">
				<TimerDisplay state={timerState} {config} />
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

		<!-- Complete View -->
		{#if timerState.status === "complete"}
			<div class="w-full flex flex-col items-center gap-8 py-4">
				<TimerDisplay state={timerState} {config} />
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
	</main>
</div>
