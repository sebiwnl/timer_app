export class AudioService {
	private audioContext: AudioContext | null = null;

	constructor() {
		// Initialize lazily or on user interaction if needed
	}

	private getContext(): AudioContext {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		}
		return this.audioContext;
	}

	async init() {
		const ctx = this.getContext();
		if (ctx.state === 'suspended') {
			await ctx.resume();
		}
	}

	async playBeep(frequency = 880, duration = 0.1, type: OscillatorType = 'sine') {
		try {
			const ctx = this.getContext();
			if (ctx.state === 'suspended') {
				await ctx.resume();
			}

			const o = ctx.createOscillator();
			const g = ctx.createGain();

			o.connect(g);
			g.connect(ctx.destination);

			o.frequency.value = frequency;
			o.type = type;

			// Smooth attack and release to avoid clicks
			const now = ctx.currentTime;
			g.gain.setValueAtTime(0, now);
			g.gain.linearRampToValueAtTime(0.2, now + 0.01);
			g.gain.exponentialRampToValueAtTime(0.001, now + duration);

			o.start(now);
			o.stop(now + duration + 0.05); // slight buffer for release
		} catch (e) {
			console.error('Audio playback failed', e);
		}
	}

	speak(text: string) {
		if (!('speechSynthesis' in window)) return;

		// Cancel any existing speech
		speechSynthesis.cancel();

		const u = new SpeechSynthesisUtterance(text);
		u.rate = 1.1; // Slightly faster for workout context
		u.pitch = 1.0;
		u.volume = 1.0;

		// Ensure voices are loaded (Chrome weirdness)
		const voices = speechSynthesis.getVoices();
		if (voices.length > 0) {
			// Try to find a good English voice (e.g., Google US English, or just the first en-*)
			const preferred = voices.find(v => v.name.includes('Google US English')) ||
				voices.find(v => v.lang.startsWith('en')) ||
				voices[0];
			if (preferred) u.voice = preferred;
		}

		speechSynthesis.speak(u);
	}

	vibrate(pattern: number | number[]) {
		if ('vibrate' in navigator) {
			navigator.vibrate(pattern);
		}
	}
}

export const audio = new AudioService();