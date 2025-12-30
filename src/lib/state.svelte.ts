import { loadConfigs, saveConfig as persistConfig, deleteConfig as persistDelete } from './persistence';
import type { WorkoutConfig, AudioSettings, SavedConfig } from './types';
import { supabase } from './supabaseClient';
import type { User, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import {
	fetchConfigsFromSupabase,
	saveConfigToSupabase,
	deleteConfigFromSupabase,
	convertDatabaseConfig
} from './configSync';

type AppView = 'list' | 'editor' | 'runner';

class GlobalState {
    view = $state<AppView>('list');
    editingConfigId = $state<string | null>(null);

    config = $state<WorkoutConfig>({
        groups: []
    });

    settings = $state<AudioSettings>({
        sound: true,
        vibration: false
    });

    savedConfigs = $state<SavedConfig[]>(loadConfigs());

    user = $state<User | null>(null);

    authLoading = $state(false);

    authError = $state<string | null>(null);

    syncState = $state({
        loading: false,
        lastSynced: null as number | null,
        error: null as string | null
    });

    async initializeSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error loading session:', error);
            return;
        }
        if (session?.user) {
            this.user = session.user;
            await this.loadConfigsFromSupabase();
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                this.user = session?.user ?? null;
                if (session?.user) {
                    await this.loadConfigsFromSupabase();
                }
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.syncState.error = null;
            } else if (event === 'USER_UPDATED') {
                this.user = session?.user ?? null;
            }
        });
    }

    async loadConfigsFromSupabase() {
        if (!this.user?.id) return;

        this.syncState.loading = true;
        this.syncState.error = null;

        try {
            const dbConfigs = await fetchConfigsFromSupabase(this.user.id);
            const savedConfigs = dbConfigs.map(convertDatabaseConfig);
            this.savedConfigs = savedConfigs.slice(0, 10);

            localStorage.setItem('workout_timer_configs', JSON.stringify(this.savedConfigs));
            this.syncState.lastSynced = Date.now();
        } catch (error) {
            console.error('[State] Failed to load configs from Supabase:', error);
            this.syncState.error = 'Failed to sync configs. Using local data.';
        } finally {
            this.syncState.loading = false;
        }
    }

    async login(email: string, password: string) {
        this.authLoading = true;
        this.authError = null;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                this.authError = this.getAuthErrorMessage(error);
                return false;
            }

            if (data.user) {
                this.user = data.user;
                return true;
            }

            return false;
        } catch (error) {
            this.authError = 'An unexpected error occurred';
            console.error('Login error:', error);
            return false;
        } finally {
            this.authLoading = false;
        }
    }

    async signup(name: string, email: string, password: string) {
        this.authLoading = true;
        this.authError = null;

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name
                    }
                }
            });

            if (error) {
                this.authError = this.getAuthErrorMessage(error);
                return false;
            }

            if (data.user) {
                if (data.user.email_confirmed_at) {
                    this.user = data.user;
                    return true;
                }
                return 'email_confirmation';
            }

            return false;
        } catch (error) {
            this.authError = 'An unexpected error occurred';
            console.error('Signup error:', error);
            return false;
        } finally {
            this.authLoading = false;
        }
    }

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
        }
        this.user = null;
    }

    async resetPassword(email: string) {
        this.authLoading = true;
        this.authError = null;

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);

            if (error) {
                this.authError = this.getAuthErrorMessage(error);
                return false;
            }

            return true;
        } catch (error) {
            this.authError = 'An unexpected error occurred';
            console.error('Reset password error:', error);
            return false;
        } finally {
            this.authLoading = false;
        }
    }

    getAuthErrorMessage(error: SupabaseAuthError): string {
        switch (error.message) {
            case 'Invalid login credentials':
                return 'Invalid email or password';
            case 'Email not confirmed':
                return 'Please verify your email before logging in';
            case 'User already registered':
                return 'An account with this email already exists';
            case 'Password should be at least 6 characters':
                return 'Password must be at least 6 characters';
            case 'Unable to validate email address: invalid format':
                return 'Please enter a valid email address';
            default:
                return error.message || 'An authentication error occurred';
        }
    }

    clearAuthError() {
        this.authError = null;
    }

    get userName(): string | null {
        return this.user?.user_metadata?.name || this.user?.email || null;
    }

    get userEmail(): string | null {
        return this.user?.email || null;
    }

    get currentViewTitle(): string {
        if (this.view === 'list') return 'Timers';
        if (this.view === 'runner') return 'Running Timer';
        if (this.view === 'editor') {
            const config = this.editingConfigId
                ? this.savedConfigs.find(c => c.id === this.editingConfigId)
                : null;
            return config?.name || 'New Timer';
        }
        return '';
    }

    updateConfig(newConfig: WorkoutConfig) {
        this.config = newConfig;
    }

    updateSettings(newSettings: Partial<AudioSettings>) {
        this.settings = { ...this.settings, ...newSettings };
    }

    async saveCurrentConfig(name: string) {
        if (!name.trim() || this.config.groups.length === 0) return;

        const trimmedName = name.trim();
        const configCopy = { ...this.config };

        const configs = [...this.savedConfigs];
        const newConfig: SavedConfig = {
            id: Date.now().toString(),
            name: trimmedName,
            config: configCopy,
            createdAt: Date.now()
        };

        configs.unshift(newConfig);
        const trimmed = configs.slice(0, 10);

        this.savedConfigs = trimmed;
        localStorage.setItem('workout_timer_configs', JSON.stringify(trimmed));

        if (this.user && this.user.id) {
            try {
                const dbConfig = await saveConfigToSupabase(this.user.id, trimmedName, configCopy);
                const syncedConfig = convertDatabaseConfig(dbConfig);
                const index = this.savedConfigs.findIndex(c => c.id === newConfig.id);
                if (index !== -1) {
                    this.savedConfigs[index] = syncedConfig;
                    localStorage.setItem('workout_timer_configs', JSON.stringify(this.savedConfigs));
                }
                this.syncState.lastSynced = Date.now();
                this.syncState.error = null;
            } catch (error) {
                console.error('[State] Failed to save config to Supabase:', error);
                this.syncState.error = 'Failed to save to cloud. Data saved locally.';
            }
        }
    }

    async deleteSavedConfig(id: string) {
        const filtered = this.savedConfigs.filter(c => c.id !== id);
        this.savedConfigs = filtered;
        localStorage.setItem('workout_timer_configs', JSON.stringify(filtered));

        if (this.user && this.user.id) {
            try {
                await deleteConfigFromSupabase(id);
                this.syncState.lastSynced = Date.now();
                this.syncState.error = null;
            } catch (error) {
                console.error('[State] Failed to delete config from Supabase:', error);
                this.syncState.error = 'Failed to delete from cloud. Data deleted locally.';
            }
        }
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

    showList(): void {
        this.view = 'list';
        this.editingConfigId = null;
    }

    showEditor(configId?: string): void {
        this.editingConfigId = configId || null;
        this.view = 'editor';
    }

    showRunner(): void {
        this.view = 'runner';
    }

    createNewTimer(): void {
        this.config = {
            groups: [{
                id: Date.now().toString(),
                rounds: 1,
                workSeconds: 30,
                pauseSeconds: 10,
            }]
        };
        this.showEditor();
    }

    loadConfigForEdit(id: string): void {
        const config = this.savedConfigs.find(c => c.id === id);
        if (config) {
            this.config = { ...config.config };
            this.editingConfigId = id;
            this.showEditor(id);
        }
    }
}

export const appState = new GlobalState();
