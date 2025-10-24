export type Broadcaster = string;

export type Media = {
    id: number;
    type: "photos" | "video" | string;
    name: string;
    tokens: number;
};

export type Message = {
    color: string;
    bgColor: string | null;
    message: string;
    font: string;
    fromUser?: string;
    toUser?: string;
};

export type Tip = {
    tokens: number;
    isAnon: boolean;
    message: string;
};

export type User = {
    username: string;
    inFanclub: boolean;
    hasTokens: boolean;
    isMod: boolean;
    recentTips: "none" | "some" | "lots" | "tons";
    gender: "m" | "f" | "t" | "c";
    subgender: "" | "tf" | "tm" | "tn";
};

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
    broadcaster: Broadcaster;
    user: User;
}
export interface ChatMessageEvent {
    broadcaster: Broadcaster;
    user: User;
    message: Message;
}
export interface PrivateMessageEvent {
    broadcaster: Broadcaster;
    user: User;
    message: Message;
}
export interface TipEvent {
    broadcaster: Broadcaster;
    tip: Tip;
    user: User;
}
export interface MediaPurchaseEvent {
    broadcaster: Broadcaster;
    user: User;
    media: Media;
}
export interface RoomSubjectChangeEvent {
    broadcaster: Broadcaster;
    subject: string;
}

export type ChaturbateEventObject =
    | BroadcastEvent
    | ChatMessageEvent
    | PrivateMessageEvent
    | TipEvent
    | MediaPurchaseEvent
    | RoomSubjectChangeEvent;