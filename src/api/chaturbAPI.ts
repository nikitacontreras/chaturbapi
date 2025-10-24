import type {
	AffiliateStatsQuery,
	AffiliateStatsResponse,
} from "../types";
import { getAffiliateStats, type RequestOptions } from "../utils/http";

type EventMap = {
	statsUpdated: (data: AffiliateStatsResponse) => void;
	error: (error: unknown) => void;
};

export type ChaturbAPIOptions = RequestOptions;

export class ChaturbAPI {
	private readonly username: string;
	private readonly token: string;
	private readonly opts: ChaturbAPIOptions;
	private readonly listeners: { [K in keyof EventMap]?: EventMap[K][] } = {};

	constructor(username: string, token: string, opts: ChaturbAPIOptions = {}) {
		this.username = username;
		this.token = token;
		this.opts = opts;
	}

	on<K extends keyof EventMap>(event: K, listener: EventMap[K]): void {
		const key = event as keyof EventMap;
		const list = (this.listeners[key] as EventMap[K][] | undefined) ?? [];
		list.push(listener);
		this.listeners[key] = list as any;
	}

	off<K extends keyof EventMap>(event: K, listener: EventMap[K]): void {
		const arr = this.listeners[event];
		if (!arr) return;
		const i = arr.indexOf(listener);
		if (i >= 0) arr.splice(i, 1);
	}

	private emit<K extends keyof EventMap>(
		event: K,
		...args: Parameters<EventMap[K]>
	): void {
		const list = this.listeners[event];
		if (!list) return;
		for (const fn of list) {
			(fn as any).apply(null, args);
		}
	}

	async getStats(
		query?: AffiliateStatsQuery
	): Promise<AffiliateStatsResponse> {
		try {
			const stats = await getAffiliateStats(
				this.username,
				this.token,
				query,
				this.opts
			);
			this.emit("statsUpdated", stats);
			return stats;
		} catch (e) {
			this.emit("error", e);
			throw e;
		}
	}
}