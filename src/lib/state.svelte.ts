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

    user = $state<{ name: string; email: string } | null>(null);

    login(name: string, email: string) {
        this.user = { name, email };
    }

    logout() {
        this.user = null;
    }

    updateConfig(newConfig: WorkoutConfig) {
        this.config = newConfig;
    }

    updateSettings(newSettings: Partial<AudioSettings>) {
        this.settings = { ...this.settings, ...newSettings };
    }

    saveCurrentConfig(name: string) {
        if (!name.trim() || this.config.groups.length === 0) return;
        this.savedConfigs = persistConfig(name.trim(), this.config);
    }

    deleteSavedConfig(id: string) {
        this.savedConfigs = persistDelete(id);
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
