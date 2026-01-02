export class AudioService {
	private audioContext: AudioContext | null = null;
	supportsVibration: boolean;

	constructor() {
		this.supportsVibration = 'vibrate' in navigator;
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

	async playBeep(frequency = 880, duration = 0.1, type: OscillatorType = 'sine', volume = 0.2) {
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

			const now = ctx.currentTime;
			g.gain.setValueAtTime(0, now);
			g.gain.linearRampToValueAtTime(volume, now + 0.01);
			g.gain.exponentialRampToValueAtTime(0.001, now + duration);

			o.start(now);
			o.stop(now + duration + 0.05);
		} catch (e) {
			console.error('Audio playback failed', e);
		}
	}

	async playBeepCountdown(volume = 0.2) {
		try {
			const ctx = this.getContext();
			if (ctx.state === 'suspended') {
				await ctx.resume();
			}

			const now = ctx.currentTime;
			const beepDuration = 0.08;
			const gap = 0.85;

			const o1 = ctx.createOscillator();
			const g1 = ctx.createGain();
			o1.connect(g1);
			g1.connect(ctx.destination);
			o1.frequency.value = 660;
			o1.type = 'sine';
			g1.gain.setValueAtTime(0, now);
			g1.gain.linearRampToValueAtTime(volume, now + 0.01);
			g1.gain.exponentialRampToValueAtTime(0.001, now + beepDuration);
			o1.start(now);
			o1.stop(now + beepDuration + 0.05);

			const o2 = ctx.createOscillator();
			const g2 = ctx.createGain();
			o2.connect(g2);
			g2.connect(ctx.destination);
			o2.frequency.value = 660;
			o2.type = 'sine';
			g2.gain.setValueAtTime(0, now + gap);
			g2.gain.linearRampToValueAtTime(volume, now + gap + 0.01);
			g2.gain.exponentialRampToValueAtTime(0.001, now + gap + beepDuration);
			o2.start(now + gap);
			o2.stop(now + gap + beepDuration + 0.05);

			const o3 = ctx.createOscillator();
			const g3 = ctx.createGain();
			o3.connect(g3);
			g3.connect(ctx.destination);
			o3.frequency.value = 880;
			o3.type = 'sine';
			g3.gain.setValueAtTime(0, now + gap * 2);
			g3.gain.linearRampToValueAtTime(volume, now + gap * 2 + 0.01);
			g3.gain.exponentialRampToValueAtTime(0.001, now + gap * 2 + beepDuration);
			o3.start(now + gap * 2);
			o3.stop(now + gap * 2 + beepDuration + 0.05);
		} catch (e) {
			console.error('Audio playback failed', e);
		}
	}

	vibrate(pattern: number | number[]) {
		if ('vibrate' in navigator) {
			navigator.vibrate(pattern);
		}
	}
}

export const audio = new AudioService();