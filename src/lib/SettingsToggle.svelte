<script lang="ts">
	import type { AudioSettings } from './types';

	interface Props {
		settings: AudioSettings;
		onChange: (settings: AudioSettings) => void;
	}

	let { settings, onChange }: Props = $props();

	function toggleSound() {
		onChange({ sound: true, vibration: false });
	}

	function toggleVibration() {
		onChange({ sound: false, vibration: true });
	}
</script>

<div class="flex gap-1">
  <button
	class={"w-9 h-9 flex items-center justify-center rounded-md " + (settings.sound ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100')}
	onclick={toggleSound}
	aria-label="Toggle sound"
	title="Sound"
  >
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
	  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
	  <path d="M15.54 8.46a7 7 0 0 1 0 9.9M17.5 4.5a11 11 0 0 1 0 15.08"></path>
	</svg>
  </button>

  <button
	class={"w-9 h-9 flex items-center justify-center rounded-md " + (settings.vibration ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100')}
	onclick={toggleVibration}
	aria-label="Toggle vibration"
	title="Vibration"
  >
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
	  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
	  <line x1="9" y1="9" x2="15" y2="9"></line>
	  <line x1="9" y1="13" x2="15" y2="13"></line>
	  <line x1="9" y1="17" x2="13" y2="17"></line>
	</svg>
  </button>
</div>