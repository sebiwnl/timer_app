import type { SavedConfig, WorkoutConfig } from './types';

const STORAGE_KEY = 'workout_timer_configs';
const MAX_SAVED = 5;

export function saveConfig(name: string, config: WorkoutConfig): void {
	const configs = loadConfigs();
	
	const newConfig: SavedConfig = {
		id: Date.now().toString(),
		name,
		config,
		createdAt: Date.now()
	};

	configs.unshift(newConfig);
	
	// Keep only the latest MAX_SAVED configs
	const trimmed = configs.slice(0, MAX_SAVED);
	
	localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function loadConfigs(): SavedConfig[] {
	if (typeof window === 'undefined') return [];
	
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		
		const parsed = JSON.parse(stored);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function deleteConfig(id: string): void {
	const configs = loadConfigs();
	const filtered = configs.filter(c => c.id !== id);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function loadConfigById(id: string): WorkoutConfig | null {
	const configs = loadConfigs();
	const found = configs.find(c => c.id === id);
	return found ? found.config : null;
}