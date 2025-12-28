import { loadConfigs, saveConfig as persistConfig, deleteConfig as persistDelete } from './persistence';
import type { WorkoutConfig, AudioSettings, SavedConfig } from './types';

class GlobalState {
    config = $state<WorkoutConfig>({
        groups: []
    });

    settings = $state<AudioSettings>({
        sound: true,
        vibration: false
    });

    savedConfigs = $state<SavedConfig[]>(loadConfigs());

    updateConfig(newConfig: WorkoutConfig) {
        this.config = newConfig;
    }

    updateSettings(newSettings: Partial<AudioSettings>) {
        this.settings = { ...this.settings, ...newSettings };
    }

    saveCurrentConfig(name: string) {
        if (!name.trim() || this.config.groups.length === 0) return;
        persistConfig(name.trim(), this.config);
        this.savedConfigs = loadConfigs();
    }

    deleteSavedConfig(id: string) {
        persistDelete(id);
        this.savedConfigs = loadConfigs();
    }

    loadSavedConfig(id: string) {
        const configs = loadConfigs();
        const found = configs.find(c => c.id === id);
        if (found) {
            this.config = { ...found.config };
            return true;
        }
        return false;
    }
}

export const appState = new GlobalState();
