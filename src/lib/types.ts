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