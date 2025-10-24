# chaturbapi

TypeScript library to interact with the **Chaturbate Affiliate API**.  
Provides a secure and typed way to query clicks, signups, earnings, and tokens.

---

## Installation

```bash
npm install chaturbapi
# or
yarn add chaturbapi
```

Requires **Node.js ≥ 18.17**.

---

## Basic usage

```ts
import { ChaturbAPI } from "chaturbapi";

const api = new ChaturbAPI("your_username", "your_token", {
  timeoutMs: 10_000,
  retries: 2,
});

const stats = await api.getStats({
  range: "last_7_days",
  breakdown: "day",
});

console.log(stats.rows);
```

### Expected response (`AffiliateStatsResponse`)
```json
{
  "range": "last_7_days",
  "breakdown": "day",
  "program": "affiliate",
  "columns": ["date", "clicks", "signups", "revenue"],
  "rows": [
    { "date": "2025-10-01", "clicks": 123, "signups": 12, "revenue": 45.5 },
    { "date": "2025-10-02", "clicks": 110, "signups": 9, "revenue": 33.7 }
  ],
  "totals": { "clicks": 233, "signups": 21, "revenue": 79.2 }
}
```

---

## Client options

```ts
new ChaturbAPI(username, token, {
  baseURL: "https://chaturbate.com", // optional
  timeoutMs: 12000,                  // request timeout
  retries: 2,                        // automatic retries
  headers: { "User-Agent": "chaturbapi/1.0" }, // custom headers
  beforeRequest: (url) => console.log("➡️", url),
  afterResponse: (url, status) => console.log("⬅️", status)
});
```

---

## Available methods

### `getStats(query?: AffiliateStatsQuery)`

Retrieves affiliate statistics.

#### Parameters
| Name | Type | Description |
|--------|------|-------------|
| `range` | `"today" \| "yesterday" \| "last_7_days" \| "last_30_days" \| "this_month" \| "last_month" \| "this_year"` | Date range. |
| `breakdown` | `"none" \| "day" \| "month" \| "program"` | Level of breakdown. |
| `program` | `"affiliate" \| "revshare" \| "ppv" \| "tokens"` | Program type. |

#### Returns
`Promise<AffiliateStatsResponse>`

---

## Real-time Events (EventsClient)

The `EventsClient` class provides a persistent connection to the **Chaturbate Events API**, allowing you to receive live notifications such as user entries, tips, chat messages, and more.

### Basic usage

```ts
import { EventsClient } from "chaturbapi";

const events = new EventsClient("your_username", "your_events_token");

// Listen for specific events
events.on("broadcastStart", ({ broadcaster, user }) => {
  console.log(`📡 ${broadcaster} started streaming`);
});

events.on("tip", ({ user, tip }) => {
  console.log(`💰 ${user.username} sent ${tip.tokens} tokens`);
});

events.on("chatMessage", ({ user, message }) => {
  console.log(`💬 ${user.username}: ${message.message}`);
});

// Generic listener
events.on("event", (e) => console.log(`[Raw Event]`, e));

// Handle errors
events.on("error", (err) => console.error("Stream error:", err));

// Start listening
events.start();
```

### Supported events

| Event | Description | Payload Type |
|--------|--------------|---------------|
| `broadcastStart` | Broadcaster started streaming | `BroadcastEvent` |
| `broadcastStop` | Broadcast ended | `BroadcastEvent` |
| `userEnter` | A user entered the room | `BroadcastEvent` |
| `userLeave` | A user left the room | `BroadcastEvent` |
| `follow` | User followed the broadcaster | `BroadcastEvent` |
| `unfollow` | User unfollowed the broadcaster | `BroadcastEvent` |
| `fanclubJoin` | User joined the fanclub | `BroadcastEvent` |
| `chatMessage` | Public chat message | `ChatMessageEvent` |
| `privateMessage` | Private message | `PrivateMessageEvent` |
| `tip` | User sent a tip | `TipEvent` |
| `roomSubjectChange` | Broadcaster updated room subject | `RoomSubjectChangeEvent` |
| `mediaPurchase` | Media (photo/video) purchased | `MediaPurchaseEvent` |

### Strongly typed payloads

Each event type has its own structure. Examples:

```ts
events.on("tip", ({ broadcaster, user, tip }) => {
  // user.username, tip.tokens, tip.isAnon, tip.message
});

events.on("chatMessage", ({ broadcaster, user, message }) => {
  // user.username, message.message, message.color
});

events.on("mediaPurchase", ({ broadcaster, user, media }) => {
  // media.name, media.tokens, media.type
});
```

These types are automatically inferred in TypeScript, so you get full IntelliSense support per event type.

---

## Main types

### `AffiliateStatsResponse`
```ts
interface AffiliateStatsResponse {
  range: string;
  breakdown: string;
  program?: string;
  columns: string[];
  rows: Record<string, any>[];
  totals?: Record<string, any>;
}
```

### `AffiliateStatsQuery`
```ts
interface AffiliateStatsQuery {
  range?: string;
  breakdown?: string;
  program?: string;
}
```

---

## Events

`ChaturbAPI` implements a simple typed EventEmitter.

```ts
api.on("statsUpdated", (data) => {
  console.log("Updated stats:", data);
});

api.on("error", (err) => {
  console.error("API error:", err);
});
```

| Event | Description |
|--------|--------------|
| `statsUpdated` | Triggered when a successful response is received. |
| `error` | Triggered when a network or HTTP error occurs. |

---

## Error handling

Network or API errors throw an `HTTPError` exception:

```ts
import { HTTPError } from "chaturbapi";

try {
  await api.getStats({ range: "today" });
} catch (err) {
  if (err instanceof HTTPError) {
    console.error("HTTP failure:", err.status, err.body);
  } else {
    console.error("Unexpected error:", err);
  }
}
```

---

## Example use cases

### 1. Weekly summary
```ts
const stats = await api.getStats({ range: "last_7_days", breakdown: "day" });
console.table(stats.rows);
```

### 2. Log API errors
```ts
api.on("error", (e) => {
  // Send to your monitoring system
  console.error("[ALERT] Chaturbate API failure:", e);
});
```

### 3. Monthly dashboard totals
```ts
const { totals } = await api.getStats({ range: "this_month" });
console.log("Clicks:", totals?.clicks, "Revenue:", totals?.revenue);
```

### 4. Run multiple queries in parallel
```ts
const [today, month] = await Promise.all([
  api.getStats({ range: "today" }),
  api.getStats({ range: "this_month" }),
]);
```

---

## Events summary

| Event             | Main Properties                     | Notes                                     |
|-------------------|-------------------------------------|-------------------------------------------|
| broadcastStart    | broadcaster, user                   | Triggered when stream starts              |
| broadcastStop     | broadcaster, user                   | Triggered when stream stops               |
| userEnter         | broadcaster, user                   | User enters room                          |
| userLeave         | broadcaster, user                   | User leaves room                          |
| follow            | broadcaster, user                   | User followed broadcaster                 |
| unfollow          | broadcaster, user                   | User unfollowed broadcaster               |
| fanclubJoin       | broadcaster, user                   | User joined fanclub                       |
| chatMessage       | broadcaster, user, message          | Public chat message                       |
| privateMessage    | broadcaster, user, message          | Private message (to broadcaster)          |
| tip               | broadcaster, user, tip              | User sent tokens                          |
| roomSubjectChange | broadcaster, user, subject          | Room subject updated                      |
| mediaPurchase     | broadcaster, user, media            | Media (photo/video) purchased             |

All events contain at least `broadcaster` and `user` fields.

### Example: Using ChaturbAPI and EventsClient together

```ts
import { ChaturbAPI, EventsClient } from "chaturbapi";

const api = new ChaturbAPI("user", "token");
const events = new EventsClient("user", "event_token");

const stats = await api.getStats({ range: "today" });
console.log("Current clicks:", stats.totals?.clicks);

events.on("tip", ({ user, tip }) => {
  console.log(`${user.username} tipped ${tip.tokens} tokens`);
});

events.start();
```

---

## License

MIT © [Nikita Contreras](https://github.com/nikitacontreras)

---
