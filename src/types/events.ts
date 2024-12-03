export type Broadcaster = {
    type: string;
};

export type Media = {
    id: number;
    type: "photos" | "video";
    name: string;
    tokens: number;
};

export type Message = {
    color: string;
    bgColor: string | null;
    message: string;
    font: string;
    fromUser: string;
    toUser: string;
};

export type Subject = {
    type: string;
};

export type Tip = {
    tokens: number;
    isAnon: boolean;
    message: string;
};

export type User = {
    user: string;
    inFanclub: boolean;
    hasTokens: boolean;
    isMod: boolean;
    recentTips: "none" | "some" | "lots" | "tons";
    gender: "m" | "f" | "t" | "c";
    subgender: "" | "tf" | "tm" | "tn";
};