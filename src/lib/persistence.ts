import type { SavedConfig, WorkoutConfig, AudioSettings } from './types';

const STORAGE_KEY = 'workout_timer_configs';
const SETTINGS_KEY = 'workout_timer_settings';
const MAX_SAVED = 10;

export function saveConfig(name: string, config: WorkoutConfig): SavedConfig[] {
	const configs = loadConfigs();
	
	const newConfig: SavedConfig = {
		id: Date.now().toString(),
		name,
		config,
		createdAt: Date.now()
	};

	configs.unshift(newConfig);
	
	const trimmed = configs.slice(0, MAX_SAVED);
	
	localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
	return trimmed;
}

export function loadConfigs(): SavedConfig[] {
	if (typeof window === 'undefined') return [];
	
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		
		const parsed = JSON.parse(stored);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		console.error('[Persistence] Failed to load configs:', error);
		return [];
	}
}

export function deleteConfig(id: string): SavedConfig[] {
	const configs = loadConfigs();
	const filtered = configs.filter(c => c.id !== id);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
	return filtered;
}

export function loadConfigById(id: string): WorkoutConfig | null {
	const configs = loadConfigs();
	const found = configs.find(c => c.id === id);
	return found ? found.config : null;
}

export function saveSettings(settings: AudioSettings): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings(): AudioSettings | null {
	if (typeof window === 'undefined') return null;
	try {
		const stored = localStorage.getItem(SETTINGS_KEY);
		if (!stored) return null;
		const parsed = JSON.parse(stored);
		if (typeof parsed === 'object' && parsed !== null) {
			return parsed as AudioSettings;
		}
		return null;
	} catch (error) {
		console.error('[Persistence] Failed to load settings:', error);
		return null;
	}
}