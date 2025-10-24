import { EventEmitter } from "events";
import type { User, Tip, Message, Media } from "../types/events";

export type ChaturbateEventMethod =
  | "broadcastStart"
  | "broadcastStop"
  | "userEnter"
  | "userLeave"
  | "follow"
  | "unfollow"
  | "fanclubJoin"
  | "chatMessage"
  | "privateMessage"
  | "tip"
  | "roomSubjectChange"
  | "mediaPurchase";


export interface BroadcastEvent {
  broadcaster: string;
  user: User;
}

export interface ChatMessageEvent {
  broadcaster: string;
  user: User;
  message: Message;
}

export interface TipEvent {
  broadcaster: string;
  user: User;
  tip: Tip;
}

export interface MediaPurchaseEvent {
  broadcaster: string;
  user: User;
  media: Media;
}

export interface PrivateMessageEvent {
  broadcaster: string;
  user: User;
  message: Message;
}

export interface RoomSubjectChangeEvent {
  broadcaster: string;
  subject: string;
}

export type EventsMap = {
  event: (event: ChaturbateEvent) => void;
  error: (err: unknown) => void;

  broadcastStart: (data: BroadcastEvent) => void;
  broadcastStop: (data: BroadcastEvent) => void;
  chatMessage: (data: ChatMessageEvent) => void;
  privateMessage: (data: PrivateMessageEvent) => void;
  fanclubJoin: (data: BroadcastEvent) => void;
  follow: (data: BroadcastEvent) => void;
  unfollow: (data: BroadcastEvent) => void;
  userEnter: (data: BroadcastEvent) => void;
  userLeave: (data: BroadcastEvent) => void;
  tip: (data: TipEvent) => void;
  roomSubjectChange: (data: RoomSubjectChangeEvent) => void;
  mediaPurchase: (data: MediaPurchaseEvent) => void;
};

export type ChaturbateEvent =
  | { id: string; method: "broadcastStart"; object: BroadcastEvent }
  | { id: string; method: "broadcastStop"; object: BroadcastEvent }
  | { id: string; method: "chatMessage"; object: ChatMessageEvent }
  | { id: string; method: "privateMessage"; object: PrivateMessageEvent }
  | { id: string; method: "fanclubJoin"; object: BroadcastEvent }
  | { id: string; method: "follow"; object: BroadcastEvent }
  | { id: string; method: "unfollow"; object: BroadcastEvent }
  | { id: string; method: "userEnter"; object: BroadcastEvent }
  | { id: string; method: "userLeave"; object: BroadcastEvent }
  | { id: string; method: "tip"; object: TipEvent }
  | { id: string; method: "roomSubjectChange"; object: RoomSubjectChangeEvent }
  | { id: string; method: "mediaPurchase"; object: MediaPurchaseEvent };

export interface EventsClientOptions {
  fetchImpl?: typeof fetch;
  intervalMs?: number;
  onError?: (err: unknown) => void;
}

/**
 * Persistent long-poll client for Chaturbate Events API.
 * Automatically builds URL from username and token.
 */
export class EventsClient extends EventEmitter {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly intervalMs: number;
  private stopped = false;
  private nextUrl: string;

  on<K extends keyof EventsMap>(event: K, listener: EventsMap[K]): this {
    return super.on(event, listener);
  }

  emit<K extends keyof EventsMap>(event: K, ...args: Parameters<EventsMap[K]>): boolean {
    return super.emit(event, ...args);
  }

  constructor(username: string, token: string, opts: EventsClientOptions = {}) {
    super();
    this.baseUrl = `https://eventsapi.chaturbate.com/events/${username}/${token}/`;
    this.nextUrl = this.baseUrl;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.intervalMs = opts.intervalMs ?? 3000;
    if (opts.onError) this.on("error", opts.onError);
  }

  start(): void {
    this.stopped = false;
    this.pollLoop();
  }

  stop(): void {
    this.stopped = true;
  }

  private async pollLoop(): Promise<void> {
    while (!this.stopped) {
      try {
        const res = await this.fetchImpl(this.nextUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const events: ChaturbateEvent[] = data.events ?? [];

        for (const ev of events) {
          this.emit("event", ev);
          this.emit(ev.method as keyof EventsMap, ev.object as any);
        }

        this.nextUrl = data.nextUrl ?? this.baseUrl;
      } catch (err) {
        this.emit("error", err);
        await new Promise((r) => setTimeout(r, this.intervalMs));
      }
    }
  }
}