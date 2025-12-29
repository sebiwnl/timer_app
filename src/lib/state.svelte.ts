import { loadConfigs, saveConfig as persistConfig, deleteConfig as persistDelete } from './persistence';
import type { WorkoutConfig, AudioSettings, SavedConfig } from './types';
import { supabase } from './supabaseClient';
import type { User, AuthError as SupabaseAuthError } from '@supabase/supabase-js';

class GlobalState {
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

    async initializeSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error loading session:', error);
            return;
        }
        if (session?.user) {
            this.user = session.user;
        }

        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.user = session?.user ?? null;
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
            } else if (event === 'USER_UPDATED') {
                this.user = session?.user ?? null;
            }
        });
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
