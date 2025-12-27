<script lang="ts">
	import type { TimerState, WorkoutConfig } from "./types";

	interface Props {
		state: TimerState;
		config: WorkoutConfig;
	}

	let { state, config }: Props = $props();

	function formatTime(seconds: number): string {
		const remaining = Math.max(0, Math.ceil(seconds));
		const mins = Math.floor(remaining / 60);
		const secs = remaining % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}

	function getStatusLabel(): string {
		switch (state.status) {
			case "countdown":
				return "GET READY";
			case "paused":
				return "PAUSED";
			case "work":
				return "WORK";
			case "pause":
				return "REST";
			case "complete":
				return "COMPLETE";
			default:
				return "READY";
		}
	}

	// Status colors for text/UI
	function getStatusColorClass(): string {
		switch (state.status) {
			case "countdown":
				return "text-amber-500 dark:text-amber-400";
			case "work":
				return "text-emerald-500 dark:text-emerald-400";
			case "pause":
				return "text-blue-500 dark:text-blue-400";
			case "paused":
				return "text-gray-500 dark:text-gray-400";
			case "complete":
				return "text-purple-500 dark:text-purple-400";
			default:
				return "text-gray-400";
		}
	}

	function getRingColor(): string {
		switch (state.status) {
			case "countdown":
				return "#f59e0b"; // amber-500
			case "work":
				return "#10b981"; // emerald-500
			case "pause":
				return "#3b82f6"; // blue-500
			case "paused":
				return "#6b7280"; // gray-500
			case "complete":
				return "#8b5cf6"; // purple-500
			default:
				return "#9ca3af";
		}
	}

	function getProgress(): number {
		if (state.status === "idle") return 0;
		if (state.status === "complete") return 1;

		const group = config.groups[state.currentGroupIndex];
		if (!group) return 0;

		let totalDuration = 0;
		let phase = state.status;

		// If paused, show progress based on the phase we paused in
		if (phase === "paused" && state.prevStatus) {
			phase = state.prevStatus;
		}

		if (phase === "countdown") totalDuration = 5;
		else if (phase === "work") totalDuration = group.workSeconds;
		else if (phase === "pause") totalDuration = group.pauseSeconds;

		if (totalDuration <= 0) return 0;

		// Calculate progress (0 to 1)
		// We want the ring to depleate, so start full (0) and go to empty (1)
		// Or start full and go to empty. Let's do: Full circle = total duration.
		// Remaining decrases, so we want the stroke to shrink.
		return Math.max(
			0,
			Math.min(1, 1 - state.remainingSeconds / totalDuration),
		);
	}

	// Ring configuration
	const R = 88;
	const C = 2 * Math.PI * R; // Circumference

	function getDashArray() {
		return C;
	}

	function getDashOffset() {
		// Progress 0 -> offset 0 (full)
		// Progress 1 -> offset C (empty)
		// However, we want it to shrink, so we want the DASH to be the remaining part?
		// Usually: stroke-dasharray: C; stroke-dashoffset: C * (1-p)
		// If p=1 (full), offset=0. If p=0 (empty), offset=C
		// Our getProgress returns 0 (start) -> 1 (end).
		// So at start (0), we want full ring -> offset 0?
		// Actually typical timer: Starts full, eats away.
		// So at progress 0 (time full), ring is full (offset 0).
		// At progress 1 (time 0), ring is empty (offset C).
		return C * getProgress();
	}
</script>

<div class="flex flex-col items-center justify-center w-full py-4">
	<!-- Main Timer Ring -->
	<div class="relative flex items-center justify-center">
		<!-- SVG Ring -->
		<svg
			class="w-64 h-64 sm:w-80 sm:h-80 transform -rotate-90 drop-shadow-lg"
			viewBox="0 0 200 200"
		>
			<!-- Track -->
			<circle
				cx="100"
				cy="100"
				r={R}
				fill="none"
				stroke="currentColor"
				stroke-width="8"
				class="text-gray-200 dark:text-slate-800"
			/>
			<!-- Progress -->
			<circle
				cx="100"
				cy="100"
				r={R}
				fill="none"
				stroke={getRingColor()}
				stroke-width="8"
				stroke-linecap="round"
				style="stroke-dasharray: {C}; stroke-dashoffset: {getDashOffset()}; transition: stroke-dashoffset 0.5s linear, stroke 0.3s ease;"
			/>
		</svg>

		<!-- Content Inside Ring -->
		<div class="absolute inset-0 flex flex-col items-center justify-center">
			{#if state.status === "complete"}
				<div
					class="text-4xl font-bold {getStatusColorClass()} animate-bounce"
				>
					Done!
				</div>
			{:else if state.status === "idle"}
				<div
					class="text-2xl font-semibold text-gray-400 uppercase tracking-widest"
				>
					Ready
				</div>
			{:else}
				<div class="flex flex-col items-center">
					<span
						class="text-sm font-bold uppercase tracking-widest mb-1 {getStatusColorClass()}"
					>
						{getStatusLabel()}
					</span>
					<div
						class="text-6xl sm:text-7xl font-black tabular-nums tracking-tighter text-gray-800 dark:text-gray-100"
					>
						{formatTime(state.remainingSeconds)}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Info / Meta -->
	{#if state.status !== "idle" && state.status !== "complete"}
		<div
			class="flex flex-col items-center gap-2 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
		>
			<!-- Current Interval Info -->
			<div
				class="flex items-center text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700"
			>
				<div
					class="flex flex-col items-center px-4 border-r border-gray-200 dark:border-slate-700"
				>
					<span class="text-xs uppercase text-gray-400 font-bold"
						>Group</span
					>
					<span class="text-xl font-bold"
						>{state.currentGroupIndex + 1}<span
							class="text-gray-400 text-sm font-normal"
							>/{config.groups.length}</span
						></span
					>
				</div>
				<div class="flex flex-col items-center px-4">
					<span class="text-xs uppercase text-gray-400 font-bold"
						>Round</span
					>
					<span class="text-xl font-bold"
						>{state.currentRound}<span
							class="text-gray-400 text-sm font-normal"
							>/{config.groups[state.currentGroupIndex]
								?.rounds}</span
						></span
					>
				</div>
			</div>

			<div class="text-xs font-mono text-gray-400 mt-2">
				TOTAL ELAPSED: {formatTime(state.totalElapsed)}
			</div>
		</div>
	{/if}
</div>
