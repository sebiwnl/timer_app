import type { TimerState, WorkoutConfig, AudioSettings } from './types';
import { audio } from './audio';
import { voice } from './VoiceNotification.svelte';

const COUNTDOWN_DURATION = 5;

interface TimelineItem {
	type: 'countdown' | 'work' | 'pause';
	groupIndex: number;
	round: number;
	duration: number; // seconds
}

interface TimerEngine {
	state: TimerState;
	config: WorkoutConfig;
	settings: AudioSettings;
	start: () => void;
	pause: () => void;
	resume: () => void;
	reset: () => void;
	cleanup: () => void;
}

function buildTimeline(cfg: WorkoutConfig): TimelineItem[] {
	const timeline: TimelineItem[] = [];
	// global countdown first
	timeline.push({ type: 'countdown', groupIndex: 0, round: 0, duration: COUNTDOWN_DURATION });

	cfg.groups.forEach((g, gi) => {
		for (let r = 1; r <= g.rounds; r++) {
			timeline.push({ type: 'work', groupIndex: gi, round: r, duration: g.workSeconds });
			// add pause after each work phase if pauseSeconds > 0
			if (g.pauseSeconds > 0) {
				timeline.push({ type: 'pause', groupIndex: gi, round: r, duration: g.pauseSeconds });
			}
		}
	});

	return timeline;
}

export function createTimerEngine(cfg: WorkoutConfig, settings: AudioSettings): TimerEngine {
	const state = $state<TimerState>({
		status: 'idle',
		currentGroupIndex: 0,
		currentRound: 1,
		remainingSeconds: 0,
		totalElapsed: 0
	});

	let timeline = buildTimeline(cfg);
	let idx = 0; // current index into timeline
	let lastTime = 0;
	let raf: number | null = null;
	let warnedForCurrent = false;
	let pausedPrevStatus: TimerState['status'] = 'idle';
	// settingsRef is used inside the engine so runtime updates from the UI work
	let settingsRef: AudioSettings = settings;

	function setStateFromItem(item: TimelineItem) {
		state.currentGroupIndex = item.groupIndex;
		state.currentRound = item.round || 1;
		state.remainingSeconds = item.duration;
		state.status = item.type === 'countdown' ? 'countdown' : item.type === 'work' ? 'work' : 'pause';
		warnedForCurrent = false;
	}

	function tick(now: number) {
		if (lastTime === 0) lastTime = now;
		const delta = (now - lastTime) / 1000;
		lastTime = now;

		state.totalElapsed += delta;
		state.remainingSeconds -= delta;

		// 5-second warnings
		if (!warnedForCurrent && state.remainingSeconds <= 5 && state.remainingSeconds > 0) {
			warnedForCurrent = true;
			// determine next item
			const next = timeline[idx + 1];
			if (settingsRef.sound) {
				if (state.status === 'work' && next && next.type === 'pause') {
					voice.speakAtCountdown('pause', 5);
				} else if ((state.status === 'pause' || state.status === 'countdown') && next && next.type === 'work') {
					voice.speakAtCountdown('work', 5);
				}
			}
			if (settingsRef.vibration) audio.vibrate([50, 40]);
		}

		if (state.remainingSeconds <= 0) {
			// advance
			idx += 1;
			if (idx >= timeline.length) {
				// complete
				state.status = 'complete';
				state.remainingSeconds = 0;
				if (settingsRef.sound) voice.speak('Workout complete');
				if (settingsRef.vibration) audio.vibrate([200, 100, 200]);
				cancelLoop();
				return;
			}

			// play beep at exact switch
			if (settingsRef.sound) audio.playBeep();
			if (settingsRef.vibration) audio.vibrate(80);

			setStateFromItem(timeline[idx]);
		}

		raf = requestAnimationFrame(tick);
	}

	function start() {
		if (!cfg || cfg.groups.length === 0) return;
		// rebuild timeline in case cfg changed
		timeline = buildTimeline(cfg);
		idx = 0;
		setStateFromItem(timeline[0]);
		state.totalElapsed = 0;
		lastTime = 0;
		warnedForCurrent = false;
		if (settingsRef.sound) voice.speak('Starting workout');
		raf = requestAnimationFrame(tick);
	}

	function cancelLoop() {
		if (raf) {
			cancelAnimationFrame(raf);
			raf = null;
		}
	}

	function pause() {
		// preserve current remainingSeconds and status; set a distinct 'paused' status
		if (state.status === 'work' || state.status === 'pause' || state.status === 'countdown') {
			pausedPrevStatus = state.status;
			state.prevStatus = pausedPrevStatus;
			state.status = 'paused';
			cancelLoop();
		}
	}

	function resume() {
		if (state.status === 'paused' && state.remainingSeconds > 0) {
			// restore previous phase
			const restore = state.prevStatus || 'work';
			state.status = restore;
			state.prevStatus = undefined;
			lastTime = 0;
			raf = requestAnimationFrame(tick);
		}
	}

	function reset() {
		cancelLoop();
		timeline = buildTimeline(cfg);
		idx = 0;
		state.status = 'idle';
		state.currentGroupIndex = 0;
		state.currentRound = 1;
		state.remainingSeconds = 0;
		state.totalElapsed = 0;
		lastTime = 0;
		warnedForCurrent = false;
		pausedPrevStatus = 'idle';
		state.prevStatus = undefined;
	}

	const engine: TimerEngine & { updateSettings?: (s: AudioSettings) => void } = {
		state,
		config: cfg,
		settings: settingsRef,
		start,
		pause,
		resume,
		reset,
		cleanup: cancelLoop
	};

	engine.updateSettings = (s: AudioSettings) => {
		settingsRef = s;
		engine.settings = settingsRef;
	};

	return engine;
}