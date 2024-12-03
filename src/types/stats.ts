export type UserStats = {
	username: string;
	token_balance: number;
	tips_in_last_hour: number | null;
	votes_up: number;
	votes_down: number;
	satisfaction_score: number;
	last_broadcast: string | -1;
	time_online: number;
	num_followers: number;
	num_viewers: number;
	num_registered_viewers: number;
	num_tokened_viewers: number;
};
