<script lang="ts">
	import type { TimerState, WorkoutConfig } from "./types";
	import { formatTime } from "./utils";

	interface Props {
		state: TimerState;
		config: WorkoutConfig;
	}

	let { state, config }: Props = $props();

	function getStatusLabel(): string {
		switch (state.status) {
			case "countdown":
				return "Get Ready";
			case "paused":
				return "Paused";
			case "work":
				return "Work";
			case "pause":
				return "Rest";
			case "complete":
				return "Complete";
			default:
				return "Ready";
		}
	}

	// Status colors using theme-aware classes
	function getStatusColorClass(): string {
		switch (state.status) {
			case "countdown":
				return "text-amber-500";
			case "work":
				return "text-emerald-500";
			case "pause":
				return "text-primary";
			case "paused":
				return "text-muted-foreground";
			case "complete":
				return "text-violet-500";
			default:
				return "text-muted-foreground";
		}
	}

	function getRingColor(): string {
		switch (state.status) {
			case "countdown":
				return "oklch(0.75 0.18 85)"; // warm amber
			case "work":
				return "oklch(0.70 0.18 155)"; // soft emerald
			case "pause":
				return "var(--primary)"; // theme primary
			case "paused":
				return "oklch(0.55 0.02 260)"; // muted
			case "complete":
				return "oklch(0.65 0.20 295)"; // soft violet
			default:
				return "oklch(0.55 0.02 260)";
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

		return Math.max(
			0,
			Math.min(1, 1 - state.remainingSeconds / totalDuration),
		);
	}

	// Ring configuration
	const R = 88;
	const C = 2 * Math.PI * R;

	function getDashArray() {
		return C;
	}

	function getDashOffset() {
		return C * getProgress();
	}
</script>

<div class="flex flex-col items-center justify-center w-full">
	<!-- Main Timer Ring -->
	<div class="relative flex items-center justify-center">
		<svg
			class="w-56 h-56 sm:w-72 sm:h-72 transform -rotate-90"
			viewBox="0 0 200 200"
		>
			<!-- Track -->
			<circle
				cx="100"
				cy="100"
				r={R}
				fill="none"
				stroke="currentColor"
				stroke-width="6"
				class="text-border"
			/>
			<!-- Progress -->
			<circle
				cx="100"
				cy="100"
				r={R}
				fill="none"
				stroke={getRingColor()}
				stroke-width="6"
				stroke-linecap="round"
				style="stroke-dasharray: {C}; stroke-dashoffset: {getDashOffset()}; transition: stroke-dashoffset 0.5s linear, stroke 0.3s ease;"
			/>
		</svg>

		<!-- Content Inside Ring -->
		<div class="absolute inset-0 flex flex-col items-center justify-center">
			{#if state.status === "complete"}
				<div class="text-center">
					<div class="text-4xl font-semibold text-violet-500">
						Done!
					</div>
				</div>
			{:else if state.status === "idle"}
				<div class="text-xl font-medium text-muted-foreground">
					Ready
				</div>
			{:else}
				<div class="flex flex-col items-center">
					<span
						class="text-sm font-medium mb-1 {getStatusColorClass()}"
					>
						{getStatusLabel()}
					</span>
					<div
						class="text-5xl sm:text-6xl font-semibold tabular-nums tracking-tight text-foreground"
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
			class="flex flex-col items-center gap-3 mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
		>
			<!-- Group and Round info -->
			<div
				class="inline-flex items-center bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm"
			>
				<div
					class="flex flex-col items-center px-4 border-r border-border"
				>
					<span
						class="text-[10px] uppercase text-muted-foreground font-medium tracking-wider"
						>Group</span
					>
					<span class="text-lg font-semibold tabular-nums">
						{state.currentGroupIndex + 1}
						<span class="text-muted-foreground text-sm font-normal"
							>/ {config.groups.length}</span
						>
					</span>
				</div>
				<div class="flex flex-col items-center px-4">
					<span
						class="text-[10px] uppercase text-muted-foreground font-medium tracking-wider"
						>Round</span
					>
					<span class="text-lg font-semibold tabular-nums">
						{state.currentRound}
						<span class="text-muted-foreground text-sm font-normal"
							>/ {config.groups[state.currentGroupIndex]
								?.rounds}</span
						>
					</span>
				</div>
			</div>

			<div class="text-xs text-muted-foreground tabular-nums">
				Elapsed: {formatTime(state.totalElapsed)}
			</div>
		</div>
	{/if}
</div>
