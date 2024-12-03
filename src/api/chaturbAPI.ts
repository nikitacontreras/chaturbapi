import { AffiliateStatsResponse } from "../types";
import { fetchStatsFromAPI } from "../utils/fetch";

export class ChaturbAPI {
	private username: string;
	private token: string;
	private eventListeners: { [key: string]: Function[] } = {};

	constructor(username: string, token: string) {
		this.username = username;
		this.token = token;
	}

	public on(event: string, listener: Function): void {
		if (!this.eventListeners[event]) {
			this.eventListeners[event] = [];
		}
		this.eventListeners[event].push(listener);
	}

	private emit(event: string, data: any): void {
		if (this.eventListeners[event]) {
			this.eventListeners[event].forEach((listener) => listener(data));
		}
	}

	public async getStats(): Promise<AffiliateStatsResponse> {
		try {
			const statsData = await fetchStatsFromAPI(this.username, this.token);
			this.emit("statsUpdated", statsData);
			return statsData;
		} catch (error) {
			console.error("Error fetching stats:", error);
			throw error;
		}
	}
}
