<script lang="ts">
	import type { TimerState } from "./types";
	import PlayIcon from "@lucide/svelte/icons/play";
	import PauseIcon from "@lucide/svelte/icons/pause";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import HomeIcon from "@lucide/svelte/icons/home";

	interface Props {
		state: TimerState;
		onStart: () => void;
		onPause: () => void;
		onResume: () => void;
		onReplay: () => void;
		onStop: () => void;
	}

	let { state, onStart, onPause, onResume, onReplay, onStop }: Props =
		$props();
</script>

<div class="flex flex-col gap-3 items-center w-full">
	{#if state.status === "idle" && state.totalElapsed === 0}
		<button
			class="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
			onclick={onStart}
		>
			<PlayIcon class="w-5 h-5" />
			Start
		</button>
	{:else if state.status === "countdown" || state.status === "work" || state.status === "pause"}
		<button
			class="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all active:scale-[0.98]"
			onclick={onPause}
		>
			<PauseIcon class="w-5 h-5" />
			Pause
		</button>
	{:else if state.status === "paused"}
		<div class="flex gap-3">
			<button
				class="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
				onclick={onResume}
			>
				<PlayIcon class="w-5 h-5" />
				Resume
			</button>
			<button
				class="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all active:scale-[0.98]"
				onclick={onStart}
			>
				<RotateCcwIcon class="w-4 h-4" />
				Restart
			</button>
		</div>
		<button
			class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors mt-1"
			onclick={onStop}
		>
			<HomeIcon class="w-4 h-4" />
			Exit
		</button>
	{:else if state.status === "idle" && state.totalElapsed > 0}
		<div class="flex gap-3">
			<button
				class="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all active:scale-[0.98]"
				onclick={onResume}
			>
				Resume
			</button>
			<button
				class="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
				onclick={onStart}
			>
				Start Over
			</button>
		</div>
	{:else if state.status === "complete"}
		<div class="flex flex-col items-center gap-3">
			<button
				class="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
				onclick={onReplay}
			>
				<RotateCcwIcon class="w-4 h-4" />
				Replay
			</button>
			<button
				class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				onclick={onStop}
			>
				<HomeIcon class="w-4 h-4" />
				Back to Home
			</button>
		</div>
	{/if}
</div>
