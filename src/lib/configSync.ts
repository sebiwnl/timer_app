import { supabase } from './supabaseClient';
import type { DatabaseConfig, SavedConfig, WorkoutConfig } from './types';

export async function fetchConfigsFromSupabase(userId: string): Promise<DatabaseConfig[]> {
	const { data, error } = await supabase
		.from('workout_configs')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('[ConfigSync] Failed to fetch configs:', error);
		throw error;
	}

	return data || [];
}

export async function saveConfigToSupabase(
	userId: string,
	name: string,
	config: WorkoutConfig
): Promise<DatabaseConfig> {
	const { data, error } = await supabase
		.from('workout_configs')
		.insert({
			user_id: userId,
			name,
			config
		})
		.select()
		.single();

	if (error) {
		console.error('[ConfigSync] Failed to save config:', error);
		throw error;
	}

	return data;
}

export async function updateConfigInSupabase(
	configId: string,
	name: string,
	config: WorkoutConfig
): Promise<DatabaseConfig> {
	const { data, error } = await supabase
		.from('workout_configs')
		.update({
			name,
			config
		})
		.eq('id', configId)
		.select()
		.single();

	if (error) {
		console.error('[ConfigSync] Failed to update config:', error);
		throw error;
	}

	return data;
}

export async function deleteConfigFromSupabase(configId: string): Promise<void> {
	const { error } = await supabase
		.from('workout_configs')
		.delete()
		.eq('id', configId);

	if (error) {
		console.error('[ConfigSync] Failed to delete config:', error);
		throw error;
	}
}

export function convertDatabaseConfig(dbConfig: DatabaseConfig): SavedConfig {
	return {
		id: dbConfig.id,
		name: dbConfig.name,
		config: dbConfig.config,
		createdAt: new Date(dbConfig.created_at).getTime()
	};
}

export function convertToDatabaseConfig(userId: string, savedConfig: SavedConfig) {
	return {
		user_id: userId,
		name: savedConfig.name,
		config: savedConfig.config
	};
}
