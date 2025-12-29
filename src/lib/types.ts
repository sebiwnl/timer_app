export interface RoundGroup {
	id: string;
	rounds: number;
	workSeconds: number;
	pauseSeconds: number;
}

export interface WorkoutConfig {
	groups: RoundGroup[];
}

export interface TimerState {
	// Added 'paused' to represent user-initiated pause
	status: 'idle' | 'countdown' | 'work' | 'pause' | 'paused' | 'complete';
	currentGroupIndex: number;
	currentRound: number;
	remainingSeconds: number;
	totalElapsed: number;
	// when user-paused, `prevStatus` stores the phase that was paused (work/pause/countdown)
	prevStatus?: 'countdown' | 'work' | 'pause' | undefined;
}

export interface AudioSettings {
	sound: boolean;
	vibration: boolean;
}

export interface SavedConfig {
	id: string;
	name: string;
	config: WorkoutConfig;
	createdAt: number;
}

export interface AuthError {
	message: string;
}

export interface AuthState {
	loading: boolean;
	error: string | null;
}

export interface DatabaseConfig {
	id: string;
	user_id: string;
	name: string;
	config: WorkoutConfig;
	created_at: string;
	updated_at: string;
}

export interface SyncState {
	loading: boolean;
	lastSynced: number | null;
	error: string | null;
}