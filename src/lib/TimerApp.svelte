<script lang="ts">
    import type { TimerState } from "$lib/types";
    import { createTimerEngine } from "$lib/timer.svelte";
    import { audio } from "$lib/audio";
    import ConfigEditor from "$lib/ConfigEditor.svelte";
    import TimerDisplay from "$lib/TimerDisplay.svelte";
    import Controls from "$lib/Controls.svelte";
    import { appState } from "$lib/state.svelte";

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

    // Update config handler (now uses global state)
    function updateConfig(newConfig: typeof appState.config) {
        appState.updateConfig(newConfig);
        // Reset timer engine if it exists
        if (timerEngine) {
            timerEngine.reset();
            timerEngine = null;
        }
    }

    // Start handler
    function handleStart() {
        if (appState.config.groups.length === 0) return;

        // Initialize audio context on user gesture
        audio.init();

        // Always reset and start fresh if requested
        if (timerEngine) {
            timerEngine.reset();
            timerEngine.start();
        } else {
            // Create new timer
            timerEngine = createTimerEngine(appState.config, appState.settings);
            timerEngine.start();
        }
    }

    // Stop/Exit handler
    function handleStop() {
        if (timerEngine) {
            timerEngine.reset();
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
        timerEngine = createTimerEngine(appState.config, appState.settings);
        timerEngine.start();
    }

    // Update engine settings when global settings change
    $effect(() => {
        if (timerEngine) {
            timerEngine.updateSettings($state.snapshot(appState.settings));
        }
    });

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

<div
    class="min-h-[calc(100vh-2.5rem)] flex flex-col items-center justify-start sm:justify-center pt-2 sm:pt-0 px-4 sm:px-8 bg-background text-foreground"
>
    <!-- Config Editor View -->
    {#if timerState.status === "idle"}
        <div class="w-full max-w-lg animate-in fade-in duration-500">
            <ConfigEditor
                config={appState.config}
                {isRunning}
                onUpdate={updateConfig}
                onStart={handleStart}
            />
        </div>
    {/if}

    <!-- Active Timer View -->
    {#if timerState.status !== "idle" && timerState.status !== "complete"}
        <div
            class="w-full max-w-lg flex flex-col items-center gap-8 animate-in fade-in duration-500"
        >
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

    <!-- Complete View -->
    {#if timerState.status === "complete"}
        <div
            class="w-full max-w-lg flex flex-col items-center gap-8 animate-in fade-in duration-500"
        >
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
