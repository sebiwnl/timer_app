export interface VoicePreferences {
	rate?: number;
	pitch?: number;
	volume?: number;
	voiceName?: string;
	voiceLang?: string;
}

export interface VoiceOptions extends VoicePreferences {
	immediate?: boolean;
}

const VOICES_LOAD_TIMEOUT = 5000;

export class VoiceNotificationService {
	private voices: SpeechSynthesisVoice[] = [];
	private voicesLoaded = false;
	private isSpeaking = false;
	private pendingQueue: string[] = [];
	private voicesLoadTimer: number | null = null;
	private voicesChangedHandler: (() => void) | null = null;
	
	private preferences: VoicePreferences = {
		rate: 1.1,
		pitch: 1.0,
		volume: 1.0
	};

	constructor() {
		this.initializeVoices();
	}

	private initializeVoices() {
		if (typeof window === 'undefined') return;
		if (!('speechSynthesis' in window)) {
			return;
		}

		const voices = speechSynthesis.getVoices();
		
		if (voices.length > 0) {
			this.voices = voices;
			this.voicesLoaded = true;
		} else {
			this.voicesChangedHandler = () => this.handleVoicesChanged();
			speechSynthesis.onvoiceschanged = this.voicesChangedHandler;
			
			this.voicesLoadTimer = window.setTimeout(() => {
				this.forceLoadVoices();
			}, VOICES_LOAD_TIMEOUT);
		}
	}

	private handleVoicesChanged() {
		this.voices = speechSynthesis.getVoices();
		if (this.voices.length > 0) {
			this.voicesLoaded = true;
			this.clearLoadListeners();
			this.processPendingQueue();
		}
	}

	private forceLoadVoices() {
		this.voices = speechSynthesis.getVoices();
		this.voicesLoaded = true;
		this.clearLoadListeners();
		this.processPendingQueue();
	}

	private clearLoadListeners() {
		if (this.voicesLoadTimer !== null) {
			clearTimeout(this.voicesLoadTimer);
			this.voicesLoadTimer = null;
		}
		if (this.voicesChangedHandler) {
			speechSynthesis.onvoiceschanged = null;
			this.voicesChangedHandler = null;
		}
	}

	cleanup() {
		this.cancel();
		this.clearLoadListeners();
	}

	private getBestVoice(): SpeechSynthesisVoice | null {
		if (this.voices.length === 0) return null;

		const preferred = this.preferences.voiceName;
		const preferredLang = this.preferences.voiceLang;

		if (preferred) {
			const found = this.voices.find(v => v.name === preferred);
			if (found) return found;
		}

		if (preferredLang) {
			const found = this.voices.find(v => v.lang.startsWith(preferredLang));
			if (found) return found;
		}

		const googleUS = this.voices.find(v => v.name.includes('Google US English'));
		if (googleUS) return googleUS;

		const english = this.voices.find(v => v.lang.startsWith('en'));
		if (english) return english;

		return this.voices[0];
	}

	private processPendingQueue() {
		while (this.pendingQueue.length > 0 && !this.isSpeaking) {
			const message = this.pendingQueue.shift();
			if (message) {
				this.speakInternal(message);
			}
		}
	}

	private speakInternal(text: string) {
		if (typeof window === 'undefined') return;
		if (!this.voicesLoaded || this.isSpeaking) {
			this.pendingQueue.push(text);
			return;
		}

		this.isSpeaking = true;

		speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.rate = this.preferences.rate ?? 1.1;
		utterance.pitch = this.preferences.pitch ?? 1.0;
		utterance.volume = this.preferences.volume ?? 1.0;

		const voice = this.getBestVoice();
		if (voice) {
			utterance.voice = voice;
		}

		utterance.onend = () => {
			this.isSpeaking = false;
			this.processPendingQueue();
		};

		utterance.onerror = (event) => {
			console.error('[VoiceNotification] Speech error:', event.error);
			this.isSpeaking = false;
			this.processPendingQueue();
		};

		speechSynthesis.speak(utterance);
	}

	speak(message: string, options: VoiceOptions = {}) {
		if (typeof window === 'undefined') return;
		if (!('speechSynthesis' in window)) {
			console.warn('[VoiceNotification] Speech synthesis not supported');
			return;
		}

		if (options.immediate) {
			speechSynthesis.cancel();
			this.pendingQueue = [];
		}

		if (options.rate !== undefined) this.preferences.rate = options.rate;
		if (options.pitch !== undefined) this.preferences.pitch = options.pitch;
		if (options.volume !== undefined) this.preferences.volume = options.volume;

		this.speakInternal(message);
	}

	speakAtCountdown(type: 'work' | 'pause', seconds: number) {
		if (seconds <= 0) return;
		
		const phase = type === 'work' ? 'Work' : 'Rest';
		const message = `${phase} in ${seconds} seconds`;
		this.speak(message);
	}

	setVoicePreferences(preferences: VoicePreferences) {
		this.preferences = { ...this.preferences, ...preferences };
	}

	getAvailableVoices(): SpeechSynthesisVoice[] {
		return [...this.voices];
	}

	isReady(): boolean {
		if (typeof window === 'undefined') return false;
		return this.voicesLoaded;
	}

	cancel() {
		if (typeof window === 'undefined') return;
		speechSynthesis.cancel();
		this.pendingQueue = [];
		this.isSpeaking = false;
	}
}

export const voice = new VoiceNotificationService();
