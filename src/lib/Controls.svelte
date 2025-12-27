<script lang="ts">
	import type { TimerState } from "./types";

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

<div class="flex gap-3 justify-center w-full">
	{#if state.status === "idle" && state.totalElapsed === 0}
		<button
			class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-bold min-w-[120px]"
			onclick={onStart}>Start</button
		>
	{:else if state.status === "countdown" || state.status === "work" || state.status === "pause"}
		<button
			class="bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-6 py-3 font-bold min-w-[120px]"
			onclick={onPause}>Pause</button
		>
	{:else if state.status === "paused"}
		<div class="flex flex-col gap-3 items-center w-full">
			<div class="flex gap-3 justify-center w-full">
				<button
					class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-bold flex-1 max-w-[160px]"
					onclick={onResume}>Resume</button
				>
				<button
					class="bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-6 py-3 font-bold flex-1 max-w-[160px]"
					onclick={onStart}>Restart</button
				>
			</div>
			<button
				class="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
				onclick={onStop}>Exit to Home</button
			>
		</div>
	{:else if state.status === "idle" && state.totalElapsed > 0}
		<button
			class="bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-6 py-3 font-bold"
			onclick={onResume}>Resume</button
		>
		<button
			class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-bold"
			onclick={onStart}>Start Over</button
		>
	{:else if state.status === "complete"}
		<button
			class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-bold"
			onclick={onReplay}>Replay</button
		>
	{/if}
</div>
